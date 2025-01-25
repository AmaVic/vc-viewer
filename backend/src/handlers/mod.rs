//! HTTP route handlers
//! 
//! This module contains all the route handlers for the web application,
//! organized by functionality.

pub mod pages;
pub mod health;
mod errors;

pub use pages::*;
pub use errors::*;
pub use health::*;

/// Common error handling for template rendering
pub(crate) fn handle_template_error(e: tera::Error) -> actix_web::Error {
    log::error!("Template error: {:?}", e);
    actix_web::error::ErrorInternalServerError(format!("Template error: {:?}", e))
}
