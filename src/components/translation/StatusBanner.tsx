"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Download, Power } from "lucide-react";
import { useTranslationStore } from "@/lib/store";

interface StatusBannerProps {
    onInitialize?: () => void;
}

export function StatusBanner({ onInitialize }: StatusBannerProps) {
    const { status, progress, error, loadingInfo } = useTranslationStore();
    const isLoading = status === 'loading';
    const isIdle = status === 'idle';

    // Better messaging for loading state
    const isDownloading = loadingInfo?.loadStatus === 'progress' || loadingInfo?.loadStatus === 'initiate';
    const mainTitle = isDownloading ? "Downloading Model" : "Initializing AI Engine";
    const subTitle = loadingInfo?.file
        ? `Processing: ${loadingInfo.file.split('/').pop()}`
        : (isDownloading ? "Preparing TranslateGemma (Text 4B). This happens once." : "Starting WebGPU Runtime...");

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        className="mb-4 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-4 overflow-hidden shadow-sm"
                    >
                        <div className="p-2 bg-red-100 rounded-full shrink-0">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="font-medium tracking-wide">{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isIdle && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="card-panel p-[var(--spacing-gr-3)] rounded-[var(--spacing-gr-2)] flex flex-col md:flex-row items-center justify-between gap-6 bg-white border-2 border-dashed border-blue-100/50"
                    >
                        <div className="flex items-center gap-4 text-center md:text-left">
                            <div className="p-3 bg-blue-50 rounded-full shrink-0">
                                <Power className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 tracking-wide text-lg">AI Engine Standby</h3>
                                <p className="text-sm text-slate-500">
                                    Click to initialize Gzipped Gemma 4B on WebGPU (one-time ~2.5GB download).
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onInitialize}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <Download className="w-5 h-5" />
                            Initialize AI Engine
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="card-panel p-[var(--spacing-gr-2)] rounded-[var(--spacing-gr-2)] flex flex-col gap-4 relative overflow-hidden bg-white"
                    >
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="p-3 bg-blue-50 rounded-full border border-blue-100/50">
                                <Download className="w-6 h-6 text-blue-500" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-800 tracking-wide text-lg flex items-center gap-2">
                                    {mainTitle}
                                    <span className="text-xs font-normal bg-blue-100 border border-blue-200 px-2 py-0.5 rounded text-blue-600 uppercase">
                                        {status === 'loading' ? (loadingInfo?.file?.includes('onnx') ? 'WebGPU/WASM' : 'Loading') : 'ready'}
                                    </span>
                                    {isDownloading && (
                                        <span className="text-xs font-normal bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-500">~2.5GB</span>
                                    )}
                                </h3>
                                <p className="text-sm text-slate-500 font-normal">
                                    {subTitle}
                                </p>
                            </div>
                            <span className="font-mono text-xl font-bold text-blue-600 tabular-nums">
                                {Math.round(progress)}%
                            </span>
                        </div>

                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-blue-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ type: "spring", stiffness: 50, damping: 15 }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
