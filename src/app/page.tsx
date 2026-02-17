"use client";

import { useWorker } from "@/hooks/useWorker";
import { useTranslationStore } from "@/lib/store";
import { Header } from "@/components/translation/Header";
import { StatusBanner } from "@/components/translation/StatusBanner";
import { TranslationInput } from "@/components/translation/TranslationInput";
import { TranslationOutput } from "@/components/translation/TranslationOutput";
import { ArrowRightLeft } from "lucide-react";

export default function Home() {
  const { translate, loadModel } = useWorker();
  const { status, input, sourceLang, targetLang, swapLanguages } = useTranslationStore();

  const handleTranslate = () => {
    if (!input.trim() || status === 'loading' || status === 'idle') return;
    translate(input, sourceLang, targetLang);
  };

  const isTranslating = status === 'translating';

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden font-sans selection:bg-blue-500/30">

      {/* Aurora Background */}
      <div className="fixed inset-0 bg-slate-50 pointer-events-none" />
      <div className="fixed top-[10%] left-[20%] w-[300px] h-[300px] bg-blue-100/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[20%] right-[10%] w-[400px] h-[400px] bg-indigo-100/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[1000px] flex flex-col gap-[var(--spacing-gr-4)] p-[var(--spacing-gr-3)]">

        <Header />

        <StatusBanner onInitialize={loadModel} />

        <div className="flex flex-col md:grid md:grid-cols-2 gap-[var(--spacing-gr-3)] relative">
          <TranslationInput onTranslate={handleTranslate} isTranslating={isTranslating} />

          {/* Swap Button - Center positioned on desktop, between cards on mobile */}
          <div className="flex justify-center items-center md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-20 py-2 md:py-0">
            <button
              onClick={swapLanguages}
              className="p-3 bg-white border border-slate-200 rounded-full shadow-lg text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:scale-110 active:scale-95 transition-all duration-300 md:rotate-0 rotate-90"
              title="Swap languages"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>
          </div>

          <TranslationOutput isTranslating={isTranslating} />
        </div>

        <p className="text-center text-slate-400 text-xs mt-[var(--spacing-gr-4)] font-medium tracking-[0.1em] uppercase">
          Privacy-First AI Translation • Powered by WebGPU
        </p>
      </div>
    </main>
  );
}
