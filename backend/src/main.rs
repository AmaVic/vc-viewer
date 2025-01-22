use actix_files as fs;
use actix_web::{web, App, HttpResponse, Result, error, middleware::Logger, HttpServer};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use log::{info, error, debug};

#[derive(Debug, Serialize, Deserialize)]
struct Issuer {
    id: String,
    #[serde(default)]
    name: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(untagged)]
enum IssuerType {
    String(String),
    Object(Issuer),
}

#[derive(Debug, Serialize, Deserialize)]
struct VerifiableCredential {
    #[serde(rename = "@context")]
    context: Vec<String>,
    id: Option<String>,
    #[serde(rename = "type")]
    credential_type: Vec<String>,
    issuer: IssuerType,
    issuanceDate: String,
    credentialSubject: Value,
}

#[derive(Debug, Serialize, Deserialize)]
struct VerifiablePresentation {
    #[serde(rename = "@context")]
    context: Vec<String>,
    #[serde(rename = "type")]
    presentation_type: Vec<String>,
    verifiableCredential: Vec<VerifiableCredential>,
}

async fn index() -> Result<HttpResponse> {
    debug!("Serving index page");
    Ok(HttpResponse::Ok()
        .content_type("text/html")
        .body(include_str!("../../frontend/src/templates/index.html")))
}

async fn process_credential(credential: web::Json<VerifiableCredential>) -> Result<HttpResponse> {
    info!("Processing credential: {:?}", credential);
    
    // Validate credential
    if credential.context.is_empty() {
        error!("Invalid credential: context is empty");
        return Ok(HttpResponse::BadRequest().json(json!({
            "error": "Invalid credential: context is empty"
        })));
    }

    if credential.credential_type.is_empty() {
        error!("Invalid credential: type is empty");
        return Ok(HttpResponse::BadRequest().json(json!({
            "error": "Invalid credential: type is empty"
        })));
    }

    // Validate issuance date format
    if let Err(e) = chrono::DateTime::parse_from_rfc3339(&credential.issuanceDate) {
        error!("Invalid issuance date format: {}", e);
        return Ok(HttpResponse::BadRequest().json(json!({
            "error": format!("Invalid issuance date format: {}", e)
        })));
    }

    debug!("Credential processed successfully");
    Ok(HttpResponse::Ok().json(credential.0))
}

async fn process_presentation(presentation: web::Json<VerifiablePresentation>) -> Result<HttpResponse> {
    info!("Processing presentation: {:?}", presentation);
    
    // Validate presentation
    if presentation.context.is_empty() {
        error!("Invalid presentation: context is empty");
        return Ok(HttpResponse::BadRequest().json(json!({
            "error": "Invalid presentation: context is empty"
        })));
    }

    if presentation.presentation_type.is_empty() {
        error!("Invalid presentation: type is empty");
        return Ok(HttpResponse::BadRequest().json(json!({
            "error": "Invalid presentation: type is empty"
        })));
    }

    if presentation.verifiableCredential.is_empty() {
        error!("Invalid presentation: no credentials found");
        return Ok(HttpResponse::BadRequest().json(json!({
            "error": "Invalid presentation: no credentials found"
        })));
    }

    debug!("Presentation processed successfully");
    Ok(HttpResponse::Ok().json(presentation.0))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    info!("Starting server at http://127.0.0.1:8080");

    HttpServer::new(|| {
        App::new()
            .wrap(Logger::default())
            .wrap(Logger::new("%a %r %s %b %{Referer}i %{User-Agent}i %T"))
            // Serve static files from the frontend directory
            .service(fs::Files::new("/static/css", "../frontend/src/css"))
            .service(fs::Files::new("/static/js", "../frontend/src/js"))
            .service(fs::Files::new("/static", "../frontend/public"))
            .route("/", web::get().to(index))
            .route("/process-credential", web::post().to(process_credential))
            .route("/process-presentation", web::post().to(process_presentation))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
} 