# noLimitTranslate

**Live Demo**: [https://nolimittranslate.pages.dev](https://nolimittranslate.pages.dev)

An entirely client-side execution unlimited translation application leveraging WebGPU and Transformers.js.

## 🌟 Features

- **100% Free**: It does not use external translation APIs (like DeepL or Google Translate), requiring no API keys or subscription fees. You can translate text boundlessly.
- **(Almost) Fully Local**: After the initial download of the models from Hugging Face on the first visit, all translation processes are completed entirely within your browser (on your device). No translation data is ever sent to external servers, providing excellent privacy protection.
- **Fast AI-Powered Translation**: By leveraging WebGPU, it achieves high-speed and highly accurate inferences even natively on the client side.

## 🚀 How to Start the Server

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm

### 2. Installation
Install the project dependencies.

```bash
npm install
```

### 3. Model Setup
This application runs entirely on the client side and **automatically downloads and caches the necessary model files directly from Hugging Face into the browser upon first execution**.
You can deploy it as-is without worrying about Cloudflare Pages' 25MB limit or model redistribution license requirements.

### 4. Starting the Development Server (Recommended)
To start the server in development mode, run the following command:

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to access the application.
*Note: To use the WebGPU feature, please use a compatible browser such as Chrome or Edge.

### 5. Production Build and Preview
To generate static files for a production environment, run the following command:

```bash
npm run build
```
This will generate static files in the `out/` directory.

To preview the generated files locally, you can use packages like `serve`:

```bash
npx serve out
```

## 🛠️ Technology Stack
- **Framework**: Next.js (App Router)
- **AI Engine**: @huggingface/transformers (WebGPU)
- **Styling**: Tailwind CSS v4
- **State**: Zustand
- **Deployment**: Cloudflare Pages

## 📂 Documentation
For detailed design documentation, please refer to [doc/design_doc_ja.md](doc/design_doc_ja.md).
