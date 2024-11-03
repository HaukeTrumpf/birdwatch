#!/bin/bash
FILE_NAME="testfile.txt"

# Add, commit, and push the file using the GITHUB_TOKEN variable
git add $FILE_NAME
git commit -m "Test-Push with $FILE_NAME on $(date)"
git push https://HaukeTrumpf:${GITHUB_TOKEN}@github.com/HaukeTrumpf/birdwatch.git

