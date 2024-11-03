#!/bin/bash

# Set up variables
IMAGE_DIR="/mnt/ssd/images"
REPO_DIR="/home/pi/birdwatch"
   
# Move to the GitHub repository directory
cd $REPO_DIR

# Copy new images from the Pi's image directory to the GitHub repository's images folder
cp $IMAGE_DIR/*.jpg $REPO_DIR/src/assets

# Add and commit new images
git add images/*.jpg
git commit -m "Add new images - $(date)"
git push origin main

# Run npm deploy to publish changes to GitHub Pages
npm install # To make sure dependencies are up-to-date
npm run deploy
