
import { create } from 'zustand';

interface TranslationState {
    status: 'idle' | 'loading' | 'ready' | 'translating' | 'done' | 'stopped' | 'error';
    device: 'webgpu' | 'cpu' | null;
    model: string | null; // Track active model name
    progress: number;
    output: string;
    sourceLang: string;
    targetLang: string;
    input: string;
    error: string | null;
    loadingInfo?: {
        file: string;
        loadStatus: string;
    };

    // Actions
    setStatus: (status: TranslationState['status']) => void;
    setDevice: (device: TranslationState['device']) => void;
    setModel: (model: string) => void;
    setProgress: (progress: number) => void;
    setOutput: (output: string) => void;
    setInput: (input: string) => void;
    setLanguages: (src: string, tgt: string) => void;
    swapLanguages: () => void;
    setError: (error: string | null) => void;
    setLoadingInfo: (info: { file: string, loadStatus: string } | undefined) => void;
}

export const useTranslationStore = create<TranslationState>((set) => ({
    status: 'idle',
    device: null,
    model: null,
    progress: 0,
    output: '',
    sourceLang: 'English',
    targetLang: 'Japanese',
    input: '',
    error: null,

    setStatus: (status) => set({ status }),
    setDevice: (device) => set({ device }),
    setModel: (model) => set({ model }),
    setProgress: (progress) => set({ progress }),
    setOutput: (output) => set({ output }),
    setInput: (input) => set({ input }),
    setLanguages: (sourceLang, targetLang) => set({ sourceLang, targetLang }),
    swapLanguages: () => set((state) => ({
        sourceLang: state.targetLang,
        targetLang: state.sourceLang,
        input: state.output,
        output: state.input,
    })),
    setError: (error) => set({ error }),
    setLoadingInfo: (loadingInfo) => set({ loadingInfo }),
}));
