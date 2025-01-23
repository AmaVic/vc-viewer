use actix_files as fs;
use actix_web::{web, App, HttpResponse, Result, middleware::Logger, HttpServer};
use log::{info, debug};

async fn index() -> Result<HttpResponse> {
    debug!("Serving index page");
    Ok(HttpResponse::Ok()
        .content_type("text/html")
        .body(include_str!("../../frontend/src/templates/index.html")))
}

async fn viewer() -> Result<HttpResponse> {
    debug!("Serving viewer page");
    Ok(HttpResponse::Ok()
        .content_type("text/html")
        .body(include_str!("../../frontend/src/templates/viewer.html")))
}

async fn themes() -> Result<HttpResponse> {
    debug!("Serving themes page");
    Ok(HttpResponse::Ok()
        .content_type("text/html")
        .body(include_str!("../../frontend/src/templates/themes.html")))
}

async fn docs() -> Result<HttpResponse> {
    debug!("Serving documentation page");
    Ok(HttpResponse::Ok()
        .content_type("text/html")
        .body(include_str!("../../frontend/src/templates/docs.html")))
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