"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Download, Power, AlertTriangle, X, Sparkles, Cpu } from "lucide-react";
import { useTranslationStore } from "@/lib/store";

interface StatusBannerProps {
    onInitialize?: (modelId: 'gemma' | 'nllb') => void;
}

export function StatusBanner({ onInitialize }: StatusBannerProps) {
    const { status, progress, error, loadingInfo } = useTranslationStore();
    const [showWarning, setShowWarning] = useState(false);
    const [warningReasons, setWarningReasons] = useState<string[]>([]);
    const isLoading = status === 'loading';
    const isIdle = status === 'idle';

    const handleInitializeClick = (modelId: 'gemma' | 'nllb') => {
        const reasons: string[] = [];

        // Only show WebGPU warnings if they selected Gemma
        if (modelId === 'gemma') {
            if (!(navigator as any).gpu) {
                reasons.push("WebGPU is not supported by your browser. The model will run on the CPU and will be extremely slow. Consider using NLLB-200 instead.");
            }

            if ('deviceMemory' in navigator) {
                const ram = (navigator as any).deviceMemory;
                if (typeof ram === 'number' && ram < 4) {
                    reasons.push(`Your device reports having ${ram}GB of RAM. At least 4GB is recommended to run Gemma safely.`);
                }
            }

            const isMobile = window.matchMedia("(max-width: 768px)").matches || /Mobi|Android/i.test(navigator.userAgent);
            if (isMobile) {
                reasons.push("Mobile devices typically lack the memory to run large AI models efficiently. The browser may freeze or close.");
            }
        }

        if (reasons.length > 0) {
            setWarningReasons(reasons);
            setShowWarning(true);
        } else {
            onInitialize?.(modelId);
        }
    };

    // Better messaging for loading state
    const isDownloading = loadingInfo?.loadStatus === 'progress' || loadingInfo?.loadStatus === 'initiate';
    const mainTitle = isDownloading ? "Downloading Model" : "Initializing AI Engine";
    const subTitle = loadingInfo?.file
        ? `Processing: ${loadingInfo.file.split('/').pop()}`
        : (isDownloading ? "Preparing TranslateGemma (Text 4B). This happens once." : "Starting WebGPU Runtime...");

    return (
        <div className="w-full">
            {/* Performance Warning Modal */}
            <AnimatePresence>
                {showWarning && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6 bg-amber-50/50 border-b border-amber-100 flex items-start gap-4">
                                <div className="p-3 bg-amber-100/50 rounded-full text-amber-600 shrink-0">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-slate-800">Performance Warning</h3>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Your device may struggle to run this AI model natively. Proceeding might cause your browser to freeze or crash.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowWarning(false)}
                                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6">
                                <ul className="space-y-3 mb-6">
                                    {warningReasons.map((reason, idx) => (
                                        <li key={idx} className="flex gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                                            <span>{reason}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={() => setShowWarning(false)}
                                        className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowWarning(false);
                                            // The warning modal is currently decoupled from the specific click,
                                            // but since warning only fires for gemma, we can pass 'gemma'
                                            onInitialize?.('gemma');
                                        }}
                                        className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-200 transition-colors border border-amber-500"
                                    >
                                        Try Anyway
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
                        className="card-panel p-[var(--spacing-gr-3)] rounded-[var(--spacing-gr-2)] flex flex-col gap-6 bg-white border-2 border-dashed border-blue-100/50"
                    >
                        <div className="flex items-center gap-4 text-center md:text-left">
                            <div className="p-3 bg-blue-50 rounded-full shrink-0">
                                <Power className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 tracking-wide text-lg">Select AI Engine</h3>
                                <p className="text-sm text-slate-500">
                                    Choose an engine to run in your browser. All translations happen locally.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Option 1: TranslateGemma 4B */}
                            <button
                                onClick={() => handleInitializeClick('gemma')}
                                className="group flex items-start gap-4 p-4 border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all text-left bg-gradient-to-br from-white to-slate-50 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/50 transition-colors pointer-events-none" />
                                <div className="p-2 shrink-0 bg-blue-100/50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                        TranslateGemma
                                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">Recommended</span>
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-1 mb-2">Google's high-quality 4B parameter model. Highly accurate contextual translations.</p>
                                    <div className="flex flex-wrap gap-2 text-[10px] font-medium">
                                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">GPU Required</span>
                                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">~2.5GB Download</span>
                                    </div>
                                </div>
                            </button>

                            {/* Option 2: NLLB-200 */}
                            <button
                                onClick={() => handleInitializeClick('nllb')}
                                className="group flex items-start gap-4 p-4 border border-slate-200 rounded-xl hover:border-emerald-400 hover:shadow-md transition-all text-left bg-gradient-to-br from-white to-slate-50 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-emerald-50/0 group-hover:bg-emerald-50/50 transition-colors pointer-events-none" />
                                <div className="p-2 shrink-0 bg-emerald-100/50 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform">
                                    <Cpu className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">
                                        NLLB-200
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-1 mb-2">Meta's lightweight distilled model. Fast initialization and wide language support.</p>
                                    <div className="flex flex-wrap gap-2 text-[10px] font-medium">
                                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">CPU Only</span>
                                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">~600MB Download</span>
                                    </div>
                                </div>
                            </button>
                        </div>
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
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 relative z-10">
                            <div className="p-3 bg-blue-50 rounded-full border border-blue-100/50 shrink-0 hidden sm:block">
                                <Download className="w-6 h-6 text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0 w-full">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h3 className="font-bold text-slate-800 tracking-wide text-base sm:text-lg whitespace-nowrap">
                                        {mainTitle}
                                    </h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        <span className="text-[10px] sm:text-xs font-normal bg-blue-100 border border-blue-200 px-2 py-0.5 rounded text-blue-600 uppercase">
                                            {status === 'loading' ? (loadingInfo?.file?.includes('onnx') ? 'WebGPU/WASM' : 'Loading') : 'ready'}
                                        </span>
                                        {isDownloading && (
                                            <span className="text-[10px] sm:text-xs font-normal bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-500">~2.5GB</span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-500 font-normal truncate">
                                    {subTitle}
                                </p>
                            </div>
                            <div className="flex items-center justify-between w-full sm:w-auto sm:block">
                                <div className="p-2 bg-blue-50 rounded-full border border-blue-100/50 sm:hidden">
                                    <Download className="w-5 h-5 text-blue-500" />
                                </div>
                                <span className="font-mono text-lg sm:text-xl font-bold text-blue-600 tabular-nums">
                                    {Math.round(progress)}%
                                </span>
                            </div>
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
