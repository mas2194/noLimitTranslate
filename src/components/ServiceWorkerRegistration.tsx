'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            // 1. Unregister any existing service workers
            navigator.serviceWorker.getRegistrations().then(function (registrations) {
                for (let registration of registrations) {
                    registration.unregister();
                    console.log('[Registration] Unregistered obsolete Service Worker');
                }
            });

            // 2. Clear old model caches to free up disk space
            if (window.caches) {
                caches.keys().then((cacheNames) => {
                    cacheNames.forEach((cacheName) => {
                        if (cacheName.includes('model-chunks')) {
                            caches.delete(cacheName);
                            console.log(`[Cache] Deleted old cache: ${cacheName}`);
                        }
                    });
                });
            }
        }
    }, []);

    return null;
}

