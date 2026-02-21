"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTranslationStore } from "@/lib/store";

export function Header() {
    const { device, model } = useTranslationStore();

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-[var(--spacing-gr-2)] mb-[var(--spacing-gr-3)]"
        >
            <div className="flex flex-wrap justify-center items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50/80 border border-blue-100 text-sm text-blue-700 shadow-sm backdrop-blur-sm">
                    <span className="tracking-wide font-bold">100% Free</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-100 text-sm text-emerald-700 shadow-sm backdrop-blur-sm">
                    <span className="tracking-wide font-bold">(Almost) Fully Local</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-sm text-slate-600 shadow-sm">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span className="tracking-wide font-medium">
                        Powered by {device === 'cpu' ? 'CPU' : 'WebGPU'} & {model || 'AI Model'}
                    </span>
                </div>
            </div>

            <h1 className="text-[var(--text-xl)] font-bold tracking-tighter text-slate-900 leading-none">
                noLimit
                <span className="text-blue-600">Translate</span>
            </h1>
        </motion.div>
    );
}
