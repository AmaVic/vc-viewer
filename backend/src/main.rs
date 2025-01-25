use actix_files as fs;
use actix_web::{
    web, App, HttpResponse, Result,
    middleware::{Logger, Compress, DefaultHeaders},
    HttpServer,
    dev::{Service, ServiceResponse, Transform},
};
use futures_util::future::LocalBoxFuture;
use log::{info, debug, error};
use tera::Tera;
use std::path::PathBuf;
use chrono::Local;
use std::fs::OpenOptions;
use std::io::Write;
use lazy_static::lazy_static;
use std::sync::Arc;
use std::time::Duration;
use num_cpus;
use std::task::{Context, Poll};
use pin_project_lite::pin_project;
use std::future::Future;
use std::pin::Pin;
use actix_web::dev::ServiceRequest;
use actix_web::body::MessageBody;
use futures_util::future::ready;
use futures_util::future::Ready;
use actix_web::Error;

// Cached templates
lazy_static! {
    static ref TEMPLATES: Arc<Tera> = Arc::new(init_templates());
    static ref BASE_CONTEXT: tera::Context = {
        let mut ctx = tera::Context::new();
        ctx.insert("version", "v0.0.1");
        ctx
    };
}

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
    
    match Tera::new(template_path.to_str().unwrap()) {
        Ok(t) => {
            info!("Successfully loaded templates");
            debug!("Available templates: {:?}", t.get_template_names().collect::<Vec<_>>());
            t
        },
        Err(e) => {
            error!("Template parsing error(s): {}", e);
            ::std::process::exit(1);
        }
    }
}

// Initialize logger with optimized settings
fn init_logger() {
    if cfg!(debug_assertions) {
        // Development logging
        std::fs::create_dir_all("logs").expect("Failed to create logs directory");
        let log_file = format!("logs/vc-viewer-{}.log", Local::now().format("%Y-%m-%d_%H-%M-%S"));
        let file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&log_file)
            .unwrap();

        let mut builder = env_logger::Builder::new();
        builder.filter_level(log::LevelFilter::Debug);
        builder.format(|buf, record| {
            writeln!(
                buf,
                "{} [{}] {}",
                Local::now().format("%Y-%m-%d %H:%M:%S"),
                record.level(),
                record.args(),
            )
        });
        builder.target(env_logger::Target::Pipe(Box::new(MultiOutput::new(file))));
        builder.init();
    } else {
        // Production logging - minimal overhead
        env_logger::Builder::new()
            .filter_level(log::LevelFilter::Info)
            .format_timestamp(None)
            .format_target(false)
            .init();
    }
}

// Optimized page handlers
async fn index() -> Result<HttpResponse> {
    debug!("Serving index page");
    let mut ctx = BASE_CONTEXT.clone();
    ctx.insert("current_page", "home");
    
    let rendered = TEMPLATES.render("pages/index.html", &ctx)
        .map_err(|e| {
            error!("Template error: {}", e);
            actix_web::error::ErrorInternalServerError("Template error")
        })?;
    
    Ok(HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(rendered))
}

async fn viewer(query: web::Query<std::collections::HashMap<String, String>>) -> Result<HttpResponse> {
    debug!("Serving viewer page");
    let mut ctx = BASE_CONTEXT.clone();
    ctx.insert("current_page", "viewer");
    
    if let Some(theme) = query.get("theme") {
        debug!("Theme parameter provided: {}", theme);
        ctx.insert("selected_theme", theme);
    }
    
    let rendered = TEMPLATES.render("pages/viewer.html", &ctx)
        .map_err(|e| {
            error!("Template error: {}", e);
            actix_web::error::ErrorInternalServerError("Template error")
        })?;
    
    Ok(HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(rendered))
}

async fn themes() -> Result<HttpResponse> {
    debug!("Serving themes page");
    let mut ctx = BASE_CONTEXT.clone();
    ctx.insert("current_page", "themes");
    
    let rendered = TEMPLATES.render("pages/themes.html", &ctx)
        .map_err(|e| {
            error!("Template error: {}", e);
            actix_web::error::ErrorInternalServerError("Template error")
        })?;
    
    Ok(HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(rendered))
}

async fn docs() -> Result<HttpResponse> {
    debug!("Serving documentation page");
    let mut ctx = BASE_CONTEXT.clone();
    ctx.insert("current_page", "docs");
    
    let rendered = TEMPLATES.render("pages/docs.html", &ctx)
        .map_err(|e| {
            error!("Template error: {}", e);
            actix_web::error::ErrorInternalServerError("Template error")
        })?;
    
    Ok(HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(rendered))
}

async fn create_theme() -> Result<HttpResponse> {
    debug!("Serving theme creation documentation page");
    let mut ctx = BASE_CONTEXT.clone();
    ctx.insert("current_page", "docs");
    
    let rendered = TEMPLATES.render("pages/create-theme.html", &ctx)
        .map_err(|e| {
            error!("Template error: {}", e);
            actix_web::error::ErrorInternalServerError("Template error")
        })?;
    
    Ok(HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(rendered))
}

async fn privacy() -> Result<HttpResponse> {
    debug!("Serving privacy policy page");
    let mut ctx = BASE_CONTEXT.clone();
    ctx.insert("current_page", "privacy");
    
    let rendered = TEMPLATES.render("pages/privacy.html", &ctx)
        .map_err(|e| {
            error!("Template error: {}", e);
            actix_web::error::ErrorInternalServerError("Template error")
        })?;
    
    Ok(HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(rendered))
}

async fn cookies() -> Result<HttpResponse> {
    debug!("Serving cookie policy page");
    let mut ctx = BASE_CONTEXT.clone();
    ctx.insert("current_page", "cookies");
    
    let rendered = TEMPLATES.render("pages/cookies.html", &ctx)
        .map_err(|e| {
            error!("Template error: {}", e);
            actix_web::error::ErrorInternalServerError("Template error")
        })?;
    
    Ok(HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(rendered))
}

async fn about() -> Result<HttpResponse> {
    debug!("Serving about page");
    let mut ctx = BASE_CONTEXT.clone();
    ctx.insert("current_page", "about");
    
    let rendered = TEMPLATES.render("pages/about.html", &ctx)
        .map_err(|e| {
            error!("Template error: {}", e);
            actix_web::error::ErrorInternalServerError("Template error")
        })?;
    
    Ok(HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(rendered))
}

// Add compression monitoring middleware
struct CompressionMonitor;

impl<S, B> Transform<S, ServiceRequest> for CompressionMonitor
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    B: MessageBody + 'static,
    S::Future: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Transform = CompressionMonitorMiddleware<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(CompressionMonitorMiddleware { service }))
    }
}

struct CompressionMonitorMiddleware<S> {
    service: S,
}

impl<S, B> Service<ServiceRequest> for CompressionMonitorMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    B: MessageBody,
    S::Future: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    fn poll_ready(&self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.service.poll_ready(cx)
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let fut = self.service.call(req);
        Box::pin(async move {
            let res = fut.await?;
            if let Some(encoding) = res.headers().get("content-encoding") {
                info!(
                    "Compressed response: {} - {} using {}",
                    res.request().path(),
                    res.headers()
                        .get("content-length")
                        .map_or("unknown size", |v| v.to_str().unwrap_or("invalid")),
                    encoding.to_str().unwrap_or("unknown")
                );
            }
            Ok(res)
        })
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    init_logger();
    info!("Starting server at http://127.0.0.1:8080");

    HttpServer::new(move || {
        let logger = if cfg!(debug_assertions) {
            Logger::new("%a %r %s %b %{Referer}i %{User-Agent}i %T")
        } else {
            Logger::new("%r %s %D")
        };

        App::new()
            .wrap(logger)
            .wrap(CompressionMonitor)
            .wrap(Compress::default())
            .wrap(
                DefaultHeaders::new()
                    .add(("Cache-Control", "public, max-age=31536000"))
                    .add(("X-Content-Type-Options", "nosniff"))
                    .add(("X-Frame-Options", "DENY"))
                    .add(("X-XSS-Protection", "1; mode=block"))
                    .add(("Vary", "Accept-Encoding"))
            )
            // Serve static files with optimized settings
            .service(
                fs::Files::new("/frontend/src/themes", "../frontend/src/themes")
                    .show_files_listing()
                    .prefer_utf8(true)
                    .use_last_modified(true)
                    .use_etag(true)
                    .disable_content_disposition()
            )
            .service(
                fs::Files::new("/frontend/src/js", "../frontend/src/js")
                    .show_files_listing()
                    .prefer_utf8(true)
                    .use_last_modified(true)
                    .use_etag(true)
                    .disable_content_disposition()
            )
            .service(
                fs::Files::new("/frontend/src/css", "../frontend/src/css")
                    .show_files_listing()
                    .prefer_utf8(true)
                    .use_last_modified(true)
                    .use_etag(true)
                    .disable_content_disposition()
            )
            .service(
                fs::Files::new("/frontend/src/images", "../frontend/src/images")
                    .prefer_utf8(true)
                    .use_last_modified(true)
                    .use_etag(true)
                    .disable_content_disposition()
            )
            // Route handlers
            .route("/", web::get().to(index))
            .route("/viewer", web::get().to(viewer))
            .route("/themes", web::get().to(themes))
            .route("/docs", web::get().to(docs))
            .route("/docs/create-theme", web::get().to(create_theme))
            .route("/privacy", web::get().to(privacy))
            .route("/cookies", web::get().to(cookies))
            .route("/about", web::get().to(about))
    })
    .workers(num_cpus::get())
    .backlog(1024)
    .client_request_timeout(Duration::from_secs(60))
    .client_disconnect_timeout(Duration::from_secs(5))
    .bind("127.0.0.1:8080")?
    .run()
    .await
} 