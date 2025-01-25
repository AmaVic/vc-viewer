use actix_web::{test, App, middleware::Compress};
use vc_viewer::{
    handlers::pages::*,
    middleware::CompressionMonitor,
};

#[actix_web::test]
async fn test_index_integration() {
    // Create test app with all required middleware
    let app = test::init_service(
        App::new()
            .wrap(CompressionMonitor)
            .wrap(Compress::default())
            .service(index)
    ).await;

    // Create test request
    let req = test::TestRequest::get().uri("/").to_request();
    let resp = test::call_service(&app, req).await;

    // Assert response
    assert!(resp.status().is_success());
    
    // Check response body
    let body = test::read_body(resp).await;
    let html = String::from_utf8(body.to_vec()).unwrap();
    assert!(html.contains("Verifiable Credentials Viewer"));
    assert!(html.contains("Try it Now"));
}

#[actix_web::test]
async fn test_viewer_integration() {
    // Create test app with all required middleware
    let app = test::init_service(
        App::new()
            .wrap(CompressionMonitor)
            .wrap(Compress::default())
            .service(viewer)
    ).await;

    // Test without theme parameter
    let req = test::TestRequest::get().uri("/viewer").to_request();
    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());

    // Test with theme parameter
    let req = test::TestRequest::get()
        .uri("/viewer?theme=classic")
        .to_request();
    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());

    let body = test::read_body(resp).await;
    let html = String::from_utf8(body.to_vec()).unwrap();
    assert!(html.contains("classic"));
}

#[actix_web::test]
async fn test_themes_integration() {
    let app = test::init_service(
        App::new()
            .wrap(CompressionMonitor)
            .wrap(Compress::default())
            .service(themes)
    ).await;

    let req = test::TestRequest::get().uri("/themes").to_request();
    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
}

#[actix_web::test]
async fn test_docs_integration() {
    let app = test::init_service(
        App::new()
            .wrap(CompressionMonitor)
            .wrap(Compress::default())
            .service(docs)
    ).await;

    let req = test::TestRequest::get().uri("/docs").to_request();
    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
}

#[actix_web::test]
async fn test_create_theme_integration() {
    let app = test::init_service(
        App::new()
            .wrap(CompressionMonitor)
            .wrap(Compress::default())
            .service(create_theme)
    ).await;

    let req = test::TestRequest::get().uri("/docs/create-theme").to_request();
    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
}

#[actix_web::test]
async fn test_privacy_integration() {
    let app = test::init_service(
        App::new()
            .wrap(CompressionMonitor)
            .wrap(Compress::default())
            .service(privacy)
    ).await;

    let req = test::TestRequest::get().uri("/privacy").to_request();
    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
}

#[actix_web::test]
async fn test_cookies_integration() {
    let app = test::init_service(
        App::new()
            .wrap(CompressionMonitor)
            .wrap(Compress::default())
            .service(cookies)
    ).await;

    let req = test::TestRequest::get().uri("/cookies").to_request();
    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
}

#[actix_web::test]
async fn test_about_integration() {
    let app = test::init_service(
        App::new()
            .wrap(CompressionMonitor)
            .wrap(Compress::default())
            .service(about)
    ).await;

    let req = test::TestRequest::get().uri("/about").to_request();
    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
}

#[actix_web::test]
async fn test_compression_middleware() {
    let app = test::init_service(
        App::new()
            .wrap(CompressionMonitor)
            .wrap(Compress::default())
            .service(index)
    ).await;

    let req = test::TestRequest::default()
        .insert_header(("Accept-Encoding", "gzip"))
        .uri("/")
        .to_request();
    let resp = test::call_service(&app, req).await;
    
    assert!(resp.status().is_success());
    assert!(resp.headers().contains_key("Content-Encoding"));
    assert_eq!(resp.headers().get("Content-Encoding").unwrap(), "gzip");
}

#[actix_web::test]
async fn test_error_handling() {
    let app = test::init_service(
        App::new()
            .wrap(CompressionMonitor)
            .wrap(Compress::default())
            .service(index)
    ).await;

    // Test non-existent route
    let req = test::TestRequest::get()
        .uri("/nonexistent")
        .to_request();
    let resp = test::call_service(&app, req).await;
    
    assert_eq!(resp.status(), 404);
} 