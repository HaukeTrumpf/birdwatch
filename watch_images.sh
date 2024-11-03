#!/bin/bash

# Directory to watch
WATCH_DIR="/mnt/ssd/images"
# Relative path to the upload and deploy script
UPLOAD_SCRIPT="./upload_images.sh"  # Relative path assumes both scripts are in the same folder

# Start an infinite loop to monitor the directory
inotifywait -m -e close_write --format '%f' "$WATCH_DIR" | while read NEWFILE
do
  # Check if the new file is an image
  if [[ "$NEWFILE" =~ \.(jpg|jpeg|png)$ ]]; then
    echo "New image detected: $NEWFILE. Uploading to GitHub..."
    
    # Run the upload script
    bash "$UPLOAD_SCRIPT"
  fi
done
