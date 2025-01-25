//! Configuration management
//! 
//! This module handles application configuration, including server settings
//! and environment-specific configurations.

pub mod env;

use std::time::Duration;

/// Server configuration settings
#[derive(Debug, Clone)]
pub struct Config {
    /// Server bind address
    pub bind_address: String,
    /// Server port
    pub port: u16,
    /// Number of worker threads
    pub workers: usize,
    /// Client request timeout
    pub request_timeout: Duration,
    /// Client disconnect timeout
    pub disconnect_timeout: Duration,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            bind_address: env::get_host(),
            port: env::get_port(),
            workers: num_cpus::get(),
            request_timeout: Duration::from_secs(60),
            disconnect_timeout: Duration::from_secs(5),
        }
    }
}

impl Config {
    /// Create a new configuration with custom settings
    /// 
    /// # Example
    /// ```rust
    /// use vc_viewer::config::Config;
    /// use std::time::Duration;
    /// 
    /// let config = Config::new()
    ///     .with_port(3000)
    ///     .with_request_timeout(Duration::from_secs(30));
    /// ```
    pub fn new() -> Self {
        Self::default()
    }

    /// Set the server port
    pub fn with_port(mut self, port: u16) -> Self {
        self.port = port;
        self
    }

    /// Set the bind address
    pub fn with_bind_address(mut self, addr: impl Into<String>) -> Self {
        self.bind_address = addr.into();
        self
    }

    /// Set the number of worker threads
    pub fn with_workers(mut self, workers: usize) -> Self {
        self.workers = workers;
        self
    }

    /// Set the client request timeout
    pub fn with_request_timeout(mut self, timeout: Duration) -> Self {
        self.request_timeout = timeout;
        self
    }

    /// Set the client disconnect timeout
    pub fn with_disconnect_timeout(mut self, timeout: Duration) -> Self {
        self.disconnect_timeout = timeout;
        self
    }

    /// Get the full bind address (address:port)
    pub fn get_bind_addr(&self) -> String {
        format!("{}:{}", self.bind_address, self.port)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = Config::default();
        assert_eq!(config.port, env::get_port());
        assert_eq!(config.bind_address, env::get_host());
    }

    #[test]
    fn test_config_builder() {
        let config = Config::new()
            .with_port(3000)
            .with_bind_address("0.0.0.0");
        
        assert_eq!(config.port, 3000);
        assert_eq!(config.bind_address, "0.0.0.0");
        assert_eq!(config.get_bind_addr(), "0.0.0.0:3000");
    }
}
