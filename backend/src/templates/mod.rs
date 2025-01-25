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
        assert_eq!(ctx.get("version").unwrap().as_str().unwrap(), "v0.0.1");
    }

    #[test]
    fn test_templates_load() {
        let tera = init_templates();
        let template_names: Vec<_> = tera.get_template_names().map(String::from).collect();
        
        // Check that essential templates are loaded
        let required_templates = [
            "pages/index.html",
            "pages/viewer.html",
            "pages/themes.html",
            "pages/docs.html",
            "pages/privacy.html",
            "pages/cookies.html",
            "pages/about.html",
            "partials/head.html",
            "partials/navbar.html",
            "partials/footer.html",
        ];

        for template in required_templates {
            assert!(template_names.contains(&template.to_string()),
                   "Missing required template: {}", template);
        }
    }

    #[test]
    fn test_context_modification() {
        let mut ctx = new_context();
        
        // Test adding new values
        ctx.insert("test_key", &"test_value");
        assert_eq!(ctx.get("test_key").unwrap().as_str().unwrap(), "test_value");
        
        // Test that base values are preserved
        assert_eq!(ctx.get("version").unwrap().as_str().unwrap(), "v0.0.1");
        
        // Test adding complex values
        let mut map = tera::Map::new();
        map.insert("nested_key".to_string(), tera::Value::String("nested_value".to_string()));
        ctx.insert("complex", &tera::Value::Object(map));
        
        assert!(ctx.get("complex").is_some());
        assert!(ctx.get("complex").unwrap().is_object());
    }

    #[test]
    fn test_template_error_handling() {
        let ctx = new_context();
        
        // Test rendering with undefined variable
        let result = init_templates().render_str("{{ undefined_var }}", &ctx);
        assert!(result.is_err());
        
        // Test rendering with invalid syntax
        let result = init_templates().render_str("{{ invalid_syntax }", &ctx);
        assert!(result.is_err());
    }
}
