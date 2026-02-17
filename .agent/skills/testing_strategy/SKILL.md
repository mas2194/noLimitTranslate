---
description: noLimitTranslate プロジェクトのテスト実行と作成に関するガイド。
---
# スキル: テスト戦略

## 概要
このスキルは、翻訳エンジンと UI の信頼性を確保するためのテスト手順をカバーしています。

## 1. ユニットテスト (Vitest)
-   **スコープ**: ロジック、ステート管理、Worker 通信。
-   **コマンド**: `npm run test` (Vitest を実行)。
-   **設定**: `vitest.config.ts` (JSDOM 環境を使用)。
-   **主要ファイル**:
    -   `src/lib/store.test.ts`: Zustand のステート更新を検証。
    -   `src/lib/worker.test.ts`: Worker のメッセージ処理を検証 (WebGPU と Transformers.js をモック化)。

### ユニットテストの作成
-   `worker.ts` をテストする際は、以下を**必ず**モック化してください:
    -   `navigator.gpu`: JSDOM ではデフォルトで undefined です。
    -   `@huggingface/transformers`: pipeline 関数と環境変数。
    -   `global.self`: Worker のグローバルスコープ (`postMessage`, `addEventListener`)。

## 2. E2E テスト (Playwright)
-   **スコープ**: 完全なブラウザインタラクション、UI レンダリング、重要なユーザーフロー。
-   **コマンド**: `npx playwright test` (ヘッドレス Chromium でテストを実行)。
-   **設定**: `playwright.config.ts` (自動的に `npm run dev` を起動)。
-   **主要ファイル**:
    -   `tests/translation.spec.ts`: メインページのロード、タイトルの正確性、UI 要素の表示を検証。

### E2E テストの作成
-   開発サーバーが実行されていることを確認してください（`webServer` 設定で処理されます）。
-   基本的な検証には `await expect(page).toHaveTitle(...)` を使用します。
-   アクセシブルなクエリには `await page.getByRole(...)` を使用します。
-   **注意**: CI/ヘッドレス環境での実際の WebGPU 推論は不安定またはサポートされていません。UI の正確性に焦点を当て、複雑なフローが必要な場合は必要に応じて Worker のレスポンスをモック化してください。

## 3. リントと型チェック
-   **リント**: `npm run lint` (ESLint)。
-   **型チェック**: `npx tsc --noEmit` (TypeScript コンパイラ)。
-   変更をコミットする前に必ずこれらを実行してください。
