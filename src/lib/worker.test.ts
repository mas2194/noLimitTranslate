
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

    describe('splitTextIntoChunks', () => {
        it('should return single chunk if text is within limit', async () => {
            const { splitTextIntoChunks } = await import('./worker');
            const text = "Hello world";
            const chunks = splitTextIntoChunks(text, 100);
            expect(chunks).toEqual(["Hello world"]);
        });

        it('should split by paragraphs', async () => {
            const { splitTextIntoChunks } = await import('./worker');
            const p1 = "Paragraph 1.";
            const p2 = "Paragraph 2.";
            const text = `${p1}\n\n${p2}`;
            // Max length small enough to force split between paragraphs
            const chunks = splitTextIntoChunks(text, 15);
            expect(chunks).toEqual([p1, p2]);
        });

        it('should split by sentences', async () => {
            const { splitTextIntoChunks } = await import('./worker');
            const s1 = "Sentence one.";
            const s2 = "Sentence two.";
            const text = `${s1} ${s2}`;
            // Max length small enough to split sentences
            const chunks = splitTextIntoChunks(text, 15);
            expect(chunks).toEqual([`${s1} `, s2]);
        });

        it('should combine small paragraphs/sentences', async () => {
            const { splitTextIntoChunks } = await import('./worker');
            const s1 = "Hi.";
            const s2 = "There.";
            const text = `${s1} ${s2}`;
            // Max length large enough to keep them together
            const chunks = splitTextIntoChunks(text, 100);
            expect(chunks).toEqual([`${s1} ${s2}`]);
        });

        it('should force split very long words/sentences', async () => {
            const { splitTextIntoChunks } = await import('./worker');
            const longText = "A".repeat(20); // 20 chars
            const chunks = splitTextIntoChunks(longText, 10); // max 10
            expect(chunks).toEqual(["A".repeat(10), "A".repeat(10)]);
        });
    });
});
