# noLimitTranslate 設計・実装ドキュメント

## 1. プロジェクト概要
**noLimitTranslate** は、WebGPU と Transformers.js を活用した、完全クライアントサイド実行型の無制限翻訳 Web アプリケーションです。高額なサーバーコストを排除し、ユーザーのデバイス上で高度な翻訳モデル（TranslateGemma 4B）を動作させることで、プライバシーと可用性を両立させます。

## 2. 要件定義

### 2.1 機能要件
*   **テキスト翻訳**: ユーザーが入力したテキストを希望の言語へ翻訳する機能。
*   **WebGPU 推論**: サーバー API を使用せず、クライアントの GPU を利用して高速に推論を実行。
*   **リアルタイム・ストリーミング**: 生成された翻訳結果をトークン単位で逐次表示し、応答待ち時間を短縮。
*   **オフライン動作**: 初回モデルダウンロード後は、インターネット接続なしでも動作可能な PWA 指向。
*   **多言語対応**: 英語、日本語、フランス語、ドイツ語など主要言語のサポート（モデルに依存）。

### 2.2 非機能要件
*   **パフォーマンス**: メインスレッドをブロックしない Web Worker による非同期処理。
*   **UI/UX**: グラスモーフィズム（すりガラス効果）とアニメーションを取り入れたリッチでモダンなデザイン。
*   **プライバシー**: 入力データや翻訳結果は一切外部サーバーに送信されない。
*   **スケーラビリティ**: Cloudflare Pages への静的エクスポートによる低コストかつ高可用性な配信。

## 3. 技術スタック

| カテゴリ | 技術・ツール | 説明 |
| :--- | :--- | :--- |
| **フレームワーク** | Next.js (App Router) | React ベースのアプリケーションフレームワーク。静的エクスポート (`output: 'export'`) を使用。 |
| **言語** | TypeScript | 型安全な開発のために全面採用。 |
| **AI エンジン** | @huggingface/transformers (v4.0.0-next.3) | ブラウザ上での Transformer モデル実行ライブラリ。最新の C++ ベース WebGPU ランタイムを使用。 |
| **モデル** | TranslateGemma 4B / NLLB-200 | Google 製 Gemma 4B の ONNX 版、および安定動作のための NLLB-200 (600M)。 |
| **ステート管理** | Zustand | シンプルかつ軽量なグローバル状態管理。Worker と UI の連携に使用。 |
| **スタイリング** | Tailwind CSS v4 | ユーティリティファーストな CSS フレームワーク。 |
| **アニメーション** | Framer Motion | スムーズな UI トランジションとインタラクションの実現。 |
| **アイコン** | Lucide React | 軽量で一貫性のあるアイコンセット。 |
| **テスト** | Vitest, Playwright | ユニットテスト（ロジック）と E2E テスト（UI）。 |
| **デプロイ** | Cloudflare Pages | 静的サイトホスティング。 |

## 4. システムアーキテクチャ

### 4.1 全体構成
アプリケーションは、UI を担当する「メインスレッド」と、AI モデルの推論を担当する「Web Worker」の 2 スレッド構成で動作します。

```mermaid
graph TD
    User[ユーザー] --> UI[メインスレッド (UI)]
    UI -- 翻訳リクエスト (text, lang) --> Worker[Web Worker (AI)]
    Worker -- モデルロード進捗 --> UI
    Worker -- ストリーミング結果 (token) --> UI
    Worker -- 完了通知 --> UI
```

### 4.2 Web Worker 設計 (`src/lib/worker.ts`)
*   **シングルトンパターン**: `TranslationPipeline` クラスを使用し、モデルのインスタンス化を一度だけに制限します。
*   **非同期メッセージング**: `postMessage` を介してメインスレッドと通信します。
    *   `load`: モデルのダウンロードと初期化。進捗状況を細かく通知します。
    *   `translate`: 入力テキストを受け取り、`text-generation` パイプラインを実行。生成されたテキストをストリームバックします。
*   **多段階フォールバック**:
    1.  **Level 1**: WebGPU + TranslateGemma 4B (最高速・高品質)
    2.  **Level 2**: CPU (WASM) + TranslateGemma 4B (中速)
    3.  **Level 3**: WebGPU/CPU + NLLB-200 (超安定・軽量)
    ブラウザのバッファサイズ制限（Code 12292832）や VRAM 不足を自動検知し、最適なモードへ自動で切り替えます。
*   **WebGPU 推論**: v4 の新しい WebGPU ランタイムを利用し、`dtype: 'q4'` による 4ビット量子化でメモリ効率を最大化します。

### 4.3 ステート管理 (`src/lib/store.ts`)
Zustand を使用して、アプリケーションの状態を一元管理します。
*   `status`: 'idle' | 'loading' | 'ready' | 'translating' | 'done' | 'error'
*   `progress`: モデルのダウンロード進捗（0-100%）。
*   `input` / `output`: 入出力テキスト。
*   `sourceLang` / `targetLang`: 翻訳言語設定。

### 4.4 フック設計 (`src/hooks/useWorker.ts`)
Web Worker のライフサイクルを管理するカスタムフックです。
*   マウント時に Worker を初期化し、メッセージリスナーを設定。
*   Worker からの進捗、結果、エラーを受け取り、Zustand ストアを更新します。

## 5. UI デザイン

### デザインコンセプト
「未来的」かつ「プレミアム」な体験を目指し、以下の要素を採用しました。
*   **グラスモーフィズム**: 背景のぼかし効果 (`backdrop-filter`) と半透明のレイヤーを活用し、奥行きのあるインターフェースを構築。
*   **動的グラデーション**: 視覚的な豊かさを演出する背景グラデーション。
*   **マイクロインタラクション**: ボタンのホバー効果やローディング中のパルスアニメーション。
*   **黄金比 (Golden Ratio)**: レイアウト、タイポグラフィ、スペーシングに黄金比 (1:1.618) を適用し、自然で美しいバランスを実現。

### コンポーネント構成 (`src/components/translation/`)
*   `Header.tsx`: タイトルとキャッチコピー。
*   `StatusBanner.tsx`: モデルのダウンロード状況やエラーメッセージの表示。
*   `TranslationInput.tsx`: 言語選択とテキスト入力エリア。
*   `TranslationOutput.tsx`: 翻訳結果の表示エリア（ストリーミング対応）。

## 6. テスト戦略

### 6.1 ユニットテスト (Vitest)
*   **対象**: `src/lib/store.ts` (状態遷移ロジック), `src/lib/worker.ts` (Worker 通信ロジック)。
*   **手法**: `jsdom` 環境で実行。Transformers.js や WebGPU API (`navigator.gpu`) をモック化し、ロジックの正確性を検証。

### 6.2 E2E テスト (Playwright)
*   **対象**: アプリケーション全体の動作フロー。
*   **シナリオ**:
    1.  ページロード時のタイトル確認。
    2.  各コンポーネント（ヘッダー、入力欄、ボタン）の描画確認。
    3.  言語選択のデフォルト値確認。
*   **環境**: Chromium ブラウザを使用。

## 7. デプロイ設定

### Next.js 設定 (`next.config.ts`)
*   `output: 'export'`: 静的 HTML/JS/CSS を生成し、Cloudflare Pages などの静的ホスティングに対応。
*   `webpack` 設定: `sharp` や `onnxruntime-node` など、ブラウザ環境で不要なサーバーサイドモジュールを除外（resolve.alias）。

### ビルドプロセス
1.  `npm run build` を実行。
2.  Next.js が `next build` を実行し、`out/` ディレクトリに静的ファイルを生成。
3.  `out/` ディレクトリの内容を Cloudflare Pages にデプロイ。
