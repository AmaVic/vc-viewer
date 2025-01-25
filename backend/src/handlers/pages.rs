//! Page handlers
//! 
//! This module contains handlers for rendering the main pages of the application.

use actix_web::{web, HttpResponse, Result};
use crate::templates::{TEMPLATES, new_context};
use super::handle_template_error;

/// Handler for the index page
/// 
/// Renders the home page with basic context information.
#[actix_web::get("/")]
pub async fn index() -> Result<HttpResponse> {
    let mut ctx = new_context();
    ctx.insert("current_page", "home");
    
    let rendered = TEMPLATES.render("pages/index.html", &ctx)
        .map_err(handle_template_error)?;
    
    Ok(HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(rendered))
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
    ctx.insert("current_page", "privacy");
    
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
    ctx.insert("current_page", "cookies");
    
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
    
    let rendered = TEMPLATES.render("pages/about.html", &ctx)
        .map_err(handle_template_error)?;
    
    Ok(HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(rendered))
} 