# noLimitTranslate

**Live Demo**: [https://nolimittranslate.pages.dev](https://nolimittranslate.pages.dev)

WebGPU と Transformers.js を活用した、完全クライアントサイド実行型の無制限翻訳アプリケーションです。

## 🌟 特徴

- **100% 無料**: 外部の翻訳API（DeepLやGoogle翻訳など）を使用しないため、APIキーや利用料金は一切不要です。無制限にテキストを翻訳できます。
- **(ほぼ) 完全ローカル**: 初回アクセス時にHugging Faceからモデルをダウンロードした後は、すべての翻訳処理がブラウザ（ユーザーのデバイス）内で完結します。データが外部サーバーに送信されることはなく、高いプライバシー保護を実現します。
- **高速なAI翻訳**: WebGPUを利用することで、クライアントサイドでありながら高速・高精度な推論が可能です。

## 🚀 サーバーの立ち上げ方

### 1. 前提条件
- Node.js (v18 以上推奨)
- npm

### 2. インストール
プロジェクトの依存関係をインストールします。

```bash
npm install
```

### 3. モデルのセットアップ
このアプリケーションは完全クライアントサイドで動作し、**初回実行時に必要なモデルファイルを Hugging Face から直接ブラウザにダウンロードしてキャッシュ**します。
Cloudflare Pages の 25MB 制限や、モデルの再配布に関するライセンス要件を気にせず、初期状態のままデプロイ可能です。

### 4. 開発サーバーの起動 (推奨)
開発モードでサーバーを立ち上げるには、以下のコマンドを実行します。

```bash
npm run dev
```
ブラウザで [http://localhost:3000](http://localhost:3000) を開くとアプリケーションにアクセスできます。
※ WebGPU 機能を利用するため、Chrome や Edge などの対応ブラウザを使用してください。

### 4. 本番ビルドとプレビュー
本番環境向けの静的ファイルを生成するには、以下のコマンドを実行します。

```bash
npm run build
```
これにより `out/` ディレクトリに静的ファイルが生成されます。

生成されたファイルをローカルでプレビューするには、`serve` などを利用してください。

```bash
npx serve out
```

## 🛠️ 技術スタック
- **Framework**: Next.js (App Router)
- **AI Engine**: @huggingface/transformers (WebGPU)
- **Styling**: Tailwind CSS v4
- **State**: Zustand
- **Deployment**: Cloudflare Pages

## 📂 ドキュメント
詳細な設計ドキュメントは [doc/design_doc_ja.md](doc/design_doc_ja.md) を参照してください。
