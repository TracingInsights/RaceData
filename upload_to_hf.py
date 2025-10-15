#!/usr/bin/env python3
"""
Upload Formula 1 datasets to HuggingFace Hub.
"""

import os
from pathlib import Path
from huggingface_hub import HfApi, upload_folder


def upload_to_huggingface(
    source_dir: Path, repo_id: str, token: str | None = None
) -> bool:
    """
    Upload datasets to HuggingFace Hub.

    Args:
        source_dir: Directory containing files to upload
        repo_id: HuggingFace repository ID (e.g., 'username/dataset-name')
        token: HuggingFace API token (if None, will use HF_TOKEN env var)

    Returns:
        True if successful, False otherwise
    """
    print(f"\n{'=' * 60}")
    print(f"Uploading to HuggingFace: {repo_id}")
    print(f"{'=' * 60}")

    # Check if token is provided
    if token is None:
        token = os.environ.get("HF_TOKEN")

    if not token:
        print("✗ No HuggingFace token provided. Skipping upload.")
        print("  Set HF_TOKEN environment variable or pass token parameter.")
        return False

    try:
        api = HfApi()

        # Check if dataset exists, create if not
        try:
            api.dataset_info(repo_id, token=token)
            print(f"✓ Dataset repository exists: {repo_id}")
        except Exception:
            print(f"  Creating new dataset repository: {repo_id}")
            api.create_repo(
                repo_id=repo_id, repo_type="dataset", token=token, exist_ok=True
            )
            print(f"✓ Created dataset repository")

        # Upload all files from the data directory
        print(f"  Uploading files from {source_dir}...")
        upload_folder(
            folder_path=str(source_dir),
            repo_id=repo_id,
            repo_type="dataset",
            token=token,
            commit_message=f"Update F1 datasets - {os.environ.get('COMMIT_DATE', 'manual update')}",
        )

        print(f"✓ Successfully uploaded to HuggingFace")
        print(f"  View at: https://huggingface.co/datasets/{repo_id}")
        return True

    except Exception as e:
        print(f"✗ Error uploading to HuggingFace: {e}")
        return False


def main():
    """Uploads the dataset to HuggingFace."""
    print("Formula 1 Dataset Upload Script")
    print("=" * 60)

    # Get repo ID from environment variable
    repo_id = os.environ.get("HF_REPO_ID")
    if not repo_id:
        print("✗ HF_REPO_ID environment variable not set. Exiting.")
        return 1
    print(f"Target HuggingFace repo: {repo_id}")

    # Define paths
    project_root = Path(__file__).parent
    data_dir = project_root / "data"

    if not data_dir.exists() or not any(data_dir.iterdir()):
        print(f"✗ Data directory '{data_dir}' not found or is empty. Exiting.")
        return 1

    print(f"Data directory: {data_dir}")

    # Call the upload function
    if upload_to_huggingface(data_dir, repo_id):
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
