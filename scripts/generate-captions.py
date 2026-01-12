#!/usr/bin/env python3
"""
Generate silly captions for all images using BLIP.

Usage:
    pip install transformers torch pillow pyyaml
    python scripts/generate-captions.py

This script:
1. Loads images from assets/img/headline/ and assets/img/gallery/
2. Uses BLIP (base, ~1GB) to generate descriptions
3. Makes them longer and sillier with hash humor
4. Outputs to _data/headline_captions.yml and _data/gallery_captions.yml
"""

import os
import sys
import random
import yaml
from pathlib import Path

# Check for required packages
try:
    from PIL import Image
    from transformers import BlipProcessor, BlipForConditionalGeneration
    import torch
except ImportError as e:
    print("Missing required packages. Install with:")
    print("  pip install transformers torch pillow pyyaml")
    sys.exit(1)

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
HEADLINE_DIR = PROJECT_ROOT / "assets" / "img" / "headline"
GALLERY_DIR = PROJECT_ROOT / "assets" / "img" / "gallery"
HEADLINE_OUTPUT = PROJECT_ROOT / "_data" / "headline_captions.yml"
GALLERY_OUTPUT = PROJECT_ROOT / "_data" / "gallery_captions.yml"

# Silly additions to make captions funnier
PREFIXES = [
    "Behold:",
    "Witness:",
    "Rare footage of",
    "Scientists baffled by",
    "Local news reports",
    "Breaking:",
    "Experts confirm this is",
    "Leaked image shows",
    "Classified photo of",
    "Historians debate",
    "Area hashers spotted",
    "This just in:",
    "EXCLUSIVE:",
    "Police are investigating",
    "Witnesses report",
    "Legend has it:",
    "Unconfirmed reports of",
    "Allegedly:",
    "Sources say this is",
    "Critics are calling this",
]

SUFFIXES = [
    "This is completely normal behavior.",
    "No hashers were harmed in the making of this photo.",
    "The beer was definitely earned.",
    "Moments before disaster.",
    "Moments after disaster.",
    "The hangover was legendary.",
    "Management takes no responsibility.",
    "This explains a lot, actually.",
    "And they wonder why we drink.",
    "Typical Tuesday, honestly.",
    "The circle was... eventful.",
    "On-on to questionable decisions!",
    "Character building in progress.",
    "Hydration station located.",
    "This is what peak performance looks like.",
    "They knew what they signed up for. (They didn't.)",
    "The hares were never seen again.",
    "Down-down pending.",
    "Hash name earned.",
    "Cardio (allegedly).",
    "Professional athletes at work.",
    "The RA has questions.",
    "Beer check confirmed.",
    "Chalk marks were involved.",
    "Someone lost a shoe.",
    "The ice was deserved.",
]

EXAGGERATIONS = [
    ("person", "extremely dedicated athlete"),
    ("people", "a herd of questionable decision-makers"),
    ("man", "brave soul"),
    ("woman", "absolute legend"),
    ("group", "chaotic assembly"),
    ("standing", "barely standing"),
    ("walking", "attempting forward motion"),
    ("running", "fleeing from responsibility"),
    ("sitting", "recovering from life choices"),
    ("holding", "desperately clutching"),
    ("beer", "essential hydration"),
    ("drink", "survival juice"),
    ("water", "beer's disappointing cousin"),
    ("shirt", "sweat-absorption device"),
    ("outside", "in the wild"),
    ("grass", "nature's carpet"),
    ("tree", "vertical wood thing"),
    ("road", "designated suffering path"),
    ("mud", "complimentary exfoliation"),
    ("dirt", "earth seasoning"),
    ("smiling", "grimacing through the pain"),
    ("happy", "delirious"),
    ("tired", "experiencing peak performance"),
    ("wet", "optimally hydrated externally"),
    ("crowd", "mob of enablers"),
    ("friend", "co-conspirator"),
    ("looking", "squinting suspiciously"),
    ("large", "impressively chaotic"),
    ("small", "concentrated chaos"),
    ("wearing", "barely containing"),
    ("red", "blood-pressure-indicating"),
    ("white", "suspiciously clean"),
    ("table", "horizontal beer holder"),
    ("bottle", "vessel of truth"),
    ("cup", "portable hydration unit"),
]

# Random parenthetical asides
ASIDES = [
    "(allegedly)",
    "(citation needed)",
    "(no regrets)",
    "(send help)",
    "(hydration pending)",
    "(beer required)",
    "(this is fine)",
    "(mistakes were made)",
    "(on-on)",
    "(the hares did this)",
    "(blame the RA)",
    "(worth it)",
    "(probably)",
    "(we think)",
    "(don't ask)",
]


def make_silly(caption: str) -> str:
    """Transform a boring caption into a silly one."""
    # Apply exaggerations
    result = caption.lower()
    for boring, funny in EXAGGERATIONS:
        result = result.replace(boring, funny)

    # Capitalize first letter
    result = result[0].upper() + result[1:] if result else result

    # 30% chance to insert a random aside
    if random.random() < 0.3:
        words = result.split()
        if len(words) > 3:
            insert_pos = random.randint(2, len(words) - 1)
            words.insert(insert_pos, random.choice(ASIDES))
            result = " ".join(words)

    # Add prefix and suffix
    prefix = random.choice(PREFIXES)
    suffix = random.choice(SUFFIXES)

    return f"{prefix} {result}. {suffix}"


def process_folder(folder_path, output_path, folder_name, processor, model, device):
    """Process all images in a folder and save captions."""
    if not folder_path.exists():
        print(f"⚠️  {folder_name} directory not found: {folder_path}")
        return {}

    # Get all images
    images = sorted(folder_path.glob("*.webp"))
    if not images:
        print(f"⚠️  No images found in {folder_path}")
        return {}

    print(f"\n📁 Processing {len(images)} {folder_name} images...")
    print("-" * 40)

    captions = {}

    for i, img_path in enumerate(images):
        print(f"[{i+1}/{len(images)}] {img_path.name}...")

        try:
            # Load and process image
            image = Image.open(img_path).convert("RGB")
            inputs = processor(image, return_tensors="pt").to(device)

            # Generate caption
            generated_ids = model.generate(**inputs, max_new_tokens=50)
            raw_caption = processor.decode(generated_ids[0], skip_special_tokens=True).strip()

            # Make it silly
            silly_caption = make_silly(raw_caption)

            # Store with relative path as key
            rel_path = f"/assets/img/{folder_name}/{img_path.name}"
            captions[rel_path] = silly_caption

            print(f"   Raw: {raw_caption}")
            print(f"   Silly: {silly_caption[:70]}...")

        except Exception as e:
            print(f"   ❌ Error: {e}")
            rel_path = f"/assets/img/{folder_name}/{img_path.name}"
            captions[rel_path] = "Behold: A photo that defies description. The camera was probably drunk too."

    # Save to YAML
    print(f"\n💾 Saving to {output_path}...")
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, 'w') as f:
        f.write(f"# Auto-generated silly captions for {folder_name} images\n")
        f.write("# Generated by scripts/generate-captions.py using BLIP\n\n")
        yaml.dump(captions, f, default_flow_style=False, allow_unicode=True, width=200)

    print(f"✅ Saved {len(captions)} captions")
    return captions


def main():
    print("🖼️  BLIP Caption Generator for Jakarta Hash")
    print("=" * 50)

    # Check if at least one directory exists
    if not HEADLINE_DIR.exists() and not GALLERY_DIR.exists():
        print("❌ No image directories found!")
        print("   Run 'ruby scripts/process-images.rb' first to process images.")
        sys.exit(1)

    # Load BLIP model (base version, ~1GB)
    print("\n🤖 Loading BLIP model (~1GB download)...")
    device = "mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu"
    print(f"   Using device: {device}")

    processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
    model = BlipForConditionalGeneration.from_pretrained(
        "Salesforce/blip-image-captioning-base",
        torch_dtype=torch.float16 if device != "cpu" else torch.float32,
    )
    model.to(device)
    print("✅ Model loaded!")

    # Process headline images
    headline_captions = process_folder(
        HEADLINE_DIR, HEADLINE_OUTPUT, "headline",
        processor, model, device
    )

    # Process gallery images
    gallery_captions = process_folder(
        GALLERY_DIR, GALLERY_OUTPUT, "gallery",
        processor, model, device
    )

    # Summary
    print("\n" + "=" * 50)
    print("🎉 Caption generation complete!")
    print(f"   Headline captions: {len(headline_captions)}")
    print(f"   Gallery captions: {len(gallery_captions)}")
    print("\nThe gallery will now show these silly captions.")
    print("Run 'bundle exec jekyll serve' to see them in action!")


if __name__ == "__main__":
    main()
