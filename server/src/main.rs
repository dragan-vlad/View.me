use axum::{
    extract::Json,
    http::StatusCode,
    response::IntoResponse,
    routing::{
        get,
        post
    },
    Router
};
use serde::{
    Deserialize,
    Serialize
};
use serde_json::Value;
use std::env;
use std::fs;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio_native_tls::native_tls;
use tower_http::services::ServeDir;
use async_imap::extensions::idle::IdleResponse;
use mail_parser::MessageParser;

#[derive(Serialize, Deserialize, Clone)]
struct Rule {
    id: String,
    enabled: bool,
    category: String,
    match_field: String,
    match_value: String
}

#[derive(Serialize)]
struct TelegramPayload<'a> {
    chat_id: &'a str,
    text: String,
    parse_mode: &'a str
}

type SharedChecklist = Arc<Mutex<Vec<Rule>>>;

#[tokio::main]
async fn main() {
    let serve_dir = ServeDir::new("../");

    // Load initial checklist rules into shared thread-safe memory
    let initial_rules = load_checklist_from_file();
    let checklist_state: SharedChecklist = Arc::new(Mutex::new(initial_rules));

    // Spawn the background IMAP mail listener task
    let mail_checklist = Arc::clone(&checklist_state);
    tokio::spawn(async move {
        if let Err(e) = run_mail_listener(mail_checklist).await {
            println!("[MAIL DAEMON ERROR] {}", e);
        }
    });

    // Pass shared checklist state into web endpoints
    let state_for_routes = Arc::clone(&checklist_state);

    let app = Router::new()
        .route("/api/exercises", get(get_exercises))
        .route(
            "/api/checklist",
            get(move || get_checklist(Arc::clone(&state_for_routes)))
        )
        .route(
            "/api/checklist",
            post(move |body| update_checklist(Arc::clone(&checklist_state), body))
        )
        .fallback_service(serve_dir);

    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    println!("Server running at: http://localhost:3000");

    axum::serve(listener, app).await.unwrap();
}

fn load_checklist_from_file() -> Vec<Rule> {
    fs::read_to_string("checklist.json")
        .ok()
        .and_then(|data| serde_json::from_str(&data).ok())
        .unwrap_or_default()
}

async fn get_exercises() -> impl IntoResponse {
    match fs::read_to_string("data.commands.json") {
        Ok(raw_text) => {
            let json_data: Value = serde_json::from_str(&raw_text).unwrap();
            Json(json_data).into_response()
        }
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Failed to read database").into_response()
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
        let _ = fs::write("checklist.json", json_str);
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

    println!("[MAIL DAEMON] Connecting to IMAP server...");
    let tls = native_tls::TlsConnector::builder().build()?;
    let tokio_tls = tokio_native_tls::TlsConnector::from(tls);

    let client = async_imap::connect((imap_server.as_str(), 993), &imap_server, tokio_tls).await?;
    let mut session = client.login(&imap_user, &imap_pass).await.map_err(|e| e.0)?;

    session.select("INBOX").await?;
    println!("[MAIL DAEMON] Active & listening via IMAP IDLE...");

    loop {
        let mut idle = session.idle();
        idle.init().await?;

        let (mut stream, _unidle) = idle
            .wait_while(|res| match res {
                IdleResponse::NewData(_) => false,
                _ => true
            })
            .await?;

        if stream.next().await.is_some() {
            let fetches = session.fetch("*", "(BODY[])").await?;
            for message in fetches.iter() {
                if let Some(body) = message.body() {
                    if let Some(parsed) = MessageParser::default().parse(body) {
                        let sender = parsed
                            .from()
                            .and_then(|f| f.first())
                            .map(|a| a.address().unwrap_or(""))
                            .unwrap_or("Unknown");
                        let subject = parsed.subject().unwrap_or("No Subject");
                        let body_text = parsed.body_text(0).unwrap_or("");

                        evaluate_rules(&checklist, sender, subject, &body_text).await;
                    }
                }
            }
        }
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
            _ => ""
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