#!/usr/bin/env python3
"""
Upload Formula 1 datasets to HuggingFace Hub.

Creates a temporary directory with:
  - README.md     (YAML frontmatter defining one config per CSV table)
  - data/         (all CSV files)

… then uploads that directory as the dataset repository.
Loading scripts are deprecated; the YAML config approach is the
current recommended way to host multi-table CSV datasets on HF.
"""

import os
import shutil
import tempfile
from pathlib import Path

from huggingface_hub import HfApi, upload_folder

# ── table name → (filename, description) ──────────────────────────────
TABLES: list[tuple[str, str, str]] = [
    ("circuits", "circuits.csv", "Circuit information"),
    ("constructor_results", "constructor_results.csv", "Constructor race results"),
    ("constructor_standings", "constructor_standings.csv", "Constructor standings"),
    ("constructors", "constructors.csv", "Constructor information"),
    ("driver_standings", "driver_standings.csv", "Driver standings"),
    ("drivers", "drivers.csv", "Driver information"),
    ("fatal_accidents_drivers", "fatal_accidents_drivers.csv", "Fatal accidents - drivers"),
    ("fatal_accidents_marshalls", "fatal_accidents_marshalls.csv", "Fatal accidents - marshalls"),
    ("lap_times", "lap_times.csv", "Lap times"),
    ("pit_stops", "pit_stops.csv", "Pit stops"),
    ("qualifying", "qualifying.csv", "Qualifying results"),
    ("races", "races.csv", "Race information"),
    ("red_flags", "red_flags.csv", "Red flag incidents"),
    ("results", "results.csv", "Race results"),
    ("safety_cars", "safety_cars.csv", "Safety car deployments"),
    ("seasons", "seasons.csv", "Season information"),
    ("sprint_results", "sprint_results.csv", "Sprint race results"),
    ("status", "status.csv", "Status codes"),
    ("virtual_safety_cars", "virtual_safety_cars.csv", "Virtual safety car deployments"),
]

README_YAML_HEADER = """---
task_categories:
  - tabular-classification
  - tabular-regression
tags:
  - formula-1
  - motorsport
  - racing
pretty_name: RaceData
size_categories:
  - 100K<n<1M
configs:
"""


def build_readme() -> str:
    """Build the full README.md content with YAML frontmatter."""
    lines = [README_YAML_HEADER]
    for i, (config_name, filename, desc) in enumerate(TABLES):
        default = "true" if i == 0 else "false"
        lines.append(f"  - config_name: {config_name}")
        lines.append(f"    data_files: data/{filename}")
        lines.append(f"    default: {default}")
    lines.append("---")
    lines.append("")
    lines.append("# RaceData — Formula 1 Dataset")
    lines.append("")
    lines.append(
        "Multi-table Formula 1 dataset. Each table is exposed as a separate "
        "configuration so that every table keeps its own column schema."
    )
    lines.append("")
    lines.append("## Usage")
    lines.append("")
    lines.append("```python")
    lines.append("from datasets import load_dataset")
    lines.append("")
    lines.append("# Load the circuits table")
    lines.append('ds = load_dataset("tracinginsights/RaceData", "circuits")')
    lines.append("```")
    lines.append("")
    return "\n".join(lines) + "\n"


def build_upload_dir(project_root: Path, source_dir: Path) -> Path:
    """Assemble a temporary directory structured for the HF repo.

    Returns the path to the temporary root (caller must clean up).
    """
    tmp = Path(tempfile.mkdtemp(prefix="hf_upload_"))

    # Write README.md with YAML frontmatter to repo root
    readme_path = tmp / "README.md"
    readme_path.write_text(build_readme(), encoding="utf-8")
    print("  → Created README.md with config definitions")

    # Copy data files into tmp/data/
    tmp_data = tmp / "data"
    tmp_data.mkdir()
    for f in source_dir.iterdir():
        if f.is_file():
            shutil.copy2(f, tmp_data / f.name)
            print(f"  → Copied data/{f.name}")

    return tmp


def upload_to_huggingface(
    upload_dir: Path, repo_id: str, token: str | None = None
) -> bool:
    """Upload a directory tree to HuggingFace Hub.

    Args:
        upload_dir: Directory to upload (README.md + data/).
        repo_id: HuggingFace repository ID (e.g., 'username/dataset-name').
        token: HuggingFace API token (if None, uses HF_TOKEN env var).

    Returns:
        True if successful, False otherwise.
    """
    print(f"\n{'=' * 60}")
    print(f"Uploading to HuggingFace: {repo_id}")
    print(f"{'=' * 60}")

    if token is None:
        token = os.environ.get("HF_TOKEN")

    if not token:
        print("✗ No HuggingFace token provided. Skipping upload.")
        print("  Set HF_TOKEN environment variable or pass token parameter.")
        return False

    try:
        api = HfApi()

        # Check if dataset exists; create if not
        try:
            api.dataset_info(repo_id, token=token)
            print(f"✓ Dataset repository exists: {repo_id}")
        except Exception:
            print(f"  Creating new dataset repository: {repo_id}")
            api.create_repo(
                repo_id=repo_id, repo_type="dataset", token=token, exist_ok=True
            )
            print(f"✓ Created dataset repository")

        # Upload the prepared directory (README.md + data/*)
        print(f"  Uploading files from {upload_dir}...")
        upload_folder(
            folder_path=str(upload_dir),
            repo_id=repo_id,
            repo_type="dataset",
            token=token,
            commit_message=f"Update F1 datasets - {os.environ.get('COMMIT_DATE', 'manual update')}",
            delete_patterns="*.csv",
        )

        print(f"✓ Successfully uploaded to HuggingFace")
        print(f"  View at: https://huggingface.co/datasets/{repo_id}")
        return True

    except Exception as e:
        print(f"✗ Error uploading to HuggingFace: {e}")
        return False


def main():
    """Upload the dataset to HuggingFace."""
    print("Formula 1 Dataset Upload Script")
    print("=" * 60)

    repo_id = os.environ.get("HF_REPO_ID")
    if not repo_id:
        print("✗ HF_REPO_ID environment variable not set. Exiting.")
        return 1
    print(f"Target HuggingFace repo: {repo_id}")

    project_root = Path(__file__).parent
    data_dir = project_root / "data"

    if not data_dir.exists() or not any(data_dir.iterdir()):
        print(f"✗ Data directory '{data_dir}' not found or is empty. Exiting.")
        return 1
    print(f"Data directory: {data_dir}")

    # Build the upload directory (README.md + data/)
    upload_dir = build_upload_dir(project_root, data_dir)
    try:
        success = upload_to_huggingface(upload_dir, repo_id)
    finally:
        shutil.rmtree(upload_dir, ignore_errors=True)
        print(f"  Cleaned up temporary upload directory")

    if success:
        print(f"\n{'=' * 60}")
        print("✓ Upload completed successfully!")
        print(f"{'=' * 60}")
        return 0
    else:
        print(f"\n{'=' * 60}")
        print("✗ Upload failed.")
        print(f"{'=' * 60}")
        return 1


if __name__ == "__main__":
    exit(main())
