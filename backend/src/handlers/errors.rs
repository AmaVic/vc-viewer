//! Error handlers
//! 
//! This module contains handlers for various error conditions.

use actix_web::{
    error::ResponseError,
    http::StatusCode,
    HttpResponse,
};
use std::fmt;

/// Custom error types for the application
#[derive(Debug)]
pub enum AppError {
    /// Template rendering error
    TemplateError(String),
    /// Not found error
    NotFound(String),
    /// Internal server error
    InternalError(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::TemplateError(msg) => write!(f, "Template error: {}", msg),
            AppError::NotFound(msg) => write!(f, "Not found: {}", msg),
            AppError::InternalError(msg) => write!(f, "Internal error: {}", msg),
        }
    }
}

impl ResponseError for AppError {
    fn status_code(&self) -> StatusCode {
        match self {
            AppError::TemplateError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            AppError::NotFound(_) => StatusCode::NOT_FOUND,
            AppError::InternalError(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn error_response(&self) -> HttpResponse {
        let mut ctx = crate::templates::new_context();
        ctx.insert("error", &self.to_string());
        ctx.insert("status_code", &self.status_code().as_u16());

        let body = crate::templates::TEMPLATES
            .render("pages/error.html", &ctx)
            .unwrap_or_else(|_| {
                format!(
                    "Error: {} ({})",
                    self.to_string(),
                    self.status_code()
                )
            });

        HttpResponse::build(self.status_code())
            .content_type("text/html; charset=utf-8")
            .body(body)
    }
}

/// Convert a template error into an application error
impl From<tera::Error> for AppError {
    fn from(err: tera::Error) -> Self {
        AppError::TemplateError(err.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_display() {
        let err = AppError::NotFound("Page not found".to_string());
        assert_eq!(err.to_string(), "Not found: Page not found");
    }

    #[test]
    fn test_error_status_codes() {
        let err = AppError::NotFound("".to_string());
        assert_eq!(err.status_code(), StatusCode::NOT_FOUND);

        let err = AppError::TemplateError("".to_string());
        assert_eq!(err.status_code(), StatusCode::INTERNAL_SERVER_ERROR);
    }
} 