use axum::{
    extract::Json,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::env;
use std::fs;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio_native_tls::native_tls;
use tower_http::services::ServeDir;
use mail_parser::Message;
use tokio_util::compat::TokioAsyncReadCompatExt;
use futures_util::StreamExt;

#[derive(Serialize, Deserialize, Clone)]
struct Rule {
    id: String,
    enabled: bool,
    category: String,
    match_field: String,
    match_value: String,
}

#[derive(Serialize)]
struct TelegramPayload<'a> {
    chat_id: &'a str,
    text: String,
    parse_mode: &'a str,
}

type SharedChecklist = Arc<Mutex<Vec<Rule>>>;

#[tokio::main]
async fn main() {
    let serve_dir = ServeDir::new("../");

    let initial_rules = load_checklist_from_file();
    let checklist_state: SharedChecklist = Arc::new(Mutex::new(initial_rules));

    let mail_checklist = Arc::clone(&checklist_state);
    tokio::spawn(async move {
        if let Err(e) = run_mail_listener(mail_checklist).await {
            println!("[MAIL DAEMON ERROR] {}", e);
        }
    });

    let state_for_routes = Arc::clone(&checklist_state);

    let app = Router::new()
        .route("/api/exercises", get(get_exercises))
        .route(
            "/api/mail-checklist",
            get(move || get_checklist(Arc::clone(&state_for_routes))),
        )
        .route(
            "/api/mail-checklist",
            post(move |body| update_checklist(Arc::clone(&checklist_state), body)),
        )
        .fallback_service(serve_dir);

    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    println!("Server running at: http://localhost:3000");

    axum::serve(listener, app).await.unwrap();
}

fn load_checklist_from_file() -> Vec<Rule> {
    fs::read_to_string("data/mail-checklist.json")
        .ok()
        .and_then(|data| serde_json::from_str(&data).ok())
        .unwrap_or_default()
}

async fn get_exercises() -> impl IntoResponse {
    match fs::read_to_string("data/commands.json") {
        Ok(raw_text) => {
            let json_data: Value = serde_json::from_str(&raw_text).unwrap();
            Json(json_data).into_response()
        }
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Failed to read database").into_response(),
    }
}

async fn get_checklist(state: SharedChecklist) -> impl IntoResponse {
    let rules = state.lock().await;
    Json(rules.clone()).into_response()
}

async fn update_checklist(state: SharedChecklist, Json(new_rules): Json<Vec<Rule>>) -> impl IntoResponse {
    let mut rules = state.lock().await;
    *rules = new_rules.clone();

    if let Ok(json_str) = serde_json::to_string_pretty(&*rules) {
        let _ = fs::write("data/mail-checklist.json", json_str);
    }

    (StatusCode::OK, "Checklist updated").into_response()
}

// Mail Listener Loop & Telegram Dispatcher
async fn run_mail_listener(checklist: SharedChecklist) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let imap_server = env::var("IMAP_SERVER").unwrap_or_else(|_| "imap.gmail.com".to_string());
    let imap_user = match env::var("IMAP_USER") {
        Ok(val) => val,
        Err(_) => {
            println!("[MAIL DAEMON] IMAP_USER not set. Skipping mail daemon start.");
            return Ok(());
        }
    };
    let imap_pass = env::var("IMAP_PASS").unwrap_or_default();

    println!("[MAIL DAEMON] Active & ready.");

    loop {
        println!("[MAIL DAEMON] Connecting to IMAP server...");
        let tls = native_tls::TlsConnector::builder().build()?;
        let tokio_tls = tokio_native_tls::TlsConnector::from(tls);

        let addr = format!("{}:993", imap_server);
        let tcp_stream = match tokio::net::TcpStream::connect(&addr).await {
            Ok(s) => s,
            Err(e) => {
                println!("[MAIL DAEMON] Connection error: {}. Retrying in 10s...", e);
                tokio::time::sleep(std::time::Duration::from_secs(10)).await;
                continue;
            }
        };

        let tls_stream = match tokio_tls.connect(&imap_server, tcp_stream).await {
            Ok(s) => s,
            Err(e) => {
                println!("[MAIL DAEMON] TLS error: {}. Retrying in 10s...", e);
                tokio::time::sleep(std::time::Duration::from_secs(10)).await;
                continue;
            }
        };

        let compat_stream = tls_stream.compat();
        let client = async_imap::Client::new(compat_stream);

        let mut session = match client.login(&imap_user, &imap_pass).await {
            Ok(s) => s,
            Err((e, _)) => {
                println!("[MAIL DAEMON] Auth error: {}. Retrying in 10s...", e);
                tokio::time::sleep(std::time::Duration::from_secs(10)).await;
                continue;
            }
        };

        if let Err(e) = session.select("INBOX").await {
            println!("[MAIL DAEMON] Select INBOX error: {}. Retrying...", e);
            continue;
        }

        println!("[MAIL DAEMON] Listening via IMAP IDLE...");

        let mut idle = session.idle();
        if let Err(e) = idle.init().await {
            println!("[MAIL DAEMON] IDLE error: {}. Reconnecting...", e);
            continue;
        }

        let tcp_stream = tokio::net::TcpStream::connect(&addr).await?;
        let tls_stream = tokio_tls.connect(&imap_server, tcp_stream).await?;
        let client = async_imap::Client::new(tls_stream.compat());
        let mut fetch_session = client.login(&imap_user, &imap_pass).await.map_err(|e| e.0)?;
        fetch_session.select("INBOX").await?;

        println!("[MAIL DAEMON] Fetching new payload...");

        // Scoped block to ensure `fetches` drops and releases its borrow on `fetch_session`
        {
            let mut fetches = fetch_session.fetch("*", "(BODY[])").await?;

            while let Some(result) = fetches.next().await {
                if let Ok(message) = result {
                    if let Some(body) = message.body() {
                        if let Some(parsed) = Message::parse(body) {
                            let sender = match parsed.from() {
                                mail_parser::HeaderValue::Address(addr) => {
                                    addr.address.as_deref().unwrap_or("Unknown")
                                }
                                mail_parser::HeaderValue::AddressList(addrs) => {
                                    addrs.first().and_then(|a| a.address.as_deref()).unwrap_or("Unknown")
                                }
                                _ => "Unknown",
                            };

                            let subject = parsed.subject().unwrap_or("No Subject");
                            let body_text = parsed
                                .body_text(0)
                                .unwrap_or(std::borrow::Cow::Borrowed(""));

                            evaluate_rules(&checklist, sender, subject, &body_text).await;
                        }
                    }
                }
            }
        } // `fetches` drops here, releasing `fetch_session`

        let _ = fetch_session.logout().await;
    }
}

async fn evaluate_rules(checklist: &SharedChecklist, sender: &str, subject: &str, body: &str) {
    let rules = checklist.lock().await;
    for rule in rules.iter() {
        if !rule.enabled {
            continue;
        }

        let target = match rule.match_field.as_str() {
            "from" => sender,
            "subject" => subject,
            "body" => body,
            _ => "",
        };

        if target.to_lowercase().contains(&rule.match_value.to_lowercase()) {
            println!("[MAIL MATCH] Triggered category: {}", rule.category);
            let _ = send_telegram(&rule.category, sender, subject).await;
            break;
        }
    }
}

async fn send_telegram(category: &str, sender: &str, subject: &str) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let token = env::var("TELEGRAM_BOT_TOKEN")?;
    let chat_id = env::var("TELEGRAM_CHAT_ID")?;

    let client = reqwest::Client::new();
    let message = format!(
        "📬 *NEW MATCHED EMAIL [{}]*\n\n*From:* {}\n*Subject:* {}",
        category, sender, subject
    );

    let payload = TelegramPayload {
        chat_id: &chat_id,
        text: message,
        parse_mode: "Markdown",
    };

    let url = format!("https://api.telegram.org/bot{}/sendMessage", token);
    client.post(&url).json(&payload).send().await?;
    Ok(())
}