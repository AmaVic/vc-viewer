(function() {
    var implementors = Object.fromEntries([["vc_viewer",[["impl&lt;S, B&gt; Transform&lt;S, ServiceRequest&gt; for <a class=\"struct\" href=\"vc_viewer/middleware/compression/struct.CompressionMonitor.html\" title=\"struct vc_viewer::middleware::compression::CompressionMonitor\">CompressionMonitor</a><div class=\"where\">where\n    S: Service&lt;ServiceRequest, Response = ServiceResponse&lt;B&gt;, Error = Error&gt; + 'static,\n    B: MessageBody + 'static,\n    S::Future: 'static,</div>"],["impl&lt;S, B&gt; Transform&lt;S, ServiceRequest&gt; for <a class=\"struct\" href=\"vc_viewer/middleware/struct.MimeTypeMiddleware.html\" title=\"struct vc_viewer::middleware::MimeTypeMiddleware\">MimeTypeMiddleware</a><div class=\"where\">where\n    S: Service&lt;ServiceRequest, Response = ServiceResponse&lt;B&gt;, Error = Error&gt;,\n    S::Future: 'static,\n    B: 'static,</div>"]]]]);
    if (window.register_implementors) {
        window.register_implementors(implementors);
    } else {
        window.pending_implementors = implementors;
    }
})()
//{"start":57,"fragment_lengths":[840]}