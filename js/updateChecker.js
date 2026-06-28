// Módulo de actualización de La Forja — sin dependencias externas
// Compara la versión local contra version.json en GitHub Pages.
// Expone window.ForjaUpdater para su uso desde la app React.
(function () {
    'use strict';

    const VERSION_URL = 'https://evionail.github.io/La_Forja/version.json';
    // 56 horas ≈ 3 veces por semana
    const CHECK_INTERVAL_MS = 56 * 60 * 60 * 1000;
    const LS_LAST_CHECK   = 'forja_lastUpdateCheck';
    const LS_DISMISSED    = 'forja_updateDismissed';

    async function fetchRemoteVersion() {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        try {
            const res = await fetch(VERSION_URL + '?t=' + Date.now(), {
                cache: 'no-store',
                signal: controller.signal
            });
            clearTimeout(timer);
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return await res.json();
        } catch (e) {
            clearTimeout(timer);
            throw e;
        }
    }

    window.ForjaUpdater = {
        // Llama a check() solo si pasaron más de 56 h desde la última vez.
        async checkIfNeeded(currentVersion) {
            const lastCheck = parseInt(localStorage.getItem(LS_LAST_CHECK) || '0', 10);
            if (Date.now() - lastCheck < CHECK_INTERVAL_MS) return null;
            return this.check(currentVersion);
        },

        // Siempre consulta GitHub, ignora el intervalo (para el botón manual).
        async check(currentVersion) {
            try {
                const data = await fetchRemoteVersion();
                localStorage.setItem(LS_LAST_CHECK, String(Date.now()));
                if (!data || !data.version) return null;
                return {
                    hasUpdate: data.version !== currentVersion,
                    version: data.version
                };
            } catch (e) {
                console.warn('[ForjaUpdater] No se pudo verificar la versión:', e.message);
                return null;
            }
        },

        // Marca esta versión como descartada hasta que aparezca una nueva.
        dismiss(version) {
            localStorage.setItem(LS_DISMISSED, version || '');
        },

        isDismissed(version) {
            return localStorage.getItem(LS_DISMISSED) === version;
        },

        // Limpia caché del SW + todos los caches + recarga la página.
        async applyUpdate() {
            try {
                if ('serviceWorker' in navigator) {
                    const reg = await navigator.serviceWorker.getRegistration();
                    if (reg && reg.waiting) {
                        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                        await new Promise(r => setTimeout(r, 400));
                    }
                }
                if ('caches' in window) {
                    const keys = await caches.keys();
                    await Promise.all(keys.map(k => caches.delete(k)));
                }
            } finally {
                // eslint-disable-next-line no-restricted-globals
                location.reload(true);
            }
        }
    };
})();
