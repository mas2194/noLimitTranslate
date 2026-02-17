"use client";

import { useEffect, useRef, useCallback } from 'react';
import { useTranslationStore } from '@/lib/store';

export function useWorker() {
    const workerRef = useRef<Worker | null>(null);
    const { setStatus, setProgress, setOutput, setError, setDevice, setModel, setLoadingInfo } = useTranslationStore();

    useEffect(() => {
        workerRef.current = new Worker(new URL('../lib/worker.ts', import.meta.url));

        workerRef.current.onmessage = (event) => {
            console.log("Hook received message:", event.data);
            const { status, progress, device, model, output, data } = event.data;

            if (status === 'loading') {
                setStatus('loading');
                setProgress(progress || 0);
                if (data) setLoadingInfo(data);
            } else if (status === 'ready') {
                setStatus('ready');
                setLoadingInfo(undefined);
                if (device) setDevice(device);
                if (model) setModel(model);
            } else if (status === 'translating') {
                setStatus('translating');
                if (output !== undefined) setOutput(output);
            } else if (status === 'done') {
                setStatus('done');
                if (output !== undefined) setOutput(output);
            } else if (status === 'error') {
                setStatus('error');
                setError(data);
            }
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, [setStatus, setProgress, setOutput, setError, setDevice, setModel]);

    const loadModel = useCallback(() => {
        if (!workerRef.current) return;
        workerRef.current.postMessage({ type: 'load' });
    }, []);

    const translate = useCallback((text: string, src_lang: string, tgt_lang: string) => {
        if (!workerRef.current) return;
        workerRef.current.postMessage({
            type: 'translate',
            data: { text, src_lang, tgt_lang }
        });
    }, []);

    return { translate, loadModel };
}
