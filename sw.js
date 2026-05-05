const CACHE_NAME = 'forja-v13.8';

const ASSETS = [
    '/La_Forja/',
    '/La_Forja/index.html',
    '/La_Forja/manifest.json',
    '/La_Forja/icono.png',
    '/La_Forja/js/react.js',
    '/La_Forja/js/react-dom.js',
    '/La_Forja/js/babel.js',
    '/La_Forja/js/tailwind.js',
    '/La_Forja/js/three.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    if (!event.request.url.startsWith('http')) return;
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                if (!response || response.status !== 200 || response.type === 'opaque') return response;
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return response;
            }).catch(() => {
                if (event.request.mode === 'navigate') return caches.match('/La_Forja/index.html');
            });
        })
    );
});
