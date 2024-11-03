#!/bin/bash

# Directory to watch
WATCH_DIR="/mnt/ssd/images"
# Relative path to the upload and deploy script
UPLOAD_SCRIPT="./upload_images.sh"  # Relative path assumes both scripts are in the same folder

# Start an infinite loop to monitor the directory
inotifywait -m -e close_write --format '%f' "$WATCH_DIR" | while read NEWFILE
do
  # Remove file type restriction; now it detects any file
  echo "New file detected: $NEWFILE. Uploading to GitHub..."
    
  # Run the upload script
  bash "$UPLOAD_SCRIPT"
done
