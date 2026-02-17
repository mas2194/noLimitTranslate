/**
 * noLimitTranslate Service Worker
 * Handles chunked gzipped model loading to bypass Cloudflare and Browser Cache limits.
 */

const CACHE_NAME = 'model-chunks-v2'; // Bumped version

self.addEventListener('install', (event) => {
    console.log('[SW] Installed version v2');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Activated and claiming clients');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Intercept .onnx_data and .onnx_data_N requests for TranslateGemma
    const isModelData = url.pathname.includes('translategemma') &&
        (url.pathname.endsWith('.onnx_data') || url.pathname.match(/\.onnx_data_\d+$/));

    if (isModelData) {
        console.log('[SW] Fetch intercepted for model data:', url.pathname);
        event.respondWith(handleChunkedRequest(event.request));
    }
});

/**
 * Reassembles gzipped chunks into a single stream.
 */
async function handleChunkedRequest(request) {
    const url = new URL(request.url);
    const filename = url.pathname.split('/').pop();

    // Safety check for base URL
    const lastSlashIndex = url.href.lastIndexOf('/');
    const chunkBaseUrl = url.href.substring(0, lastSlashIndex + 1);

    // Map filename to its chunk directory
    let folder = 'data_0';
    if (filename.includes('.onnx_data_1')) {
        folder = 'data_1';
    }

    const manifestUrl = `${chunkBaseUrl}${folder}/manifest.json`;
    const chunksFolderUrl = `${chunkBaseUrl}${folder}/`;

    console.log(`[SW] Reassembling ${filename} using folder: ${folder}`);
    console.log(`[SW] Manifest URL: ${manifestUrl}`);

    try {
        // 1. Fetch manifest
        const manifestResponse = await fetch(manifestUrl);
        if (!manifestResponse.ok) {
            console.error(`[SW] Manifest fetch failed (${manifestResponse.status}):`, manifestUrl);
            throw new Error(`Failed to fetch manifest: ${manifestUrl}`);
        }
        const manifest = await manifestResponse.json();
        console.log(`[SW] Manifest loaded for ${filename}. Total chunks: ${manifest.chunkCount}`);

        // 2. Create a ReadableStream that provides chunks sequentially
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for (let i = 0; i < manifest.chunkCount; i++) {
                        const chunkUrl = `${chunksFolderUrl}chunk_${i}.gz`;

                        const cache = await caches.open(CACHE_NAME);
                        let chunkResponse = await cache.match(chunkUrl);

                        if (!chunkResponse) {
                            console.log(`[SW] Downloading chunk ${i} for ${filename}...`);
                            chunkResponse = await fetch(chunkUrl);
                            if (!chunkResponse.ok) throw new Error(`Failed to fetch chunk ${i} for ${filename}`);
                            cache.put(chunkUrl, chunkResponse.clone());
                        } else {
                            // Subdued logging for chunks to avoid spam
                            if (i % 10 === 0) console.log(`[SW] Loading chunks ${i}... for ${filename} (from cache)`);
                        }

                        // Pipe the compressed stream through decompression and consume it
                        const ds = new DecompressionStream('gzip');
                        const decompressedStream = chunkResponse.body.pipeThrough(ds);
                        const reader = decompressedStream.getReader();

                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;
                            controller.enqueue(value);
                        }
                        reader.releaseLock();
                    }
                    console.log(`[SW] Successfully reassembled all chunks for ${filename}`);
                    controller.close();
                } catch (streamErr) {
                    console.error(`[SW] Stream error for ${filename}:`, streamErr);
                    controller.error(streamErr);
                }
            }
        });

        // 3. Return a response with the reassembled stream
        return new Response(stream, {
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Length': manifest.originalSize.toString(),
                // Add a custom header to confirm SW handling
                'X-Served-By': 'noLimitTranslate-SW'
            }
        });

    } catch (err) {
        console.error('[SW] Critical error in handleChunkedRequest:', err);
        // If we fail here, the model loading will definitely fail since the original file is missing
        return new Response(`Service Worker Error: ${err.message}`, { status: 500 });
    }
}
