#!/bin/bash

# Define the image and repository directories
IMAGE_DIR="/mnt/ssd/images"
REPO_DIR="$(pwd)"  # Use the current directory as the repo directory

# Pull the latest changes from the main branch
git pull origin main

# Copy new images to the GitHub repository's src/assets folder
cp $IMAGE_DIR/*.jpg $REPO_DIR/src/assets/

# Add, commit, and push new images to GitHub
git add src/assets/*.jpg
git commit -m "Add new images - $(date)"
git push https://HaukeTrumpf:${GITHUB_TOKEN}@github.com/HaukeTrumpf/birdwatch.git

# Deploy the changes using npm
npm run deploy
