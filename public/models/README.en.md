# Model Placement Location

Please place the model files to be distributed to the client in this directory.

## Recommended Structure

```text
public/models/
├── [model_name]/
│   ├── config.json
│   ├── tokenizer.json
│   ├── model.onnx (or .bin, etc.)
│   └── ...
```

## Notes
- Large model files (.onnx, .bin, etc.) are excluded from Git management via `.gitignore`.
- Within the repository, this directory contains only a `.gitkeep` to preserve the directory structure and this `README.md` (and `README.en.md`).
- To actually run the application, you must manually deploy the appropriate model files or use a download script.
