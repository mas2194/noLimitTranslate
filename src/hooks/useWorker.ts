"use client";

import { useEffect, useRef, useCallback } from 'react';
import { useTranslationStore } from '@/lib/store';

export function useWorker() {
    const workerRef = useRef<Worker | null>(null);
    const { setStatus, setProgress, setOutput, setError, setDevice, setModel, setLoadingInfo } = useTranslationStore();

    const initializeWorker = useCallback(() => {
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
                const currentStatus = useTranslationStore.getState().status;
                if (currentStatus !== 'stopped') {
                    setStatus('translating');
                    if (output !== undefined) setOutput(output);
                }
            } else if (status === 'done' || status === 'stopped') {
                setStatus(status);
                if (output !== undefined) setOutput(output);
            } else if (status === 'error') {
                setStatus('error');
                setError(data);
            }
        };
    }, [setStatus, setProgress, setOutput, setError, setDevice, setModel, setLoadingInfo]); // creating dependency on internal setters is fine, they are stable from store

    useEffect(() => {
        initializeWorker();

        return () => {
            workerRef.current?.terminate();
        };
    }, [initializeWorker]);

    const loadModel = useCallback((modelId: 'gemma' | 'nllb') => {
        if (!workerRef.current) return;
        workerRef.current.postMessage({ type: 'load', data: { modelId } });
    }, []);

    const translate = useCallback((text: string, src_lang: string, tgt_lang: string) => {
        if (!workerRef.current) initializeWorker(); // Ensure worker exists
        if (!workerRef.current) return;
        workerRef.current.postMessage({
            type: 'translate',
            data: { text, src_lang, tgt_lang }
        });
    }, [initializeWorker]);

    const stop = useCallback(() => {
        if (!workerRef.current) return;
        workerRef.current.postMessage({ type: 'abort' });
        setStatus('stopped'); // Optimistically set status for instant feedback
    }, [setStatus]);

    return { translate, loadModel, stop };
}
