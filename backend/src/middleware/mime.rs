use actix_web::{
    dev::{Service, ServiceRequest, ServiceResponse, Transform},
    http::header::{self, HeaderValue},
    Error,
};
use futures_util::future::{ok, Ready};
use std::future::Future;
use std::path::Path;
use std::pin::Pin;
use std::task::{Context, Poll};

pub struct MimeTypeMiddleware;

impl<S, B> Transform<S, ServiceRequest> for MimeTypeMiddleware
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Transform = MimeTypeMiddlewareService<S>;
    type InitError = ();
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
    type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>;

    fn poll_ready(&self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.service.poll_ready(cx)
    }

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let fut = self.service.call(req);

        Box::pin(async move {
            let mut res = fut.await?;
            
            if let Some(path) = res.request().path().strip_prefix("/static/") {
                let path = Path::new(path);
                if let Some(ext) = path.extension().and_then(|ext| ext.to_str()) {
                    let content_type = match ext {
                        "css" => "text/css",
                        "js" => "application/javascript",
                        "svg" => "image/svg+xml",
                        "woff2" => "font/woff2",
                        "woff" => "font/woff",
                        "ttf" => "font/ttf",
                        "eot" => "application/vnd.ms-fontobject",
                        _ => "text/plain",
                    };
                    
                    if let Ok(value) = HeaderValue::from_str(content_type) {
                        res.headers_mut().insert(header::CONTENT_TYPE, value);
                    }
                }
            }
            
            Ok(res)
        })
    }
} 