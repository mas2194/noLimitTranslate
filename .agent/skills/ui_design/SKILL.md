---
description: スタイリング、アニメーション、コンポーネント構造を含む UI 開発ガイド。
---
# スキル: UI デザイン & 開発

## 概要
このスキルは、Next.js、Tailwind CSS v4、Framer Motion を使用したユーザーインターフェースの開発を対象としています。全体的な美学は、動的なグラデーションを伴う「グラスモーフィズム」です。

## デザインシステム

### 1. 黄金比 (Golden Ratio)
UI のプロポーションは黄金比 (φ ≈ 1.618) に基づいて決定します。
-   **レイアウト**: メインコンテンツとサイドバーなどの比率を 1:1.618 に近づける。
-   **タイポグラフィ**: フォントサイズのスケールに黄金比を使用（例: ベース 16px -> 26px -> 42px）。
-   **スペーシング**: 余白設定にはフィボナッチ数列的なスケール（1, 2, 3, 5, 8, 13...）を意識する。

### 2. 変数 (`src/app/globals.css`)
-   Tailwind v4 は `@theme` を使用してカスタム変数を定義します。
-   主要なカスタムプロパティ:
    -   `--color-glass-border`: 半透明のボーダー色。
    -   `--color-glass-bg`: 半透明の背景色。
    -   `--animate-pulse-slow`: ローディング状態用のカスタムアニメーション。

### 2. グラスモーフィズムの使用
ガラス効果を適用するには、`globals.css` で定義された `.glass` や `.glass-card` ユーティリティクラス、または標準の Tailwind ユーティリティを使用します:
```css
/* 例 */
@utility glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### 3. アニメーション (Framer Motion)
-   コンポーネントのマウント/アンマウント（ステータスバナーなど）には `<AnimatePresence>` を使用してください。
-   エントリーアニメーションには `motion.div` を使用してください（例: `initial={{ opacity: 0, y: -20 }}`）。
-   アニメーションは控えめにし、パフォーマンスを維持してください（レイアウトスラッシングを避ける）。

## コンポーネント構造
-   **Header**: `src/components/translation/Header.tsx`
-   **Status**: `src/components/translation/StatusBanner.tsx` (ローディング/エラー状態を処理)
-   **Input**: `src/components/translation/TranslationInput.tsx` (Zustand 経由の制御コンポーネント)
-   **Output**: `src/components/translation/TranslationOutput.tsx` (読み取り専用、ストリーミング更新)

## ベストプラクティス
-   **ステートアクセス**: 共有ステートには常に `useTranslationStore` を使用してください。再利用性が向上する場合を除き、コンポーネントがストアに直接アクセスできるなら props の受け渡しは避けてください。
-   **アイコン**: 一貫したアイコンのために `lucide-react` を使用してください。
