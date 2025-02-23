//! VC Viewer Server
//! 
//! This is the main entry point for the VC Viewer server application.
//! It sets up the HTTP server with all necessary middleware and routes.

use actix_files as fs;
use actix_web::{
    middleware::{Logger, Compress, DefaultHeaders, NormalizePath, TrailingSlash},
    App, HttpServer, web, get, HttpResponse,
};
use log;

use vc_viewer::{
    config::Config,
    handlers::pages::{index_route, viewer, themes, docs, create_theme, privacy, cookies, about},
    handlers::health::health_check,
    handlers::errors::AppError,
    middleware::{CompressionMonitor, MimeTypeMiddleware},
    utils::setup_logging,
};

// SEO file handlers
#[get("/robots.txt")]
async fn robots_txt() -> HttpResponse {
    HttpResponse::Ok()
        .content_type("text/plain")
        .body(include_str!("../../frontend/src/static/seo/robots.txt"))
}

#[get("/sitemap.xml")]
async fn sitemap_xml() -> HttpResponse {
    HttpResponse::Ok()
        .content_type("application/xml")
        .body(include_str!("../../frontend/src/static/seo/sitemap.xml"))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize logging
    setup_logging();

    // Create server configuration
    let config = Config::new()
        .with_workers(2);

    log::info!("Starting server at http://{}", config.get_bind_addr());

    // Create and run HTTP server
    HttpServer::new(move || {
        let logger = if cfg!(debug_assertions) {
            Logger::new("%a \"%r\" %s %b %{Referer}i %T")
        } else {
            Logger::new("%r %s %b %T")
        };

        App::new()
            .wrap(logger)
            .wrap(CompressionMonitor)
            .wrap(Compress::default())
            .wrap(NormalizePath::new(TrailingSlash::Trim))
            .wrap(MimeTypeMiddleware)
            .wrap(
                DefaultHeaders::new()
                    .add(("Cache-Control", "public, max-age=31536000"))
                    .add(("X-Content-Type-Options", "nosniff"))
                    .add(("X-Frame-Options", "DENY"))
                    .add(("X-XSS-Protection", "1; mode=block"))
                    .add(("Vary", "Accept-Encoding"))
            )
            // Health check endpoint
            .service(health_check)
            // SEO files
            .service(robots_txt)
            .service(sitemap_xml)
            // Serve static files with optimized settings
            .service(
                fs::Files::new("/static", "../frontend/src")
                    .prefer_utf8(true)
                    .use_last_modified(true)
                    .use_etag(true)
            )
            // Route handlers
            .service(index_route)
            .service(viewer)
            .service(themes)
            .service(docs)
            .service(create_theme)
            .service(privacy)
            .service(cookies)
            .service(about)            
            // Catch-all route to return 404 for unknown routes
            .service(
                web::resource("/{tail:.*}").route(web::get().to(|| async {
                    Err::<HttpResponse, actix_web::Error>(AppError::NotFound("Page not found".to_string()).into())
                }))
            )
    })
    .workers(config.workers)
    .client_request_timeout(config.request_timeout)
    .client_disconnect_timeout(config.disconnect_timeout)
    .bind(config.get_bind_addr())?
    .run()
    .await
} 