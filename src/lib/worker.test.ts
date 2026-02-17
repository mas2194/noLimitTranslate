
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// --- Mock Globals BEFORE ANY IMPORTS ---
// We need to setup global.self before importing the worker file
const postMessageMock = vi.fn();
const addEventListenerMock = vi.fn();

// Use Object.defineProperty to set read-only global properties if needed, 
// or just modify the global object directly for JSDOM environment.
global.self = {
    postMessage: postMessageMock,
    addEventListener: addEventListenerMock,
} as any;

// Ensure global.navigator exists
if (typeof global.navigator === 'undefined') {
    global.navigator = {} as Navigator;
}

// Mock navigator.gpu
Object.defineProperty(global.navigator, 'gpu', {
    value: {
        requestAdapter: vi.fn(),
    },
    writable: true,
});

// Mock transformers.js
// We must use vi.mock outside/before imports
vi.mock('@huggingface/transformers', () => {
    return {
        pipeline: vi.fn(),
        env: {
            allowLocalModels: false,
            useBrowserCache: true,
        },
        PipelineType: {},
        TextGenerationPipeline: {},
    };
});

describe('TranslationWorker', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Since worker.ts executes immediately on import, we need to reset modules
        vi.resetModules();
    });

    it('should register message listener', async () => {
        // Import the worker file to trigger its side effects (addEventListener)
        await import('./worker');
        expect(addEventListenerMock).toHaveBeenCalledWith('message', expect.any(Function));
    });

    it('should handle load message', async () => {
        // Import worker
        await import('./worker');

        // Get the registered listener
        const calls = addEventListenerMock.mock.calls;
        expect(calls.length).toBeGreaterThan(0);
        const listener = calls[0][1];

        // Setup pipeline mock resolution
        const { pipeline } = await import('@huggingface/transformers');
        const mockGenerator = vi.fn();
        (pipeline as any).mockResolvedValue(mockGenerator);

        // Initial check: pipeline not called yet (lazy load or on 'load' message?)
        // worker.ts: checks instance. getInstance calls pipeline if null.
        // However, worker logic is inside the listener for 'load'.

        // Simulate 'load' message
        await listener({ data: { type: 'load' } } as MessageEvent);

        // Verify pipeline was initialized
        expect(pipeline).toHaveBeenCalled();
        // Verify worker posted 'ready'
        expect(postMessageMock).toHaveBeenCalledWith(expect.objectContaining({ status: 'ready' }));
    });
});
