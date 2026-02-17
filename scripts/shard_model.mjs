import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);

/**
 * Shard Model Script
 * Splits a large file into smaller gzipped chunks for Cloudflare Pages bypass.
 * Usage: node scripts/shard_model.mjs <input_file> <output_dir> <chunk_size_mb>
 */

async function shardFile(inputPath, outputDir, chunkSizeMB = 20) {
    let inputFile = inputPath;

    if (!fs.existsSync(inputFile)) {
        console.error(`Error: Path ${inputFile} not found.`);
        return;
    }

    const inputStats = fs.statSync(inputFile);
    if (inputStats.isDirectory()) {
        console.log(`Input is a directory. Searching for large model files...`);
        const files = fs.readdirSync(inputFile)
            .filter(f => f.endsWith('.onnx_data') || f.endsWith('.onnx'))
            .map(f => ({ name: f, path: path.join(inputFile, f), size: fs.statSync(path.join(inputFile, f)).size }))
            .sort((a, b) => b.size - a.size);

        if (files.length === 0) {
            console.error(`Error: No .onnx_data or .onnx files found in ${inputFile}.`);
            return;
        }

        // Pick the largest one as it's likely the weights
        inputFile = files[0].path;
        console.log(`Auto-selected largest file: ${files[0].name} (${(files[0].size / (1024 ** 3)).toFixed(2)} GB)`);
    }

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const stats = fs.statSync(inputFile);
    const chunkSizeBytes = chunkSizeMB * 1024 * 1024;
    const stream = fs.createReadStream(inputFile, { highWaterMark: chunkSizeBytes });

    let chunkIndex = 0;
    console.log(`Starting sharding for ${inputFile} (${(stats.size / (1024 ** 3)).toFixed(2)} GB)...`);

    for await (const chunk of stream) {
        const compressedChunk = await gzip(chunk);
        const chunkName = `chunk_${chunkIndex}.gz`;
        const outputPath = path.join(outputDir, chunkName);

        fs.writeFileSync(outputPath, compressedChunk);
        console.log(`Created ${chunkName} (${(compressedChunk.length / (1024 ** 2)).toFixed(2)} MB)`);
        chunkIndex++;
    }

    // Create manifest
    const manifest = {
        originalName: path.basename(inputFile),
        originalSize: stats.size,
        chunkCount: chunkIndex,
        chunkSizeMB: chunkSizeMB,
        format: 'gzip'
    };

    fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
    console.log('Sharding complete! Manifest created.');
}

// Example usage
const [, , input, output, size] = process.argv;
if (!input || !output) {
    console.log('Usage: node scripts/shard_model.mjs <input_file> <output_dir> [chunk_size_mb]');
} else {
    shardFile(input, output, size ? parseInt(size) : 20).catch(console.error);
}
