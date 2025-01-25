//! VC Viewer Backend Library
//! 
//! This library provides the core functionality for the VC Viewer application,
//! a web-based viewer for W3C Verifiable Credentials.
//!
//! # Architecture
//! 
//! The application is structured into several modules:
//! - `config`: Configuration management and environment settings
//! - `handlers`: HTTP route handlers for the web application
//! - `middleware`: Custom Actix middleware components
//! - `templates`: Template management and rendering
//! - `utils`: Utility functions and helpers

pub mod config;
pub mod handlers;
pub mod middleware;
pub mod templates;
pub mod utils;

// Re-export commonly used items
pub use config::Config;
pub use handlers::*;
pub use middleware::compression::CompressionMonitor;
pub use templates::TEMPLATES;
