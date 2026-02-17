'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            console.log('[Registration] Initializing immediate registration...');

            navigator.serviceWorker.register('/sw.js', { scope: '/' })
                .then((registration) => {
                    console.log('[Registration] Success! Scope:', registration.scope);

                    // Force the new Service Worker to take over
                    if (registration.waiting) {
                        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                    }
                })
                .catch((error) => {
                    console.error('[Registration] Failed:', error);
                });

            // Listen for controller changes
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('[Registration] Service Worker is now controlling the page');
            });
        }
    }, []);

    return null;
}
