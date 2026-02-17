"use client";

import { ArrowRightLeft, Languages, ClipboardCopy } from "lucide-react";
import { useTranslationStore } from "@/lib/store";
import { SUPPORTED_LANGUAGES } from "@/lib/languages";

interface Props {
    isTranslating: boolean;
}

export function TranslationOutput({ isTranslating }: Props) {
    const { output, targetLang, setLanguages, sourceLang } = useTranslationStore();

    const handleCopy = () => {
        if (output) navigator.clipboard.writeText(output);
    };

    return (
        <div className="group relative card-panel rounded-[var(--spacing-gr-3)] p-[var(--spacing-gr-3)] flex flex-col h-[400px] bg-slate-50/50">
            <div className="flex justify-between items-center mb-[var(--spacing-gr-2)] border-b border-slate-100 pb-4">
                <div className="relative">
                    <select
                        value={targetLang}
                        onChange={(e) => setLanguages(sourceLang, e.target.value)}
                        className="appearance-none select-trigger pl-4 pr-10 py-2 rounded-lg font-medium cursor-pointer text-blue-600 bg-blue-50 hover:bg-blue-100"
                    >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <option key={lang.label} value={lang.label}>
                                {lang.label}
                            </option>
                        ))}
                    </select>

                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400">
                        <Languages className="w-4 h-4" />
                    </div>
                </div>

                {output && (
                    <button
                        onClick={handleCopy}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Copy to clipboard"
                    >
                        <ClipboardCopy className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="flex-1 w-full overflow-y-auto custom-scrollbar relative p-2">
                {output ? (
                    <p className="text-[var(--text-md)] text-slate-800 font-light leading-relaxed whitespace-pre-wrap tracking-wide">
                        {output}
                        {isTranslating && (
                            <span className="inline-block w-2 h-6 ml-1 bg-blue-500 animate-pulse align-middle rounded-full" />
                        )}
                    </p>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 pointer-events-none">
                        <ArrowRightLeft className="w-12 h-12 mb-4 opacity-50" />
                        <p className="text-sm font-medium tracking-widest uppercase">Translation Output</p>
                    </div>
                )}
            </div>
        </div>
    );
}
