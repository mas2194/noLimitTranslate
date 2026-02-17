
import { describe, it, expect, beforeEach } from 'vitest';
import { useTranslationStore } from './store';

describe('useTranslationStore', () => {
    beforeEach(() => {
        // Reset store state if needed, though Zustand creates a fresh store usually if not persisted
        useTranslationStore.setState({
            status: 'idle',
            progress: 0,
            output: '',
            sourceLang: 'English',
            targetLang: 'Japanese',
            input: '',
            error: null,
        });
    });

    it('should have initial state', () => {
        const state = useTranslationStore.getState();
        expect(state.status).toBe('idle');
        expect(state.sourceLang).toBe('English');
        expect(state.targetLang).toBe('Japanese');
    });

    it('should update input', () => {
        useTranslationStore.getState().setInput('Hello');
        expect(useTranslationStore.getState().input).toBe('Hello');
    });

    it('should update status', () => {
        useTranslationStore.getState().setStatus('loading');
        expect(useTranslationStore.getState().status).toBe('loading');
    });

    it('should update languages', () => {
        useTranslationStore.getState().setLanguages('French', 'German');
        expect(useTranslationStore.getState().sourceLang).toBe('French');
        expect(useTranslationStore.getState().targetLang).toBe('German');
    });
});
