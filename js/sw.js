const CACHE_NAME = 'forja-v14.5';

const ASSETS = [
    '/La_Forja/',
    '/La_Forja/index.html',
    '/La_Forja/manifest.json',
    '/La_Forja/icono.png',
    '/La_Forja/js/react.js',
    '/La_Forja/js/react-dom.js',
    '/La_Forja/js/babel.js',
    '/La_Forja/js/tailwind.js',
    '/La_Forja/js/three.js',
    '/La_Forja/js/fuse.js',
    '/La_Forja/js/libraryManager.js',
    '/La_Forja/js/libraryManager.css',
    // SRD — 21 archivos traducidos
    '/La_Forja/SRD/es/5e-SRD-Ability-Scores-es.json',
    '/La_Forja/SRD/es/5e-SRD-Alignments-es.json',
    '/La_Forja/SRD/es/5e-SRD-Backgrounds-es.json',
    '/La_Forja/SRD/es/5e-SRD-Classes-es.json',
    '/La_Forja/SRD/es/5e-SRD-Conditions-es.json',
    '/La_Forja/SRD/es/5e-SRD-Damage-Types-es.json',
    '/La_Forja/SRD/es/5e-SRD-Equipment-Categories-es.json',
    '/La_Forja/SRD/es/5e-SRD-Equipment-es.json',
    '/La_Forja/SRD/es/5e-SRD-Feats-es.json',
    '/La_Forja/SRD/es/5e-SRD-Languages-es.json',
    '/La_Forja/SRD/es/5e-SRD-Magic-Items-es.json',
    '/La_Forja/SRD/es/5e-SRD-Magic-Schools-es.json',
    '/La_Forja/SRD/es/5e-SRD-Proficiencies-es.json',
    '/La_Forja/SRD/es/5e-SRD-Skills-es.json',
    '/La_Forja/SRD/es/5e-SRD-Species-es.json',
    '/La_Forja/SRD/es/5e-SRD-Spells-es.json',
    '/La_Forja/SRD/es/5e-SRD-Subclasses-es.json',
    '/La_Forja/SRD/es/5e-SRD-Subspecies-es.json',
    '/La_Forja/SRD/es/5e-SRD-Traits-es.json',
    '/La_Forja/SRD/es/5e-SRD-Weapon-Mastery-Properties-es.json',
    '/La_Forja/SRD/es/5e-SRD-Weapon-Properties-es.json',
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

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    if (!event.request.url.startsWith('http')) return;
    // version.json nunca se sirve desde caché para que el checker siempre vea la versión real
    if (event.request.url.includes('version.json')) return;
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