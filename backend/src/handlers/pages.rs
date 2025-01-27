//! Page handlers
//! 
//! This module contains handlers for rendering the main pages of the application.

use actix_web::{web, HttpResponse, Result, get};
use crate::templates::{TEMPLATES, new_context};
use super::handle_template_error;

/// Handler for the index page
/// 
/// Renders the home page with basic context information.
#[get("/")]
pub async fn index_route() -> Result<HttpResponse> {
    render_index().await
}

/// Generic index handler that can be used for both direct and catch-all routes
pub async fn render_index() -> Result<HttpResponse> {
    let mut ctx = new_context();
    ctx.insert("current_page", "none");
    
    // Add request path for canonical URLs
    ctx.insert("request", &tera::to_value(RequestContext {
        path: "/".to_string()
    }).unwrap());
    
    let rendered = TEMPLATES.render("pages/index.html", &ctx)
        .map_err(handle_template_error)?;
    
    Ok(HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(rendered))
}

#[derive(serde::Serialize)]
struct RequestContext {
    path: String,
}

/// Handler for the viewer page
/// 
/// Renders the credential viewer page, optionally with a selected theme.
#[actix_web::get("/viewer")]
pub async fn viewer(query: web::Query<std::collections::HashMap<String, String>>) -> Result<HttpResponse> {
    let mut ctx = new_context();
    ctx.insert("current_page", "viewer");
    
    if let Some(theme) = query.get("theme") {
        log::debug!("Theme parameter provided: {}", theme);
        ctx.insert("selected_theme", theme);
    }
    
    ctx.insert("request", &tera::to_value(RequestContext {
        path: "/viewer".to_string()
    }).unwrap());
    
    let rendered = TEMPLATES.render("pages/viewer.html", &ctx)
        .map_err(handle_template_error)?;
    
    Ok(HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(rendered))
}

/// Handler for the themes page
/// 
/// Renders the page showcasing available themes.
#[actix_web::get("/themes")]
pub async fn themes() -> Result<HttpResponse> {
    let mut ctx = new_context();
    ctx.insert("current_page", "themes");
    
    ctx.insert("request", &tera::to_value(RequestContext {
        path: "/themes".to_string()
    }).unwrap());
    
    let rendered = TEMPLATES.render("pages/themes.html", &ctx)
        .map_err(handle_template_error)?;
    
    Ok(HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(rendered))
}

/// Handler for the documentation page
#[actix_web::get("/docs")]
pub async fn docs() -> Result<HttpResponse> {
    let mut ctx = new_context();
    ctx.insert("current_page", "docs");
    
    ctx.insert("request", &tera::to_value(RequestContext {
        path: "/docs".to_string()
    }).unwrap());
    
    let rendered = TEMPLATES.render("pages/docs.html", &ctx)
        .map_err(handle_template_error)?;
    
    Ok(HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(rendered))
}

/// Handler for the theme creation documentation page
#[actix_web::get("/docs/create-theme")]
pub async fn create_theme() -> Result<HttpResponse> {
    let mut ctx = new_context();
    ctx.insert("current_page", "docs");
    
    ctx.insert("request", &tera::to_value(RequestContext {
        path: "/docs/create-theme".to_string()
    }).unwrap());
    
    let rendered = TEMPLATES.render("pages/create-theme.html", &ctx)
        .map_err(handle_template_error)?;
    
    Ok(HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(rendered))
}

/// Handler for the privacy policy page
#[actix_web::get("/privacy")]
pub async fn privacy() -> Result<HttpResponse> {
    let mut ctx = new_context();
    ctx.insert("current_page", "none");
    
    ctx.insert("request", &tera::to_value(RequestContext {
        path: "/privacy".to_string()
    }).unwrap());
    
    let rendered = TEMPLATES.render("pages/privacy.html", &ctx)
        .map_err(handle_template_error)?;
    
    Ok(HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(rendered))
}

/// Handler for the cookie policy page
#[actix_web::get("/cookies")]
pub async fn cookies() -> Result<HttpResponse> {
    let mut ctx = new_context();
    ctx.insert("current_page", "none");
    
    ctx.insert("request", &tera::to_value(RequestContext {
        path: "/cookies".to_string()
    }).unwrap());
    
    let rendered = TEMPLATES.render("pages/cookies.html", &ctx)
        .map_err(handle_template_error)?;
    
    Ok(HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(rendered))
}

/// Handler for the about page
#[actix_web::get("/about")]
pub async fn about() -> Result<HttpResponse> {
    let mut ctx = new_context();
    ctx.insert("current_page", "about");
    
    ctx.insert("request", &tera::to_value(RequestContext {
        path: "/about".to_string()
    }).unwrap());
    
    let rendered = TEMPLATES.render("pages/about.html", &ctx)
        .map_err(handle_template_error)?;
    
    Ok(HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(rendered))
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::test;
    use actix_web::http::StatusCode;

    #[actix_web::test]
    async fn test_index_handler() {
        let app = test::init_service(
            actix_web::App::new().service(index_route)
        ).await;
        
        let req = test::TestRequest::get().uri("/").to_request();
        let resp = test::call_service(&app, req).await;
        assert_eq!(resp.status(), StatusCode::OK);
        
        let body = test::read_body(resp).await;
        let html = String::from_utf8(body.to_vec()).unwrap();
        assert!(html.contains("Visualize Verifiable Credentials with Style"));
        assert!(html.contains("Try it Now"));
    }

    #[actix_web::test]
    async fn test_viewer_handler() {
        let app = test::init_service(
            actix_web::App::new().service(viewer)
        ).await;

        // Test without theme parameter
        let req = test::TestRequest::get().uri("/viewer").to_request();
        let resp = test::call_service(&app, req).await;
        assert_eq!(resp.status(), StatusCode::OK);
        
        let body = test::read_body(resp).await;
        let html = String::from_utf8(body.to_vec()).unwrap();
        assert!(html.contains("viewer"));
        
        // Test with theme parameter
        let req = test::TestRequest::get()
            .uri("/viewer?theme=classic")
            .to_request();
        let resp = test::call_service(&app, req).await;
        assert_eq!(resp.status(), StatusCode::OK);
        
        let body = test::read_body(resp).await;
        let html = String::from_utf8(body.to_vec()).unwrap();
        assert!(html.contains("classic"));
    }

    #[actix_web::test]
    async fn test_themes_handler() {
        let app = test::init_service(
            actix_web::App::new().service(themes)
        ).await;

        let req = test::TestRequest::get().uri("/themes").to_request();
        let resp = test::call_service(&app, req).await;
        assert_eq!(resp.status(), StatusCode::OK);
        
        let body = test::read_body(resp).await;
        let html = String::from_utf8(body.to_vec()).unwrap();
        assert!(html.contains("themes"));
    }

    #[actix_web::test]
    async fn test_docs_handler() {
        let app = test::init_service(
            actix_web::App::new().service(docs)
        ).await;

        let req = test::TestRequest::get().uri("/docs").to_request();
        let resp = test::call_service(&app, req).await;
        assert_eq!(resp.status(), StatusCode::OK);
        
        let body = test::read_body(resp).await;
        let html = String::from_utf8(body.to_vec()).unwrap();
        assert!(html.contains("docs"));
    }

    #[actix_web::test]
    async fn test_create_theme_handler() {
        let app = test::init_service(
            actix_web::App::new().service(create_theme)
        ).await;

        let req = test::TestRequest::get().uri("/docs/create-theme").to_request();
        let resp = test::call_service(&app, req).await;
        assert_eq!(resp.status(), StatusCode::OK);
        
        let body = test::read_body(resp).await;
        let html = String::from_utf8(body.to_vec()).unwrap();
        assert!(html.contains("docs"));
    }

    #[actix_web::test]
    async fn test_privacy_handler() {
        let app = test::init_service(
            actix_web::App::new().service(privacy)
        ).await;

        let req = test::TestRequest::get().uri("/privacy").to_request();
        let resp = test::call_service(&app, req).await;
        assert_eq!(resp.status(), StatusCode::OK);
        
        let body = test::read_body(resp).await;
        let html = String::from_utf8(body.to_vec()).unwrap();
        assert!(html.contains("privacy"));
    }

    #[actix_web::test]
    async fn test_cookies_handler() {
        let app = test::init_service(
            actix_web::App::new().service(cookies)
        ).await;

        let req = test::TestRequest::get().uri("/cookies").to_request();
        let resp = test::call_service(&app, req).await;
        assert_eq!(resp.status(), StatusCode::OK);
        
        let body = test::read_body(resp).await;
        let html = String::from_utf8(body.to_vec()).unwrap();
        assert!(html.contains("cookies"));
    }

    #[actix_web::test]
    async fn test_about_handler() {
        let app = test::init_service(
            actix_web::App::new().service(about)
        ).await;

        let req = test::TestRequest::get().uri("/about").to_request();
        let resp = test::call_service(&app, req).await;
        assert_eq!(resp.status(), StatusCode::OK);
        
        let body = test::read_body(resp).await;
        let html = String::from_utf8(body.to_vec()).unwrap();
        assert!(html.contains("about"));
    }
} 