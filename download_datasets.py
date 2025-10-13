#!/usr/bin/env python3
"""
Download Formula 1 datasets from Kaggle and create a consolidated zip file.

This script:
1. Downloads the latest versions of F1 datasets from Kaggle
2. Copies files to the data folder
3. Creates a zip archive of all data files
4. Designed to run in GitHub Actions with change detection
"""

import os
import shutil
import zipfile
from pathlib import Path

import kagglehub


def download_dataset(dataset_path: str, target_dir: Path) -> bool:
    """
    Download a Kaggle dataset and copy to target directory.

    Args:
        dataset_path: Kaggle dataset path (e.g., 'user/dataset-name')
        target_dir: Directory to copy files to

    Returns:
        True if successful, False otherwise
    """
    print(f"\n{'=' * 60}")
    print(f"Downloading dataset: {dataset_path}")
    print(f"{'=' * 60}")

    try:
        # Download using kagglehub (downloads to cache)
        download_path = kagglehub.dataset_download(dataset_path)
        print(f"✓ Downloaded to cache: {download_path}")

        # Copy files from cache to target directory
        source_path = Path(download_path)
        if not source_path.exists():
            print(f"✗ Error: Downloaded path does not exist: {source_path}")
            return False

        # Copy all files from the downloaded dataset
        files_copied = 0
        for file_path in source_path.rglob("*"):
            if file_path.is_file():
                # Preserve relative structure if needed, or flatten
                relative_path = file_path.relative_to(source_path)
                target_file = target_dir / relative_path

                # Create parent directories if needed
                target_file.parent.mkdir(parents=True, exist_ok=True)

                # Copy file
                shutil.copy2(file_path, target_file)
                print(f"  → Copied: {relative_path}")
                files_copied += 1

        print(f"✓ Copied {files_copied} file(s) from {dataset_path}")
        return True

    except Exception as e:
        print(f"✗ Error downloading {dataset_path}: {e}")
        return False


def create_zip_archive(source_dir: Path, zip_path: Path) -> bool:
    """
    Create a zip archive of all files in source directory.

    Args:
        source_dir: Directory containing files to zip
        zip_path: Output zip file path

    Returns:
        True if successful, False otherwise
    """
    print(f"\n{'=' * 60}")
    print(f"Creating zip archive: {zip_path.name}")
    print(f"{'=' * 60}")

    try:
        # Remove existing zip if present
        if zip_path.exists():
            zip_path.unlink()
            print(f"  Removed existing zip file")

        # Create new zip archive
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
            files_added = 0
            for file_path in sorted(source_dir.rglob("*")):
                if file_path.is_file():
                    # Store relative path in zip
                    arcname = file_path.relative_to(source_dir)
                    zipf.write(file_path, arcname)
                    print(f"  → Added: {arcname}")
                    files_added += 1

        zip_size_mb = zip_path.stat().st_size / (1024 * 1024)
        print(f"✓ Created zip with {files_added} file(s) ({zip_size_mb:.2f} MB)")
        return True

    except Exception as e:
        print(f"✗ Error creating zip archive: {e}")
        return False


def main():
    """Main execution function."""
    print("Formula 1 Dataset Download Script")
    print("=" * 60)

    # Define paths
    project_root = Path(__file__).parent
    data_dir = project_root / "data"
    zip_file = project_root / "data.zip"

    # Create data directory if it doesn't exist
    data_dir.mkdir(exist_ok=True)
    print(f"Data directory: {data_dir}")

    # Kaggle dataset paths
    datasets = ["jtrotman/formula-1-race-data", "jtrotman/formula-1-race-events"]

    # Download all datasets
    success_count = 0
    for dataset in datasets:
        if download_dataset(dataset, data_dir):
            success_count += 1

    # Report download results
    print(f"\n{'=' * 60}")
    print(f"Download Summary: {success_count}/{len(datasets)} datasets successful")
    print(f"{'=' * 60}")

    if success_count == 0:
        print("✗ No datasets downloaded successfully. Exiting.")
        return 1

    # Check if data directory has files
    data_files = list(data_dir.rglob("*"))
    data_files = [f for f in data_files if f.is_file()]

    if not data_files:
        print("✗ No files found in data directory. Exiting.")
        return 1

    print(f"\nFound {len(data_files)} file(s) in data directory")

    # Create zip archive
    if create_zip_archive(data_dir, zip_file):
        print(f"\n{'=' * 60}")
        print("✓ All operations completed successfully!")
        print(f"{'=' * 60}")
        return 0
    else:
        print("\n✗ Failed to create zip archive")
        return 1


if __name__ == "__main__":
    exit(main())
