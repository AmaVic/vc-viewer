use actix_web::{
    dev::{forward_ready, Service, ServiceRequest, ServiceResponse, Transform},
    http::header::{self, HeaderValue},
    Error,
};
use futures_util::future::{ok, LocalBoxFuture, Ready};

pub mod compression;

pub use compression::CompressionMonitor;

pub struct MimeTypeMiddleware;

impl<S, B> Transform<S, ServiceRequest> for MimeTypeMiddleware
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type InitError = ();
    type Transform = MimeTypeMiddlewareService<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(MimeTypeMiddlewareService { service })
    }
}

pub struct MimeTypeMiddlewareService<S> {
    service: S,
}

impl<S, B> Service<ServiceRequest> for MimeTypeMiddlewareService<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let path = req.path().to_string();
        let content_type = if path.starts_with("/static/") || path.starts_with("/dist/") || path.starts_with("/frontend/src/") {
            if path.ends_with(".css") {
                Some(HeaderValue::from_static("text/css"))
            } else if path.ends_with(".js") {
                Some(HeaderValue::from_static("application/javascript"))
            } else if path.ends_with(".svg") {
                Some(HeaderValue::from_static("image/svg+xml"))
            } else if path.ends_with(".ico") {
                Some(HeaderValue::from_static("image/x-icon"))
            } else {
                None
            }
        } else {
            None
        };

        let fut = self.service.call(req);
        Box::pin(async move {
            let mut res = fut.await?;
            if let Some(content_type) = content_type {
                res.headers_mut().insert(header::CONTENT_TYPE, content_type);
            }
            Ok(res)
        })
    }
}
