use actix_files as fs;
use actix_web::{web, App, HttpResponse, Result, middleware::Logger, HttpServer};
use log::{info, debug, error};
use tera::Tera;
use std::path::PathBuf;

// Initialize Tera with templates
fn init_templates() -> Tera {
    let template_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .join("frontend/src/templates/**/*.html");
    
    info!("Loading templates from: {:?}", template_path);
    
    let tera = match Tera::new(template_path.to_str().unwrap()) {
        Ok(t) => {
            info!("Successfully loaded templates");
            debug!("Available templates: {:?}", t.get_template_names().collect::<Vec<_>>());
            t
        },
        Err(e) => {
            error!("Template parsing error(s): {}", e);
            ::std::process::exit(1);
        }
    };
    tera
}

// Page handlers with template rendering
async fn index(tmpl: web::Data<Tera>) -> Result<HttpResponse> {
    debug!("Serving index page");
    let mut ctx = tera::Context::new();
    ctx.insert("current_page", "home");
    
    let rendered = tmpl.render("pages/index.html", &ctx)
        .map_err(|e| {
            error!("Template error: {}", e);
            actix_web::error::ErrorInternalServerError("Template error")
        })?;
    
    Ok(HttpResponse::Ok()
        .content_type("text/html")
        .body(rendered))
}

async fn viewer(
    tmpl: web::Data<Tera>,
    query: web::Query<std::collections::HashMap<String, String>>
) -> Result<HttpResponse> {
    debug!("Serving viewer page");
    let mut ctx = tera::Context::new();
    ctx.insert("current_page", "viewer");
    
    if let Some(theme) = query.get("theme") {
        debug!("Theme parameter provided: {}", theme);
        ctx.insert("selected_theme", theme);
    }
    
    let rendered = tmpl.render("pages/viewer.html", &ctx)
        .map_err(|e| {
            error!("Template error: {}", e);
            actix_web::error::ErrorInternalServerError("Template error")
        })?;
    
    Ok(HttpResponse::Ok()
        .content_type("text/html")
        .body(rendered))
}

async fn themes(tmpl: web::Data<Tera>) -> Result<HttpResponse> {
    debug!("Serving themes page");
    let mut ctx = tera::Context::new();
    ctx.insert("current_page", "themes");
    
    let rendered = tmpl.render("pages/themes.html", &ctx)
        .map_err(|e| {
            error!("Template error: {}", e);
            actix_web::error::ErrorInternalServerError("Template error")
        })?;
    
    Ok(HttpResponse::Ok()
        .content_type("text/html")
        .body(rendered))
}

async fn docs(tmpl: web::Data<Tera>) -> Result<HttpResponse> {
    debug!("Serving documentation page");
    let mut ctx = tera::Context::new();
    ctx.insert("current_page", "docs");
    
    let rendered = tmpl.render("pages/docs.html", &ctx)
        .map_err(|e| {
            error!("Template error: {}", e);
            actix_web::error::ErrorInternalServerError("Template error")
        })?;
    
    Ok(HttpResponse::Ok()
        .content_type("text/html")
        .body(rendered))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("debug"));
    info!("Starting server at http://127.0.0.1:8080");

    // Initialize templates
    let tera = web::Data::new(init_templates());

    HttpServer::new(move || {
        App::new()
            .app_data(tera.clone())
            .wrap(Logger::default())
            .wrap(Logger::new("%a %r %s %b %{Referer}i %{User-Agent}i %T"))
            // Serve static files from the frontend directory
            .service(fs::Files::new("/frontend/src/themes", "../frontend/src/themes").show_files_listing())
            .service(fs::Files::new("/frontend/src/js", "../frontend/src/js").show_files_listing())
            .service(fs::Files::new("/frontend/src/css", "../frontend/src/css").show_files_listing())
            .service(fs::Files::new("/frontend/src/images", "../frontend/src/images").show_files_listing())
            // Main routes
            .route("/", web::get().to(index))
            .route("/viewer", web::get().to(viewer))
            .route("/themes", web::get().to(themes))
            .route("/docs", web::get().to(docs))
    })
    .bind("127.0.0.1:8080")?
    .workers(2)
    .run()
    .await
} 