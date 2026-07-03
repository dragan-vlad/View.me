use axum::{response::IntoResponse, routing::get, Json, Router};
use serde_json::Value;
use std::fs;
use std::net::SocketAddr;
use tower_http::services::ServeDir;

#[tokio::main]
async fn main() {
    let serve_dir = ServeDir::new("../");

    let app = Router::new()
        .route("/api/exercises", get(get_exercises))
        .fallback_service(serve_dir);

    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    println!("Server running at: http://localhost:3000");

    axum::serve(listener, app).await.unwrap();
}

async fn get_exercises() -> impl IntoResponse {
    match fs::read_to_string("data.commands.json") {
        Ok(raw_text) => {
            let json_data: Value = serde_json::from_str(&raw_text).unwrap();
            Json(json_data).into_response()
        }
        Err(_) => {
            // Send a 500 error if the file can't be read
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "Failed to read database").into_response()
        }
    }
}