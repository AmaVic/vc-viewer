const CACHE_NAME = 'vc-viewer-cache-v1';
const STATIC_ASSETS = [
    '/',
    '/frontend/src/static/seo/robots.txt',
    '/frontend/src/static/seo/sitemap.xml',
    '/frontend/src/css/styles.css',
    '/frontend/src/css/viewer.css',
    '/frontend/src/css/docs.css',
    '/frontend/src/js/main.js',
    '/frontend/src/js/examples.js',
    '/frontend/src/themes/base/BaseTheme.js',
    '/frontend/src/themes/VerifiableCredential/default/DefaultTheme.js',
    '/frontend/src/themes/UniversityDegreeCredential/classic/ClassicUniversityTheme.js',
    '/frontend/src/themes/UniversityDegreeCredential/modern/ModernUniversityTheme.js',
    '/frontend/src/themes/BelgianDriverLicenseCredential/classic/ClassicDriverLicenseTheme.js',
    '/frontend/src/themes/BelgianDriverLicenseCredential/modern/ModernDriverLicenseTheme.js',
    '/frontend/src/images/logo.svg',
    '/frontend/src/images/og-image.png',
    '/frontend/src/images/apple-touch-icon.png',
];

// Install Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
});

// Fetch Event Strategy
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Handle API requests differently
    if (event.request.url.includes('/api/')) {
        event.respondWith(networkFirst(event.request));
        return;
    }

    // For static assets, use cache first strategy
    event.respondWith(cacheFirst(event.request));
});

// Cache First Strategy
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    return fetch(request).then((response) => {
        if (!response || response.status !== 200) {
            return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
        });
        return response;
    });
}

// Network First Strategy
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (!response || response.status !== 200) {
            throw new Error('Network response was not ok');
        }
        const responseToCache = response.clone();
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, responseToCache);
        return response;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
} 