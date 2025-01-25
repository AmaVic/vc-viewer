use actix_files as fs;
use actix_web::{web, App, HttpResponse, Result, middleware::Logger, HttpServer};
use log::{info, debug, error};
use tera::Tera;
use std::path::PathBuf;
use chrono::Local;
use std::fs::OpenOptions;
use std::io::Write;

// Custom writer that writes to both file and stderr
struct MultiOutput {
    file: std::fs::File,
}

impl MultiOutput {
    fn new(file: std::fs::File) -> Self {
        MultiOutput { file }
    }
}

impl Write for MultiOutput {
    fn write(&mut self, buf: &[u8]) -> std::io::Result<usize> {
        std::io::stderr().write_all(buf)?;
        self.file.write_all(buf)?;
        Ok(buf.len())
    }

    fn flush(&mut self) -> std::io::Result<()> {
        std::io::stderr().flush()?;
        self.file.flush()
    }
}

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

// Initialize logger with custom format based on build profile
fn init_logger() {
    // Create logs directory if it doesn't exist
    std::fs::create_dir_all("logs").expect("Failed to create logs directory");
    
    let log_file = format!("logs/vc-viewer-{}.log", Local::now().format("%Y-%m-%d_%H-%M-%S"));
    let file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_file)
        .unwrap();

    let mut builder = env_logger::Builder::new();
    
    // Set default level to Info
    builder.filter_level(log::LevelFilter::Info);
    
    // Set format for all modes
    builder.format(|buf, record| {
        writeln!(
            buf,
            "{} [{}] {}",
            Local::now().format("%Y-%m-%d %H:%M:%S"),
            record.level(),
            record.args(),
        )
    });

    // Write to both file and stderr
    builder.target(env_logger::Target::Pipe(Box::new(MultiOutput::new(file))));
    
    // Initialize the logger
    builder.init();
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

async fn create_theme(tmpl: web::Data<Tera>) -> Result<HttpResponse> {
    debug!("Serving theme creation documentation page");
    let mut ctx = tera::Context::new();
    ctx.insert("current_page", "docs");
    
    let rendered = tmpl.render("pages/create-theme.html", &ctx)
        .map_err(|e| {
            error!("Template error: {}", e);
            actix_web::error::ErrorInternalServerError("Template error")
        })?;
    
    Ok(HttpResponse::Ok()
        .content_type("text/html")
        .body(rendered))
}

async fn privacy(tmpl: web::Data<Tera>) -> Result<HttpResponse> {
    debug!("Serving privacy policy page");
    let mut ctx = tera::Context::new();
    ctx.insert("current_page", "privacy");
    
    let rendered = tmpl.render("pages/privacy.html", &ctx)
        .map_err(|e| {
            error!("Template error: {}", e);
            actix_web::error::ErrorInternalServerError("Template error")
        })?;
    
    Ok(HttpResponse::Ok()
        .content_type("text/html")
        .body(rendered))
}

async fn cookies(tmpl: web::Data<Tera>) -> Result<HttpResponse> {
    debug!("Serving cookie policy page");
    let mut ctx = tera::Context::new();
    ctx.insert("current_page", "cookies");
    
    let rendered = tmpl.render("pages/cookies.html", &ctx)
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
    init_logger();
    info!("Starting server at http://127.0.0.1:8080");

    // Initialize templates
    let tera = web::Data::new(init_templates());

    HttpServer::new(move || {
        let logger = if cfg!(debug_assertions) {
            Logger::new("%a %r %s %b %{Referer}i %{User-Agent}i %T")
        } else {
            Logger::new("%r %s %D")
        };

        App::new()
            .app_data(tera.clone())
            .wrap(logger)
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
            .route("/docs/create-theme", web::get().to(create_theme))
            .route("/privacy", web::get().to(privacy))
            .route("/cookies", web::get().to(cookies))
    })
    .bind("127.0.0.1:8080")?
    .workers(2)
    .run()
    .await
} 