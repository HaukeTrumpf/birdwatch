#!/bin/bash

# Define the image and repository directories
IMAGE_DIR="/mnt/ssd/images"
REPO_DIR="$(pwd)"  # Use the current directory as the repo directory

# Pull only changes in src/assets
git fetch origin main
git checkout main -- src/assets

# Copy all files from IMAGE_DIR to the GitHub repository's src/assets folder
cp $IMAGE_DIR/* $REPO_DIR/src/assets/

# Add, commit, and push all new files in src/assets to GitHub
git add src/assets/*
git commit -m "Add new files - $(date)"
git push https://HaukeTrumpf:${GITHUB_TOKEN}@github.com/HaukeTrumpf/birdwatch.git

# Deploy the changes using npm
npm run deploy
