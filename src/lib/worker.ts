
import { pipeline, env, PipelineType } from '@huggingface/transformers';

// Move languages into the worker to avoid any import resolution issues in worker context
export const SUPPORTED_LANGUAGES = [
    { label: "English", gemmaCode: "en", nllbCode: "eng_Latn" },
    { label: "Japanese", gemmaCode: "ja", nllbCode: "jpn_Jpan" },
    { label: "French", gemmaCode: "fr", nllbCode: "fra_Latn" },
    { label: "German", gemmaCode: "de", nllbCode: "deu_Latn" },
    { label: "Spanish", gemmaCode: "es", nllbCode: "spa_Latn" },
    { label: "Italian", gemmaCode: "it", nllbCode: "ita_Latn" },
    { label: "Portuguese", gemmaCode: "pt", nllbCode: "por_Latn" },
    { label: "Chinese (Traditional)", gemmaCode: "zh_TW", nllbCode: "zho_Hant" },
    { label: "Korean", gemmaCode: "ko", nllbCode: "kor_Hang" },
    { label: "Russian", gemmaCode: "ru", nllbCode: "rus_Cyrl" },
    { label: "Arabic", gemmaCode: "ar", nllbCode: "ara_Arab" },
    { label: "Hindi", gemmaCode: "hi", nllbCode: "hin_Deva" },
    { label: "Bengali", gemmaCode: "bn", nllbCode: "ben_Beng" },
    { label: "Vietnamese", gemmaCode: "vi", nllbCode: "vie_Latn" },
    { label: "Thai", gemmaCode: "th", nllbCode: "tha_Thai" },
    { label: "Indonesian", gemmaCode: "id", nllbCode: "ind_Latn" },
    { label: "Turkish", gemmaCode: "tr", nllbCode: "tur_Latn" },
    { label: "Dutch", gemmaCode: "nl", nllbCode: "nld_Latn" },
    { label: "Polish", gemmaCode: "pl", nllbCode: "pol_Latn" },
    { label: "Swedish", gemmaCode: "sv", nllbCode: "swe_Latn" },
    { label: "Danish", gemmaCode: "da", nllbCode: "dan_Latn" },
    { label: "Finnish", gemmaCode: "fi", nllbCode: "fin_Latn" },
    { label: "Norwegian", gemmaCode: "no", nllbCode: "nob_Latn" },
    { label: "Czech", gemmaCode: "cs", nllbCode: "ces_Latn" },
    { label: "Greek", gemmaCode: "el", nllbCode: "ell_Latn" },
    { label: "Hungarian", gemmaCode: "hu", nllbCode: "hun_Latn" },
    { label: "Romanian", gemmaCode: "ro", nllbCode: "ron_Latn" },
    { label: "Ukrainian", gemmaCode: "uk", nllbCode: "ukr_Cyrl" },
    { label: "Hebrew", gemmaCode: "he", nllbCode: "heb_Hebr" },
    { label: "Tamil", gemmaCode: "ta", nllbCode: "tam_Taml" },
    { label: "Telugu", gemmaCode: "te", nllbCode: "tel_Telu" },
    { label: "Kannada", gemmaCode: "kn", nllbCode: "kan_Knda" },
    { label: "Malayalam", gemmaCode: "ml", nllbCode: "mal_Mlym" },
    { label: "Marathi", gemmaCode: "mr", nllbCode: "mar_Deva" },
    { label: "Gujarati", gemmaCode: "gu", nllbCode: "guj_Gujr" },
    { label: "Urdu", gemmaCode: "ur", nllbCode: "urd_Arab" },
    { label: "Burmese", gemmaCode: "my", nllbCode: "mya_Mymr" },
    { label: "Nepali", gemmaCode: "ne", nllbCode: "npi_Deva" },
    { label: "Afrikaans", gemmaCode: "af", nllbCode: "afr_Latn" },
    { label: "Swahili", gemmaCode: "sw", nllbCode: "swh_Latn" },
    { label: "Amharic", gemmaCode: "am", nllbCode: "amh_Ethi" },
    { label: "Zulu", gemmaCode: "zu", nllbCode: "zul_Latn" },
    { label: "Bulgarian", gemmaCode: "bg", nllbCode: "bul_Cyrl" },
    { label: "Croatian", gemmaCode: "hr", nllbCode: "hrv_Latn" },
    { label: "Slovak", gemmaCode: "sk", nllbCode: "slk_Latn" },
    { label: "Slovenian", gemmaCode: "sl", nllbCode: "slv_Latn" },
    { label: "Lithuanian", gemmaCode: "lt", nllbCode: "lit_Latn" },
    { label: "Latvian", gemmaCode: "lv", nllbCode: "lav_Latn" },
    { label: "Estonian", gemmaCode: "et", nllbCode: "est_Latn" },
    { label: "Basque", gemmaCode: "eu", nllbCode: "eus_Latn" },
    { label: "Catalan", gemmaCode: "ca", nllbCode: "cat_Latn" },
    { label: "Galician", gemmaCode: "gl", nllbCode: "glg_Latn" },
    { label: "Georgian", gemmaCode: "ka", nllbCode: "kat_Geor" },
    { label: "Azerbaijani", gemmaCode: "az", nllbCode: "azj_Latn" },
    { label: "Persian", gemmaCode: "fa", nllbCode: "fas_Arab" }
];

// Check if we are running in a production-like environment for local model loading
env.allowLocalModels = true;
env.allowRemoteModels = true;
env.useBrowserCache = true;
env.localModelPath = '/models/';

// Define message types
export interface WorkerMessage {
    type: 'load' | 'translate';
    data?: {
        text?: string;
        src_lang?: string;
        tgt_lang?: string;
    };
}

export interface WorkerResponse {
    status: 'loading' | 'ready' | 'translating' | 'done' | 'error';
    data?: unknown;
    device?: 'webgpu' | 'cpu';
    model?: string;
    progress?: number;
    output?: string;
}

// Singleton for the pipeline
class TranslationPipeline {
    static task = 'text-generation';
    static primaryModel = 'translategemma';
    static fallbackModel = 'Xenova/nllb-200-distilled-600M';

    static instance: any = null;
    static activeDevice: 'webgpu' | 'cpu' = 'webgpu';
    static activeModel: string = 'TranslateGemma 4B';

    static async getInstance(progress_callback?: (data: { status: string; progress: number, name: string, file: string }) => void) {
        if (this.instance) return this.instance;

        try {
            console.log("Worker: Attempt 1: WebGPU + TranslateGemma 4B");
            if (!(navigator as any).gpu) throw new Error("WebGPU not supported");

            const p = await pipeline(this.task as PipelineType, this.primaryModel, {
                device: 'webgpu',
                dtype: 'q4',
                progress_callback: progress_callback as any,
                session_options: {
                    graphOptimizationLevel: 'basic',
                }
            } as any);

            this.instance = p;
            this.activeDevice = 'webgpu';
            this.activeModel = 'TranslateGemma 4B';
            return this.instance;
        } catch (err) {
            console.warn("Worker: WebGPU + TranslateGemma 4B failed.", err);
        }

        try {
            console.log("Worker: Attempt 2: CPU + TranslateGemma 4B");
            const p = await pipeline(this.task as PipelineType, this.primaryModel, {
                device: 'wasm',
                dtype: 'q4',
                progress_callback: progress_callback as any,
            } as any);

            this.instance = p;
            this.activeDevice = 'cpu';
            this.activeModel = 'TranslateGemma 4B';
            return this.instance;
        } catch (err) {
            console.warn("Worker: CPU + TranslateGemma 4B failed. Fallback to NLLB...", err);
        }

        try {
            console.log("Worker: Attempt 3: NLLB-200");
            const p = await pipeline('translation' as PipelineType, this.fallbackModel, {
                device: (navigator as any).gpu ? 'webgpu' : 'wasm',
                progress_callback: progress_callback as any,
            } as any);

            this.instance = p;
            this.activeDevice = (navigator as any).gpu ? 'webgpu' : 'cpu';
            this.activeModel = 'NLLB-200 (Stable Mode)';
            return this.instance;
        } catch (err) {
            console.error("Worker: All failed.", err);
            throw err;
        }
    }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
    console.log("Worker: Received message:", JSON.stringify(event.data));
    const { type, data } = event.data;

    try {
        if (type === 'load') {
            await TranslationPipeline.getInstance((x: any) => {
                if (x.status === 'progress' || x.status === 'initiate' || x.status === 'done') {
                    self.postMessage({
                        status: 'loading',
                        progress: x.progress || 0,
                        data: {
                            file: x.file || '',
                            loadStatus: x.status
                        }
                    } as WorkerResponse);
                }
            });
            self.postMessage({
                status: 'ready',
                device: TranslationPipeline.activeDevice,
                model: TranslationPipeline.activeModel
            } as WorkerResponse);
        } else if (type === 'translate') {
            const generator = await TranslationPipeline.getInstance();
            const text = data?.text || '';
            const src_lang = data?.src_lang || 'English';
            const tgt_lang = data?.tgt_lang || 'Japanese';

            console.log(`Worker: Translation Start: "${text}" [${src_lang} -> ${tgt_lang}] using ${TranslationPipeline.activeModel}`);

            // Find languages with logging
            const src = SUPPORTED_LANGUAGES.find(l => l.label === src_lang) || SUPPORTED_LANGUAGES[0];
            const tgt = SUPPORTED_LANGUAGES.find(l => l.label === tgt_lang) || SUPPORTED_LANGUAGES[1];

            console.log("Worker: Resolved languages:", {
                src: src.label, srcGemma: src.gemmaCode, srcNllb: src.nllbCode,
                tgt: tgt.label, tgtGemma: tgt.gemmaCode, tgtNllb: tgt.nllbCode
            });

            self.postMessage({ status: 'translating', output: '' } as WorkerResponse);

            if (TranslationPipeline.activeModel.includes('NLLB')) {
                const output = await generator(text, {
                    src_lang: src.nllbCode,
                    tgt_lang: tgt.nllbCode,
                });
                console.log("Worker: NLLB Output:", output);
                self.postMessage({
                    status: 'done',
                    output: output[0].translation_text,
                } as WorkerResponse);
            } else {
                const src_code = src.gemmaCode;
                const tgt_code = tgt.gemmaCode;

                // Prepare prompt
                let prompt = "";
                try {
                    prompt = generator.tokenizer.apply_chat_template([
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    source_lang_code: src_code,
                                    target_lang_code: tgt_code,
                                    text: text
                                }
                            ]
                        }
                    ], { tokenize: false, add_generation_prompt: true });
                } catch (e) {
                    console.warn("Worker: apply_chat_template failed, using manual fallback prompt.");
                    prompt = `<start_of_turn>user\nYou are a professional ${src.label} (${src_code}) to ${tgt.label} (${tgt_code}) translator. Translate the following text into ${tgt.label}:\n\n${text}<end_of_turn>\n<start_of_turn>model\n`;
                }

                console.log("Worker: Final Prompt:", prompt);

                const output = await generator(prompt, {
                    max_new_tokens: 512,
                    temperature: 0.1,
                    do_sample: false,
                    return_full_text: false,
                    callback_function: (x: any) => {
                        let text = x[0].generated_text;
                        if (text.startsWith(prompt)) text = text.substring(prompt.length);

                        // Clean intro chatter
                        const cleanOutput = (t: string) => {
                            let res = t;
                            res = res.replace(/^(.*?可|.*?(is|as|translated to|translation):)\s*/i, '');
                            res = res.replace(new RegExp(`^.*?${text}.*?as:\\s*`, 'i'), '');
                            res = res.replace(/^(Target|Translation)\s*\(.*?\):\s*/i, '');
                            const stopIdx = res.indexOf('***');
                            if (stopIdx !== -1) res = res.substring(0, stopIdx);
                            return res.trim();
                        };

                        self.postMessage({ status: 'translating', output: cleanOutput(text) } as WorkerResponse);
                    }
                } as any);

                const cleanFinal = (t: string) => {
                    let res = t;
                    if (res.startsWith(prompt)) res = res.substring(prompt.length);
                    res = res.replace(/^(.*?可|.*?(is|as|translated to|translation):)\s*/i, '');
                    res = res.replace(new RegExp(`^.*?${text}.*?as:\\s*`, 'i'), '');
                    res = res.replace(/^(Target|Translation)\s*\(.*?\):\s*/i, '');
                    const stopIdx = res.indexOf('***');
                    if (stopIdx !== -1) res = res.substring(0, stopIdx);
                    return res.trim();
                };

                const finalCleaned = cleanFinal((output as any)[0].generated_text);
                console.log("Worker: Final Cleaned:", finalCleaned);
                self.postMessage({ status: 'done', output: finalCleaned } as WorkerResponse);
            }
        }
    } catch (err: unknown) {
        console.error("Worker Error:", err);
        self.postMessage({
            status: 'error',
            data: String(err),
            device: TranslationPipeline.activeDevice as any
        } as WorkerResponse);
    }
});
