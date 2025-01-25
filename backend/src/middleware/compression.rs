//! Compression monitoring middleware
//! 
//! This module provides middleware for monitoring compression of HTTP responses.
//! It logs information about compressed responses including the path, size, and
//! compression method used.

use actix_web::{
    dev::{Service, ServiceRequest, ServiceResponse, Transform},
    Error,
    body::MessageBody,
};
use futures_util::future::{LocalBoxFuture, Ready, ready};
use log::info;
use std::task::{Context, Poll};

/// Middleware for monitoring response compression
/// 
/// This middleware logs information about compressed responses, including:
/// - The request path
/// - The response size
/// - The compression method used
/// 
/// # Example
/// ```rust
/// use actix_web::{App, middleware::Compress};
/// use vc_viewer::middleware::CompressionMonitor;
/// 
/// let app = App::new()
///     .wrap(CompressionMonitor)
///     .wrap(Compress::default());
/// ```
#[derive(Debug, Clone, Copy)]
pub struct CompressionMonitor;

impl<S, B> Transform<S, ServiceRequest> for CompressionMonitor
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    B: MessageBody + 'static,
    S::Future: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Transform = CompressionMonitorMiddleware<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(CompressionMonitorMiddleware { service }))
    }
}

/// The actual middleware service that processes requests
pub struct CompressionMonitorMiddleware<S> {
    service: S,
}

impl<S, B> Service<ServiceRequest> for CompressionMonitorMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    B: MessageBody,
    S::Future: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    fn poll_ready(&self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.service.poll_ready(cx)
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let fut = self.service.call(req);
        Box::pin(async move {
            let res = fut.await?;
            if let Some(encoding) = res.headers().get("content-encoding") {
                info!(
                    "Compressed response: {} - {} using {}",
                    res.request().path(),
                    res.headers()
                        .get("content-length")
                        .map_or("unknown size", |v| v.to_str().unwrap_or("invalid")),
                    encoding.to_str().unwrap_or("unknown")
                );
            }
            Ok(res)
        })
    }
} 