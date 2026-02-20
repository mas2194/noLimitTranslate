# Release Notes / リリースノート

## [1.0.1] - Remote Model Fetching & Documentation Cleanup / リモートモデルフェッチとドキュメント整理

### ✨ Enhancements / 改善点
- **Direct Model Fetching / モデルの直接取得**:
  - Transitioned from local model hosting to direct remote fetching from Hugging Face, resolving the 25MB file size limit and eliminating the need for manual model placement.
  - ローカルモデル配置からHugging Faceからの直接取得へ移行し、Cloudflareのファイルサイズ制限問題を解決するとともに、手動でのモデル配置を不要にしました。

### 📚 Documentation / ドキュメント
- **Setup Instructions / セットアップ手順**:
  - Removed the `public/models` directory requirement and updated documentation to explain the automatic model caching mechanism.
  - ローカルでの自動キャッシュ機能への変更に伴い、`public/models`に関する配置要件の手順を削除・整理しました。

## [1.0.0] - Initial Release & Core Features / 初回リリースと主要機能

### ✨ New Features / 新機能
- **Client-Side Translation / クライアントサイドでの翻訳**:
  - Implemented a fully client-side translation engine using WebGPU and Transformers.js for privacy-focused, unlimited translations.
  - WebGPUとTransformers.jsを使用した完全クライアントサイド実行型の翻訳エンジンを実装し、プライバシーに配慮した無制限の翻訳を実現しました。
- **Long Text Support / 長文サポート**:
  - Added an intelligent text splitting mechanism to handle translations that exceed the model's normal context size, processing chunks sequentially and transparently combining the final results.
  - モデルのコンテキストサイズを超える長文翻訳に対応するため、テキストを自動分割し、順次処理してから最終的に統合する機能を実装しました。
- **Mobile-Optimized UI / モバイル最適化UI**:
  - Introduced a responsive and modern interface, including a mobile-optimized UI specifically for model downloading to prevent screen cutoff on smaller mobile displays.
  - レスポンシブでモダンなインターフェースを導入し、特にモデルダウンロード画面がスマートフォンの小さな画面で見切れないように最適化しました。
- **Instant Interaction / 即時インタラクション**:
  - Enhanced user experience with instant UI feedback, including an immediate "[Stopped]" status display upon cancellation and optimistic UI updates for real-time progress.
  - 翻訳のキャンセル時に即座に「[Stopped]」と表示されるようにするなど、リアルタイムな進行状況を描画し、直感的なUIフィードバックを強化しました。

### 🐛 Bug Fixes / バグ修正
- **Translation Mapping / 翻訳の言語マッピング**:
  - Fixed a critical translation mapping bug where any selected language combination incorrectly produced Japanese translations.
  - 任意の言語ペアを選択しても日本語に翻訳されてしまう重大なバグを修正しました。
- **Model Loading / モデル読み込みエラー**:
  - Resolved model loading 404/401 errors by ensuring the Service Worker properly intercepts and serves local model data files instead of querying external endpoints.
  - Service Workerがローカルのモデルデータファイルを正しくインターセプトして配信するように修正し、Hugging Faceからの404/401エラー（不正アクセス）を解決しました。
- **Worker Errors / 同期・コンパイルエラー**:
  - Fixed compilation errors and duplicate variable declaration issues in the translation Web Worker.
  - 翻訳用Web Worker内で発生していた変数の重複宣言やコンパイルエラーを修正しました。

### 📚 Documentation / ドキュメント
- **Setup Instructions / セットアップ手順**:
  - Added setup instructions and directory configuration details for proper local model placement (`public/models`).
  - ローカルモデルの正しい配置場所（`public/models`）に関するディレクトリ構造とセットアップ手順を追記しました。
- **Bilingual READMEs / 日英README**:
  - Provided English localized versions of all README documents (`README.en.md`).
  - すべてのREADMEドキュメントに英語版 (`README.en.md`) を追加しました。
