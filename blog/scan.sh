#!/bin/bash
CONTENT_DIR="./content"
OUTPUT_FILE="./posts-index.json"
echo "[" > "$OUTPUT_FILE"
FIRST=true
for dir in "$CONTENT_DIR"/*; do
    if [ -d "$dir" ]; then
        dirname=$(basename "$dir")
        if [[ "$dirname" != _* ]]; then
            if [ "$FIRST" = true ]; then
                FIRST=false
            else
                echo "," >> "$OUTPUT_FILE"
            fi
            echo -n "  \"$dirname\"" >> "$OUTPUT_FILE"
        fi
    fi
done
echo "" >> "$OUTPUT_FILE"
echo "]" >> "$OUTPUT_FILE"
