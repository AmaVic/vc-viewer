use actix_web::{get, HttpResponse, Responder};

/// Health check endpoint for container orchestration
#[get("/_health")]
pub async fn health_check() -> impl Responder {
    HttpResponse::Ok().body("OK")
} 