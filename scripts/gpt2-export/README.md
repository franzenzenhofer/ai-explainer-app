# data-export: real GPT-2 small numbers for AI Explorer (ticket P4-3)

Offline export of real numbers from GPT-2 small (`openai-community/gpt2`, revision
`607a30d783dfa663caf39e06633721c8d4cfcd7e`, 124M parameters, 12 layers, 12 heads, 768 dimensions).
It feeds the "Each token becomes numbers" and "Stacking (layers)" chapters.

These are GPT-2's own 50,257-token vocabulary and ids. They are NOT the o200k_base tokens the app
tokenizes with. The visuals must say "GPT-2's tokens".

## Run

```
python3.13 -m venv .venv
.venv/bin/pip install torch transformers numpy scikit-learn wordfreq
.venv/bin/python export_gpt2.py
```

Writes `gpt2-small-embeddings.json`, `gpt2-small-embeddings.int8.bin` and `demo-activations.json` next to the script. Output is
byte-identical on repeated runs (fixed export date, single thread, deterministic PCA sign). The model
(about 550 MB) downloads into `.hf-cache/` (gitignored, as is `.venv/`). Fails if all three data files together reach 4 MB.

## gpt2-small-embeddings.json

- `model`, `revision`, `exportDate`, `architecture`, `vocabularyNote`, `numberFormat`: provenance.
- `selectionRule`: how the 2,980 tokens were chosen (whole common English words, with a few pinned
  demo words, then by frequency).
- `pca`: one fixed 2-component PCA fitted on the full-precision float32 rows of exactly these tokens;
  `explainedVarianceRatio` gives the share of variance per axis (low, as expected for 768 dimensions).
- `neighboursComputedOn`: neighbours come from the float32 rows, never the quantized ones.
- `vectors`: description of the binary file (below) and `maxAbsReconstructionError`, the largest
  absolute difference between any decoded value and the float32 original over all values.
- `tokens[]`: `id` (GPT-2 token id), `text` (decoded, usually with a leading space), `x`/`y` (PCA
  coordinates), `neighbours` (8 nearest other tokens in this set by cosine similarity, with `cosine`),
  `vectorIndex` (row in the bin file) and `scale` (float, per-row dequantization factor).

## gpt2-small-embeddings.int8.bin

Row-major signed int8, 768 values per row, no header, `tokenCount * 768` bytes (2,304,000). Row
`tokens[r].vectorIndex` holds the `wte` embedding of that token (no position added).
Encode: `int8 = round(x / scale)` with `scale = max(abs(row)) / 127` per row.
Decode: `x = int8 * scale`. Read it with `new Int8Array(buffer, row * 768, 768)`.

## demo-activations.json

`prompts[]`, one per sample prompt:
- `tokens`: GPT-2 tokens (`position`, `id`, `text`); `lastPosition` is the index of the last one.
- `residualStream`: 13 vectors of 768 values for the last position. `embedding` = token plus position
  embedding (the input to block 1); `block1` ... `block12` = raw output of each block (the residual
  stream, before any layer norm).
- `finalLayerNorm`: last position after GPT-2's final layer norm, the vector the unembedding uses.
- `topNext`: GPT-2's real top-20 next-token probabilities (softmax over all 50,257 logits).

## Using the output in the app

The AI Explorer app serves the three data files from `public/data/`. After a re-run, copy them there:

```
cp gpt2-small-embeddings.json gpt2-small-embeddings.int8.bin demo-activations.json ../../public/data/
```

`src/model/gpt2Table.test.ts` checks the files against the pinned model revision.
