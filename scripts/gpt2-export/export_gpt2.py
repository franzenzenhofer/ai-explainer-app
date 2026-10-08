"""Export real GPT-2 small numbers for the AI Explorer visuals.

Writes gpt2-small-embeddings.json and demo-activations.json next to this script.
Run from the venv: python export_gpt2.py
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
os.environ["HF_HOME"] = str(HERE / ".hf-cache")
os.environ["TOKENIZERS_PARALLELISM"] = "false"

import numpy as np  # noqa: E402
import torch  # noqa: E402
from huggingface_hub import snapshot_download  # noqa: E402
from sklearn.decomposition import PCA  # noqa: E402
from transformers import GPT2LMHeadModel, GPT2TokenizerFast  # noqa: E402
from wordfreq import zipf_frequency  # noqa: E402

MODEL_ID = "openai-community/gpt2"
EXPORT_DATE = "2026-10-08"
TOKEN_COUNT = 2980
MIN_ZIPF = 4.0
NEIGHBOURS = 8
TOP_NEXT = 20
ALLOW_PATTERNS = ["*.json", "merges.txt", "model.safetensors"]
SPACE_MARKER = "Ġ"
MAX_DATA_BYTES = 4_000_000
PINNED_WORDS: tuple[str, ...] = (" king", " dog", " Paris", " happy", " capital", " France", " hungry")
PROMPTS: tuple[str, ...] = (
    "The dog barked because it was hungry.",
    "The capital of France is",
    "Once upon a time there was a",
    "2 + 2 =",
)
VECTOR_FILE = "gpt2-small-embeddings.int8.bin"
INT8_MAX = 127
SELECTION_RULE = (
    f"Candidates are GPT-2 tokens whose raw form starts with the leading-space marker, whose "
    f"remainder is only ASCII letters and at least 2 letters long (whole words, no fragments, "
    f"punctuation, numbers or symbols) and whose lowercased remainder has an English Zipf "
    f"frequency >= {MIN_ZIPF} in wordfreq 3.1.1. The set is {TOKEN_COUNT} tokens: first these "
    f"pinned words that the app demos use ({', '.join(w.strip() for w in PINNED_WORDS)}), "
    f"then the most frequent remaining candidates (ties broken by lower token id)."
)
VOCAB_NOTE = (
    "These are GPT-2's own 50,257-token vocabulary (byte-level BPE) and token ids. They are "
    "NOT the o200k_base tokens the AI Explorer app tokenizes with; ids and splits differ."
)


def round4(value: float) -> float:
    return float(f"{value:.4g}")


def round_list(values: np.ndarray) -> list[float]:
    return [round4(float(v)) for v in values]


def candidate_frequency(raw: str) -> float | None:
    if not raw.startswith(SPACE_MARKER):
        return None
    word = raw[1:]
    if len(word) < 2 or not (word.isascii() and word.isalpha()):
        return None
    zipf = zipf_frequency(word.lower(), "en")
    return zipf if zipf >= MIN_ZIPF else None


def select_token_ids(tokenizer: GPT2TokenizerFast) -> list[int]:
    ranked: list[tuple[float, int]] = []
    for token_id in range(len(tokenizer)):
        zipf = candidate_frequency(tokenizer.convert_ids_to_tokens(token_id))
        if zipf is not None:
            ranked.append((-zipf, token_id))
    ranked.sort()
    candidates = {token_id for _, token_id in ranked}
    pinned = [tokenizer.convert_tokens_to_ids(SPACE_MARKER + w[1:]) for w in PINNED_WORDS]
    missing = [w for w, i in zip(PINNED_WORDS, pinned) if i not in candidates]
    if missing:
        raise RuntimeError(f"pinned words are not candidate tokens: {missing}")
    rest = [token_id for _, token_id in ranked if token_id not in set(pinned)]
    return pinned + rest[: TOKEN_COUNT - len(pinned)]


def stable_pca(rows: np.ndarray) -> tuple[np.ndarray, list[float]]:
    pca = PCA(n_components=2, svd_solver="full")
    coords = pca.fit_transform(rows)
    for axis in range(2):
        if pca.components_[axis][np.argmax(np.abs(pca.components_[axis]))] < 0:
            coords[:, axis] *= -1
    return coords, [round4(float(v)) for v in pca.explained_variance_ratio_]


def nearest_neighbours(rows: np.ndarray) -> list[list[tuple[int, float]]]:
    unit = rows / np.linalg.norm(rows, axis=1, keepdims=True)
    sims = unit @ unit.T
    np.fill_diagonal(sims, -np.inf)
    result: list[list[tuple[int, float]]] = []
    for row in sims:
        order = sorted(range(len(row)), key=lambda i: (-row[i], i))[:NEIGHBOURS]
        result.append([(i, round4(float(row[i]))) for i in order])
    return result


def metadata(revision: str) -> dict[str, Any]:
    return {
        "model": MODEL_ID,
        "revision": revision,
        "exportDate": EXPORT_DATE,
        "architecture": {"layers": 12, "heads": 12, "dimensions": 768, "vocabulary": 50257},
        "vocabularyNote": VOCAB_NOTE,
        "numberFormat": "floats rounded to 4 significant digits",
    }


def quantize(rows: np.ndarray) -> tuple[np.ndarray, list[float], float]:
    scales = [float(f"{np.abs(row).max() / INT8_MAX:.8g}") for row in rows]
    scale_col = np.array(scales, dtype=np.float64)[:, None]
    quantized = np.clip(np.rint(rows.astype(np.float64) / scale_col), -INT8_MAX, INT8_MAX).astype(np.int8)
    error = float(np.abs(quantized.astype(np.float64) * scale_col - rows.astype(np.float64)).max())
    return quantized, scales, error


def build_embeddings(
    model: GPT2LMHeadModel, tokenizer: GPT2TokenizerFast, revision: str
) -> tuple[dict[str, Any], bytes]:
    ids = select_token_ids(tokenizer)
    rows = model.transformer.wte.weight.detach().numpy().astype(np.float32)[ids]
    coords, variance = stable_pca(rows)
    neighbours = nearest_neighbours(rows)
    quantized, scales, max_error = quantize(rows)
    tokens = [
        {
            "id": token_id,
            "text": tokenizer.decode([token_id]),
            "x": round4(float(coords[i][0])),
            "y": round4(float(coords[i][1])),
            "neighbours": [
                {"id": ids[j], "text": tokenizer.decode([ids[j]]), "cosine": sim}
                for j, sim in neighbours[i]
            ],
            "vectorIndex": i,
            "scale": scales[i],
        }
        for i, token_id in enumerate(ids)
    ]
    payload = {
        **metadata(revision),
        "selectionRule": SELECTION_RULE,
        "tokenCount": len(tokens),
        "pca": {
            "components": 2,
            "fittedOn": "the full-precision float32 embedding rows of exactly these tokens",
            "explainedVarianceRatio": variance,
        },
        "neighboursComputedOn": "full-precision float32 rows (never the quantized ones), cosine similarity",
        "embeddingSource": "wte (token embedding matrix), 768 values per token, no position added",
        "vectors": {
            "file": VECTOR_FILE,
            "format": (
                "row-major signed int8, 768 values per row, rows in the order of tokens[]; "
                "no header; file size = tokenCount * 768 bytes. Row r is tokens[r].vectorIndex."
            ),
            "decode": "value = int8 * tokens[r].scale",
            "encode": "int8 = round(x / scale), scale = max(abs(row)) / 127 per row",
            "maxAbsReconstructionError": float(f"{max_error:.4g}"),
        },
        "tokens": tokens,
    }
    return payload, quantized.tobytes()


def run_prompt(
    model: GPT2LMHeadModel, tokenizer: GPT2TokenizerFast, prompt: str
) -> dict[str, Any]:
    captured: list[torch.Tensor] = []
    handles = [
        block.register_forward_hook(lambda _m, _i, out: captured.append(out[0] if isinstance(out, tuple) else out))
        for block in model.transformer.h
    ]
    encoded = tokenizer(prompt, return_tensors="pt")
    with torch.no_grad():
        output = model(**encoded, output_hidden_states=True)
    for handle in handles:
        handle.remove()
    last = encoded["input_ids"].shape[1] - 1
    stream = [output.hidden_states[0][0, last]] + [c[0, last] for c in captured]
    probs = torch.softmax(output.logits[0, last].double(), dim=-1)
    top = torch.topk(probs, TOP_NEXT)
    return {
        "prompt": prompt,
        "tokens": [
            {"position": p, "id": int(t), "text": tokenizer.decode([int(t)])}
            for p, t in enumerate(encoded["input_ids"][0])
        ],
        "lastPosition": last,
        "residualStream": [
            {
                "stage": "embedding" if i == 0 else f"block{i}",
                "vector": round_list(v.double().numpy()),
            }
            for i, v in enumerate(stream)
        ],
        "finalLayerNorm": round_list(output.hidden_states[-1][0, last].double().numpy()),
        "topNext": [
            {"id": int(i), "text": tokenizer.decode([int(i)]), "probability": round4(float(p))}
            for p, i in zip(top.values, top.indices)
        ],
    }


def build_activations(
    model: GPT2LMHeadModel, tokenizer: GPT2TokenizerFast, revision: str
) -> dict[str, Any]:
    return {
        **metadata(revision),
        "residualStreamNote": (
            "residualStream[0] = token embedding + position embedding (input to block 1); "
            "residualStream[k] = raw output of block k, before any layer norm. "
            "finalLayerNorm = the last position after GPT-2's final layer norm (ln_f), "
            "which is what the unembedding multiplies. Only the last position is exported."
        ),
        "prompts": [run_prompt(model, tokenizer, p) for p in PROMPTS],
    }


def write_json(path: Path, payload: dict[str, Any]) -> int:
    text = json.dumps(payload, separators=(",", ":"), ensure_ascii=False)
    path.write_text(text + "\n", encoding="utf-8")
    return path.stat().st_size


def main() -> None:
    torch.set_num_threads(1)
    torch.use_deterministic_algorithms(True)
    snapshot = Path(snapshot_download(MODEL_ID, allow_patterns=ALLOW_PATTERNS))
    revision = snapshot.name
    tokenizer = GPT2TokenizerFast.from_pretrained(snapshot)
    model = GPT2LMHeadModel.from_pretrained(snapshot).eval()
    embeddings, vector_bytes = build_embeddings(model, tokenizer, revision)
    (HERE / VECTOR_FILE).write_bytes(vector_bytes)
    first = write_json(HERE / "gpt2-small-embeddings.json", embeddings) + len(vector_bytes)
    second = write_json(HERE / "demo-activations.json", build_activations(model, tokenizer, revision))
    print(f"revision {revision}\nembeddings json+bin {first} bytes\nactivations {second} bytes")
    print(f"total {first + second} bytes")
    if first + second >= MAX_DATA_BYTES:
        raise SystemExit(f"all data files {first + second} bytes exceed {MAX_DATA_BYTES}")


if __name__ == "__main__":
    main()
