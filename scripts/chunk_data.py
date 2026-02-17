import os
import json
import gzip
import shutil

def chunk_file(input_path, output_dir, chunk_size_mb=20):
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found")
        return

    os.makedirs(output_dir, exist_ok=True)
    file_size = os.path.getsize(input_path)
    chunk_size = chunk_size_mb * 1024 * 1024
    
    chunk_count = 0
    with open(input_path, 'rb') as f:
        while True:
            chunk_data = f.read(chunk_size)
            if not chunk_data:
                break
            
            chunk_filename = f"chunk_{chunk_count}.gz"
            chunk_path = os.path.join(output_dir, chunk_filename)
            
            with gzip.open(chunk_path, 'wb') as g:
                g.write(chunk_data)
            
            print(f"Created {chunk_path}")
            chunk_count += 1

    manifest = {
        "originalName": os.path.basename(input_path),
        "originalSize": file_size,
        "chunkCount": chunk_count,
        "chunkSizeMB": chunk_size_mb,
        "format": "gzip"
    }

    with open(os.path.join(output_dir, "manifest.json"), 'w') as m:
        json.dump(manifest, m, indent=2)
    
    print(f"Created manifest in {output_dir}")

if __name__ == "__main__":
    model_dir = "public/models/translategemma/onnx"
    
    # 1. Chunk model_q4.onnx_data
    chunk_file("tmp/model_q4.onnx_data", os.path.join(model_dir, "data_0"))
    
    # 2. Chunk model_q4.onnx_data_1
    chunk_file("tmp/model_q4.onnx_data_1", os.path.join(model_dir, "data_1"))
