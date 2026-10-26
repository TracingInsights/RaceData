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
from kagglehub.clients import build_kaggle_client
from kagglesdk.datasets.types.dataset_api_service import (
    ApiGetDatasetRequest,
    ApiListDatasetFilesRequest,
)

import convert_vsc

# How many older versions to try when the latest one cannot be downloaded
MAX_FALLBACK_VERSIONS = 3


def get_dataset_versions(dataset_path: str) -> tuple[int, list[int]]:
    """Return the current version number and older Ready versions, newest first."""
    owner, slug = dataset_path.split("/")
    request = ApiGetDatasetRequest()
    request.owner_slug = owner
    request.dataset_slug = slug
    with build_kaggle_client() as client:
        dataset = client.datasets.dataset_api_client.get_dataset(request)

    current = dataset.current_version_number
    older = sorted(
        (
            v.version_number
            for v in dataset.versions or []
            if v.status == "Ready" and v.version_number != current
        ),
        reverse=True,
    )
    return current, older


def list_dataset_files(dataset_path: str, version: int) -> list[str]:
    """Return the names of all files in a dataset version."""
    owner, slug = dataset_path.split("/")
    names = []
    page_token = None
    with build_kaggle_client() as client:
        while True:
            request = ApiListDatasetFilesRequest()
            request.owner_slug = owner
            request.dataset_slug = slug
            request.dataset_version_number = version
            if page_token:
                request.page_token = page_token
            response = client.datasets.dataset_api_client.list_dataset_files(request)
            names.extend(f.name for f in response.dataset_files or [])
            page_token = response.next_page_token
            if not page_token:
                return names


def download_files_individually(dataset_path: str, version: int) -> str:
    """
    Download every file of a dataset version one by one.

    Kaggle builds the whole-version zip asynchronously, so a freshly published
    version can 404 ("No gcs url found") while its individual files are
    already downloadable.
    """
    names = list_dataset_files(dataset_path, version)
    if not names:
        raise RuntimeError(f"No files listed for {dataset_path} version {version}")

    version_dir = None
    for name in names:
        file_path = Path(
            kagglehub.dataset_download(f"{dataset_path}/versions/{version}", path=name)
        )
        version_dir = file_path.parents[len(Path(name).parts) - 1]
    return str(version_dir)


def download_with_fallback(dataset_path: str) -> str:
    """
    Download the latest dataset version.

    Falls back to downloading its files individually, then to older versions.
    """
    try:
        return kagglehub.dataset_download(dataset_path)
    except Exception as e:
        print(f"⚠️ Latest version of {dataset_path} unavailable as a zip: {e}")
        last_error = e

    current, older = get_dataset_versions(dataset_path)

    print(f"  Downloading {dataset_path} version {current} file by file")
    try:
        return download_files_individually(dataset_path, current)
    except Exception as e:
        print(f"  ⚠️ Version {current} files unavailable: {e}")
        last_error = e

    for version in older[:MAX_FALLBACK_VERSIONS]:
        print(f"  Trying {dataset_path} version {version}")
        try:
            return kagglehub.dataset_download(f"{dataset_path}/versions/{version}")
        except Exception as e:
            print(f"  ⚠️ Version {version} unavailable: {e}")
            last_error = e

    raise last_error


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
        download_path = download_with_fallback(dataset_path)
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

    # Convert virtual safety car estimates JSON to CSV
    vsc_json = data_dir / "virtual_safety_car_estimates.json"
    vsc_csv = data_dir / "virtual_safety_cars.csv"
    if vsc_json.exists():
        try:
            convert_vsc.convert_vsc_json_to_csv(vsc_json, vsc_csv)
            print(f"✓ Converted {vsc_json.name} -> {vsc_csv.name}")
        except Exception as e:
            print(f"✗ Error converting virtual safety car estimates: {e}")
    else:
        print(f"ℹ️ {vsc_json.name} not found, skipping VSC conversion")

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
