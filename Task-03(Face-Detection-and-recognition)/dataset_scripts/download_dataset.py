"""
Dataset Download Script
========================
Downloads the LFW (Labeled Faces in the Wild) dataset from Kaggle
for testing face recognition capabilities.

Dataset: https://www.kaggle.com/datasets/jessicali9530/lfw-dataset
- 13,000+ images of 5,749 people
- Standard benchmark for face recognition

SETUP:
1. Install kaggle CLI:  pip install kaggle
2. Go to https://www.kaggle.com/settings/account → Create New Token
   This downloads kaggle.json
3. Place kaggle.json at:
   - Linux/Mac: ~/.kaggle/kaggle.json
   - Windows:   C:/Users/<user>/.kaggle/kaggle.json
4. Run: python download_dataset.py
"""

import subprocess
import sys
import os
import zipfile
from pathlib import Path


DATASET = "jessicali9530/lfw-dataset"
OUTPUT_DIR = Path(__file__).parent.parent / "dataset" / "lfw"


def check_kaggle():
    try:
        result = subprocess.run(["kaggle", "--version"], capture_output=True, text=True)
        print(f"✅ Kaggle CLI: {result.stdout.strip()}")
        return True
    except FileNotFoundError:
        print("❌ Kaggle CLI not found. Run: pip install kaggle")
        return False


def download_lfw():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"📥 Downloading LFW dataset to: {OUTPUT_DIR}")
    print("   This may take a few minutes (~200MB)…\n")

    result = subprocess.run(
        ["kaggle", "datasets", "download", "-d", DATASET,
         "--path", str(OUTPUT_DIR), "--unzip"],
        capture_output=False
    )

    if result.returncode == 0:
        print(f"\n✅ Dataset downloaded successfully to: {OUTPUT_DIR}")
        count = sum(1 for _ in OUTPUT_DIR.rglob("*.jpg"))
        print(f"   Found {count:,} images")
    else:
        print("\n❌ Download failed. Check your kaggle.json credentials.")
        sys.exit(1)


def show_structure():
    print("\n📁 Dataset structure:")
    for p in sorted(OUTPUT_DIR.iterdir())[:5]:
        sub = list(p.iterdir())[:3] if p.is_dir() else []
        print(f"  {p.name}/ ({len(list(p.iterdir()) if p.is_dir() else [])} items)")
        for s in sub:
            print(f"    └── {s.name}")


def generate_sample_register_script():
    """Generate a helper script to batch-register LFW faces"""
    script = '''"""
Batch register LFW faces into the Face Recognition database.
Run after downloading the dataset.
Usage: python batch_register.py --limit 50
"""
import os, sys, argparse, requests
from pathlib import Path

API = "http://localhost:8000"
LFW_DIR = Path(__file__).parent.parent / "dataset" / "lfw"

def register_person(name: str, img_path: Path):
    with open(img_path, "rb") as f:
        r = requests.post(f"{API}/register",
            files={"file": (img_path.name, f, "image/jpeg")},
            params={"name": name}
        )
    return r.json()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=20, help="Max people to register")
    args = parser.parse_args()

    images_dir = LFW_DIR / "lfw-deepfunneled" / "lfw-deepfunneled"
    if not images_dir.exists():
        images_dir = LFW_DIR
    
    registered = 0
    for person_dir in sorted(images_dir.iterdir()):
        if registered >= args.limit:
            break
        if not person_dir.is_dir():
            continue
        imgs = list(person_dir.glob("*.jpg"))
        if not imgs:
            continue
        name = person_dir.name.replace("_", " ")
        result = register_person(name, imgs[0])
        if result.get("success"):
            print(f"  ✅ Registered: {name}")
            registered += 1
        else:
            print(f"  ⚠️  Skipped {name}: {result.get('detail', 'error')}")
    
    print(f"\\nDone! Registered {registered} people.")

if __name__ == "__main__":
    main()
'''
    script_path = Path(__file__).parent / "batch_register.py"
    script_path.write_text(script)
    print(f"\n📝 batch_register.py created at: {script_path}")
    print("   Run it after starting the API: python dataset_scripts/batch_register.py --limit 50")


if __name__ == "__main__":
    print("=" * 55)
    print("  FaceAI — LFW Dataset Downloader")
    print("  Dataset: Labeled Faces in the Wild (Kaggle)")
    print("=" * 55)
    print()

    if not check_kaggle():
        print("\nInstall kaggle CLI first:")
        print("  pip install kaggle")
        print("\nThen create API token at: https://www.kaggle.com/settings")
        sys.exit(1)

    kaggle_json = Path.home() / ".kaggle" / "kaggle.json"
    if not kaggle_json.exists():
        print(f"\n❌ kaggle.json not found at: {kaggle_json}")
        print("  1. Go to https://www.kaggle.com/settings/account")
        print("  2. Click 'Create New Token'")
        print(f"  3. Move kaggle.json to: {kaggle_json}")
        sys.exit(1)

    download_lfw()
    show_structure()
    generate_sample_register_script()

    print("\n✅ All done!")
    print("\nNext steps:")
    print("  1. Start the API:   cd backend && uvicorn main:app --reload")
    print("  2. Register faces:  python dataset_scripts/batch_register.py --limit 50")
    print("  3. Start frontend:  cd frontend && npm start")
