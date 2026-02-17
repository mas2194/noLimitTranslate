---
description: WebGPU 翻訳エンジンの開発と保守に関するガイド。
---
# スキル: WebGPU 翻訳開発

## 概要
このスキルは、`@huggingface/transformers` と WebGPU を使用したクライアントサイド翻訳エンジンの開発を対象としています。

## 主要コンポーネント

### 1. Web Worker (`src/lib/worker.ts`)
-   **役割**: 重い `transformers.js` パイプラインを処理します。
-   **制約**:
    -   モデルの再ロードを避けるため、パイプラインには必ず `Singleton` パターンを使用してください。
    -   初期化前に必ず `navigator.gpu` の存在をチェックしてください。
    -   `device: 'webgpu'` および `dtype: 'q4'` を使用してください。

### 2. メッセージングプロトコル
メインスレッドと Worker 間の通信には、厳密に型定義されたスキーマを使用します。

**リクエスト (Worker へ):**
```typescript
interface WorkerMessage {
    type: 'load' | 'translate';
    data?: {
        text?: string;
        src_lang?: string; (例: "English")
        tgt_lang?: string; (例: "Japanese")
    };
}
```

**レスポンス (Worker から):**
```typescript
interface WorkerResponse {
    status: 'loading' | 'ready' | 'translating' | 'done' | 'error';
    data?: unknown;
    progress?: number; // 0-100 ダウンロード進捗
    output?: string;   // 部分的または完全なテキスト
}
```

## 一般的なタスク

### モデルの更新
モデルを切り替える場合（例: Gemma から NLLB へ）、`worker.ts` 内の `TranslationPipeline` クラスを更新します:
1.  `static model = 'new/model-id'` を変更します。
2.  必要に応じて `task` タイプを更新します（例: `'translation'` 対 `'text-generation'`）。
3.  モデルが異なるテンプレートを必要とする場合は、プロンプト構築ロジックを更新します。

### デバッグ
-   **ブラウザコンソール**: Worker のログは、開発ツールの設定によってはデフォルトのコンソールに表示されないことがあります。「すべてのターゲット」または特定の Worker コンテキストを確認してください。
-   **WebGPU サポート**: `navigator.gpu` が undefined の場合、アプリは現在エラーをスローします。Chrome/Edge でテストするか、他のブラウザでフラグを有効にしてください。

### テスト
-   ユニットロジックは `src/lib/worker.test.ts` でモックを使用してテストされます。
-   CI/Node 環境で実際の WebGPU 推論を実行しようとしないでください（失敗します）。常に `navigator.gpu` と `@huggingface/transformers` をモック化してください。
