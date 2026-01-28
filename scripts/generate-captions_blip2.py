#!/usr/bin/env python3
"""
Generate silly captions for all images using BLIP-2 + a "make it worse" rewrite pass.

Changes vs the old script:
1) Prompt steers toward humorous misinterpretation (not neutral captioning)
2) Two-step: BLIP-2 draft -> text-model rewrite ("make it worse")
3) Hard limit to <= 12 words (enforced post-generation)

Usage:
    pip install transformers torch pillow pyyaml sentencepiece

Optional (CUDA only, for faster/lighter BLIP-2 loading):
    pip install bitsandbytes accelerate

Run:
    python scripts/generate-captions.py

Outputs:
    _data/headline_captions.yml
    _data/gallery_captions.yml
"""

import os
import sys
import random
import re
import yaml
from pathlib import Path

# Check for required packages
try:
    from PIL import Image
    import torch
    from transformers import (
        AutoProcessor,
        Blip2ForConditionalGeneration,
        AutoTokenizer,
        AutoModelForSeq2SeqLM,
    )
except ImportError:
    print("Missing required packages. Install with:")
    print("  pip install transformers torch pillow pyyaml sentencepiece")
    sys.exit(1)

# Paths (kept compatible with your Jekyll structure)
PROJECT_ROOT = Path(__file__).parent.parent
HEADLINE_DIR = PROJECT_ROOT / "assets" / "img" / "headline"
GALLERY_DIR = PROJECT_ROOT / "assets" / "img" / "gallery"
HEADLINE_OUTPUT = PROJECT_ROOT / "_data" / "headline_captions.yml"
GALLERY_OUTPUT = PROJECT_ROOT / "_data" / "gallery_captions.yml"

# --- Humor knobs -------------------------------------------------------------

# Small library of Hash-ish punchlines / vibes (used as spice)
SPICE = [
    "HR says no.",
    "This seemed smart at the time.",
    "Hydration protocol engaged.",
    "On on, but emotionally off.",
    "Evidence has been collected.",
    "No further questions, Your Honor.",
    "Operational excellence (allegedly).",
    "Team-building incident.",
    "Moments before regret.",
    "Moments after regret.",
    "Somebody lost a shoe.",
    "Beer was involved.",
]

def clamp_words(s: str, max_words: int = 12) -> str:
    """Hard clamp to N words; keep punctuation attached to words."""
    words = re.findall(r"\S+", s.strip())
    if not words:
        return "Such photo. Much wow."
    if len(words) > max_words:
        words = words[:max_words]
    out = " ".join(words).strip()
    # avoid dangling quotes
    out = out.strip(' "\'')
    return out

def tidy(s: str) -> str:
    s = s.strip()
    s = re.sub(r"\s+", " ", s)
    # remove trailing periods if we end up with fragments
    s = s.strip()
    return s

# --- Models ------------------------------------------------------------------

def pick_device() -> str:
    # Prefer MPS on Apple Silicon, else CUDA, else CPU
    if torch.backends.mps.is_available():
        return "mps"
    if torch.cuda.is_available():
        return "cuda"
    return "cpu"

def load_blip2(device: str):
    """
    BLIP-2 model: default to a common, high-quality checkpoint.
    You can override with env var BLIP2_MODEL.
    """
    model_name = os.environ.get("BLIP2_MODEL", "Salesforce/blip2-opt-2.7b")

    print(f"\n🤖 Loading BLIP-2 model: {model_name}")
    print(f"   Device: {device}")

    processor = AutoProcessor.from_pretrained(model_name)

    # Try to load lighter on CUDA if bitsandbytes is available.
    # On MPS/CPU we fall back to normal load.
    kwargs = {}
    if device == "cuda":
        # Prefer 8-bit if available to reduce VRAM; otherwise fp16.
        try:
            import bitsandbytes  # noqa: F401
            kwargs.update(dict(load_in_8bit=True, device_map="auto"))
            print("   Using 8-bit loading (bitsandbytes).")
        except Exception:
            kwargs.update(dict(torch_dtype=torch.float16))
            print("   bitsandbytes not found; using fp16.")

    model = Blip2ForConditionalGeneration.from_pretrained(model_name, **kwargs)

    if device in ("mps", "cpu"):
        model = model.to(device)

    model.eval()
    return processor, model

def load_rewriter(device: str):
    """
    Small text-only model used for the "make it worse" pass.
    This is intentionally lightweight and fast.
    """
    rewrite_name = os.environ.get("REWRITE_MODEL", "google/flan-t5-base")
    print(f"\n✍️  Loading rewrite model: {rewrite_name}")

    tok = AutoTokenizer.from_pretrained(rewrite_name)
    mdl = AutoModelForSeq2SeqLM.from_pretrained(rewrite_name)
    mdl = mdl.to(device)
    mdl.eval()
    return tok, mdl

# --- Caption generation ------------------------------------------------------

def blip2_draft_caption(image: Image.Image, processor, model, device: str) -> str:
    """
    Step 1: BLIP-2 draft caption with a prompt that nudges toward fun misinterpretation.
    """
    prompt = (
        "Write a short, funny caption for a Hash House Harriers photo gallery. "
        "Be slightly sarcastic and confidently wrong if needed. "
        "Keep it casual."
    )

    inputs = processor(images=image, text=prompt, return_tensors="pt")
    inputs = {k: v.to(device) for k, v in inputs.items()}

    gen_kwargs = dict(
        max_new_tokens=32,
        do_sample=True,
        temperature=1.0,
        top_p=0.95,
        repetition_penalty=1.05,
    )

    with torch.no_grad():
        out = model.generate(**inputs, **gen_kwargs)

    text = processor.batch_decode(out, skip_special_tokens=True)[0]
    return tidy(text)

def rewrite_make_it_worse(draft: str, tok, mdl, device: str) -> str:
    """
    Step 2: Rewrite the draft into something more HHH-ish and funnier.
    """
    spice = random.choice(SPICE)

    prompt = (
        "Rewrite this into a silly Hash House Harriers photo caption. "
        "Make it a bit more ridiculous, slightly sarcastic, and self-aware. "
        "Do NOT be descriptive; prefer vibes over facts. "
        "Max 12 words. "
        f"Optional punchline to weave in: {spice}\n\n"
        f"Draft: {draft}\n"
        "Caption:"
    )

    enc = tok(prompt, return_tensors="pt", truncation=True).to(device)

    with torch.no_grad():
        out = mdl.generate(
            **enc,
            max_new_tokens=24,
            do_sample=True,
            temperature=1.05,
            top_p=0.92,
            repetition_penalty=1.05,
            num_beams=1,
        )

    text = tok.decode(out[0], skip_special_tokens=True)
    return tidy(text)

def generate_caption(image_path: Path, processor, model, tok, rewriter, device: str) -> str:
    try:
        img = Image.open(image_path).convert("RGB")
        draft = blip2_draft_caption(img, processor, model, device)
        worse = rewrite_make_it_worse(draft, tok, rewriter, device)
        final = clamp_words(worse, 12)
        # If rewrite yields empty / weird, fall back
        if len(final.strip()) < 2:
            final = clamp_words(draft, 12)
        return final
    except Exception as e:
        print(f"⚠️  Error processing {image_path.name}: {e}")
        return "Behold. Evidence of questionable decisions."

def process_directory(img_dir: Path, output_path: Path, folder_name: str,
                      processor, model, tok, rewriter, device: str):
    captions = {}

    if not img_dir.exists():
        print(f"⚠️  Directory not found: {img_dir}")
        return captions

    images = sorted([p for p in img_dir.iterdir() if p.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp")])
    if not images:
        print(f"⚠️  No images found in: {img_dir}")
        return captions

    print(f"\n📁 Processing {folder_name}: {len(images)} images")

    for i, img_path in enumerate(images, 1):
        rel_path = f"/assets/img/{folder_name}/{img_path.name}"
        caption = generate_caption(img_path, processor, model, tok, rewriter, device)
        captions[rel_path] = caption
        print(f"  [{i:>3}/{len(images)}] {img_path.name} -> {caption}")

    # Save to YAML
    print(f"\n💾 Saving to {output_path}...")
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(f"# Auto-generated silly captions for {folder_name} images\n")
        f.write("# Generated by scripts/generate-captions.py using BLIP-2 + rewrite pass\n\n")
        yaml.dump(captions, f, default_flow_style=False, allow_unicode=True, width=200)

    print(f"✅ Saved {len(captions)} captions")
    return captions

def main():
    print("🖼️  BLIP-2 Caption Generator for Jakarta Hash (Make-It-Worse Edition)")
    print("=" * 60)

    if not HEADLINE_DIR.exists() and not GALLERY_DIR.exists():
        print("❌ No image directories found!")
        print("   Run 'ruby scripts/process-images.rb' first to process images.")
        sys.exit(1)

    device = pick_device()
    print(f"🧠 Using device: {device}")

    processor, blip2 = load_blip2(device)
    tok, rewriter = load_rewriter(device)

    headline_captions = process_directory(
        HEADLINE_DIR, HEADLINE_OUTPUT, "headline",
        processor, blip2, tok, rewriter, device
    )
    gallery_captions = process_directory(
        GALLERY_DIR, GALLERY_OUTPUT, "gallery",
        processor, blip2, tok, rewriter, device
    )

    print("\n" + "=" * 60)
    print("🎉 Caption generation complete!")
    print(f"   Headline captions: {len(headline_captions)}")
    print(f"   Gallery captions: {len(gallery_captions)}")
    print("\nTip: You can override models via env vars:")
    print("  BLIP2_MODEL=Salesforce/blip2-opt-2.7b")
    print("  REWRITE_MODEL=google/flan-t5-base")
    print("\nOn on. 🍺")

if __name__ == "__main__":
    main()
