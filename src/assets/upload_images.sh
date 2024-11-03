#!/bin/bash

# Define the image and repository directories
IMAGE_DIR="/mnt/ssd/images"
REPO_DIR="/home/pi/birdwatch"

# Navigate to the GitHub repository directory
cd $REPO_DIR

# Copy new images from the Pi's image directory to the GitHub repository's src/assets folder
cp $IMAGE_DIR/*.jpg $REPO_DIR/src/assets/

# Add, commit, and push new images to GitHub
git add src/assets/*.jpg
git commit -m "Add new images - $(date)"
git push origin main

# Deploy the changes using npm
npm install
npm run deploy
