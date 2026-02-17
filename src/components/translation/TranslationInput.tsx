"use client";

import { ArrowRightLeft, Languages } from "lucide-react";
import { useTranslationStore } from "@/lib/store";
import { SUPPORTED_LANGUAGES } from "@/lib/languages";

interface Props {
    onTranslate: () => void;
    isTranslating: boolean;
}

export function TranslationInput({ onTranslate, isTranslating }: Props) {
    const { input, setInput, sourceLang, setLanguages, targetLang, status } = useTranslationStore();
    const isLoading = status === 'loading';

    return (
        <div className="group relative card-panel rounded-[var(--spacing-gr-3)] p-[var(--spacing-gr-3)] flex flex-col h-[400px]">
            <div className="flex justify-between items-center mb-[var(--spacing-gr-2)] border-b border-slate-100 pb-4">
                <div className="relative">
                    <select
                        value={sourceLang}
                        onChange={(e) => setLanguages(e.target.value, targetLang)}
                        className="appearance-none select-trigger pl-4 pr-10 py-2 rounded-lg font-medium cursor-pointer"
                    >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <option key={lang.label} value={lang.label}>
                                {lang.label}
                            </option>
                        ))}
                    </select>

                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Languages className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text to translate..."
                className="w-full flex-1 input-field text-[var(--text-md)] placeholder:text-slate-400 font-light tracking-wide leading-relaxed resize-none p-2"
                spellCheck="false"
            />

            <div className="flex justify-end pt-[var(--spacing-gr-2)]">
                <button
                    onClick={onTranslate}
                    disabled={isLoading || isTranslating || !input.trim()}
                    className="primary-button group/btn px-[var(--spacing-gr-4)] py-3 rounded-xl flex items-center gap-3 font-medium text-sm"
                >
                    {isTranslating ? (
                        <>
                            <span className="relative z-10 w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Translating...</span>
                        </>
                    ) : (
                        <>
                            <span>Translate</span>
                            <ArrowRightLeft className="w-4 h-4 group-hover/btn:rotate-180 transition-transform duration-500" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
