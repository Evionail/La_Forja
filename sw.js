const CACHE_NAME = 'forja-v13';

const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icono.png',
    './js/react.js',
    './js/react-dom.js',
    './js/babel.js',
    './js/tailwind.js',
    './js/three.js'
];

// Instalar — cachear todos los assets de una vez
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activar — borrar cachés viejos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch — cache first, luego red
self.addEventListener('fetch', event => {
    // Solo interceptar GET, ignorar chrome-extension y demás
    if (event.request.method !== 'GET') return;
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            // No está en caché — buscar en red y cachear para después
            return fetch(event.request).then(response => {
                if (!response || response.status !== 200 || response.type === 'opaque') {
                    return response;
                }
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return response;
            }).catch(() => {
                // Sin red y sin caché — si es navegación devolver index.html
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
