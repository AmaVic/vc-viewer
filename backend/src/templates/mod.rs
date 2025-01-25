//! Template management and rendering
//! 
//! This module handles the initialization and caching of Tera templates,
//! providing a global template instance that can be used throughout the application.

use lazy_static::lazy_static;
use log::error;
use std::sync::Arc;
use tera::Tera;

lazy_static! {
    /// Global template instance, initialized once and shared across threads
    pub static ref TEMPLATES: Arc<Tera> = Arc::new(init_templates());
    
    /// Base context containing common template variables
    pub static ref BASE_CONTEXT: tera::Context = {
        let mut ctx = tera::Context::new();
        ctx.insert("version", "v0.0.1");
        ctx
    };
}

/// Initialize the template engine with all templates in the templates directory
fn init_templates() -> Tera {
    let mut tera = match Tera::new("../frontend/src/templates/**/*.html") {
        Ok(t) => t,
        Err(e) => {
            error!("Template parsing error(s): {}", e);
            ::std::process::exit(1);
        }
    };
    
    // Add any custom filters or functions here
    tera.autoescape_on(vec!["html", ".sql"]);
    
    tera
}

/// Create a new context for template rendering with base values
/// 
/// This function creates a new context with the base values (like version)
/// already inserted, ready for additional template-specific values.
/// 
/// # Returns
/// 
/// A new `tera::Context` instance with base values
pub fn new_context() -> tera::Context {
    BASE_CONTEXT.clone()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_base_context() {
        let ctx = new_context();
        assert!(ctx.get("version").is_some());
    }

    #[test]
    fn test_templates_load() {
        let tera = init_templates();
        assert!(tera.get_template_names().count() > 0);
    }
}
