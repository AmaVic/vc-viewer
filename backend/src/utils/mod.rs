//! Utility functions
//! 
//! This module contains various utility functions used throughout the application.

use std::fs::{OpenOptions, create_dir_all};
use std::io::Write;
use chrono::Local;
use log::LevelFilter;

/// Custom writer that writes to both file and stderr
pub struct MultiOutput {
    file: std::fs::File,
}

impl MultiOutput {
    /// Create a new MultiOutput instance
    pub fn new(file: std::fs::File) -> Self {
        Self { file }
    }
}

impl Write for MultiOutput {
    fn write(&mut self, buf: &[u8]) -> std::io::Result<usize> {
        // Write to file
        self.file.write_all(buf)?;
        // Write to stderr
        std::io::stderr().write_all(buf)?;
        Ok(buf.len())
    }

    fn flush(&mut self) -> std::io::Result<()> {
        self.file.flush()?;
        std::io::stderr().flush()
    }
}

/// Setup logging based on the environment
pub fn setup_logging() {
    // Create logs directory if it doesn't exist
    create_dir_all("logs").expect("Failed to create logs directory");

    if cfg!(debug_assertions) {
        // Development logging - more verbose with timestamps
        let log_file = OpenOptions::new()
            .create(true)
            .append(true)
            .open("logs/debug.log")
            .expect("Failed to open debug log file");

        let mut builder = env_logger::Builder::new();
        builder.filter_level(LevelFilter::Debug);
        builder.format(|buf, record| {
            writeln!(
                buf,
                "{} [{}] - {}",
                Local::now().format("%Y-%m-%d %H:%M:%S"),
                record.level(),
                record.args(),
            )
        });
        builder.target(env_logger::Target::Pipe(Box::new(MultiOutput::new(log_file))));
        builder.init();
    } else {
        // Production logging - minimal overhead
        let log_file = OpenOptions::new()
            .create(true)
            .append(true)
            .open("logs/release.log")
            .expect("Failed to open release log file");

        let mut builder = env_logger::Builder::new();
        builder.filter_level(LevelFilter::Info);
        builder.format_timestamp(None);
        builder.format_target(false);
        builder.target(env_logger::Target::Pipe(Box::new(MultiOutput::new(log_file))));
        builder.init();
    }
}

/// Format a file size in bytes to a human-readable string
pub fn format_size(size: u64) -> String {
    const UNITS: [&str; 6] = ["B", "KB", "MB", "GB", "TB", "PB"];
    let mut size = size as f64;
    let mut unit_index = 0;

    while size >= 1024.0 && unit_index < UNITS.len() - 1 {
        size /= 1024.0;
        unit_index += 1;
    }

    if unit_index == 0 {
        format!("{} {}", size, UNITS[unit_index])
    } else {
        format!("{:.2} {}", size, UNITS[unit_index])
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_format_size() {
        assert_eq!(format_size(500), "500 B");
        assert_eq!(format_size(1024), "1.00 KB");
        assert_eq!(format_size(1024 * 1024), "1.00 MB");
        assert_eq!(format_size(1024 * 1024 * 1024), "1.00 GB");
    }
}
