use std::env;

/// Get the host address from environment or default
pub fn get_host() -> String {
    env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string())
}

/// Get the port from environment or default
pub fn get_port() -> u16 {
    env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(8080)
} 