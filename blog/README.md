# Static Blog Engine

A lightweight, static, single-page blog engine tailored for GitHub Pages.

## Directory Structure
- `content/`: Holds your post folders.
- `content/_example_post/`: A template folder. **Better not delete.**
- `index.html`: The blog engine logic.

## How to Create a New Post

1. **Duplicate** the `content/_example_post` folder.
2. **Rename** the folder to your desired slug (e.g., `my-new-feature`).
   - *Note: Do not start the folder name with an underscore `_`.*
3. **Edit Metadata**: Open `metadata.json` inside your new folder.
   ```json
   {
     "title": { "en-US": "My Title", "zh-CN": "我的标题" },
     "description": { "en-US": "Short summary", "zh-CN": "简介" },
     "date": "YYYY-MM-DD",
     "tags": ["update", "news"]
   }
   ```
4. **Write Content**:
   - Edit `post_en-US.md` (Required for better fallback).
   - Create `post_zh-TW.md`, etc., for translations.
   - Maybe drop a thumbnail images named thumb.webp/thumb.jpg/thumb.png/thumb.jpeg/thumb.gif/thumb.avif

## Publishing (Building the Index)

Since this is a static site without a database, we must generate a list of posts (an index) before deploying. You can also just manually edit `posts-index.json`.

### Linux/macOS (`scan.sh`)
Create this file in the root directory:
```bash
#!/bin/bash
CONTENT_DIR="./blog/content"
OUTPUT_FILE="./blog/posts-index.json"
echo "[" > "$OUTPUT_FILE"
FIRST=true
for dir in "$CONTENT_DIR"/*; do
    if [ -d "$dir" ]; then
        dirname=$(basename "$dir")
        if [[ "$dirname" != _* ]]; then
            if [ "$FIRST" = true ]; then FIRST=false; else echo "," >> "$OUTPUT_FILE"; fi
            echo -n "  \"$dirname\"" >> "$OUTPUT_FILE"
        fi
    fi
done
echo "" >> "$OUTPUT_FILE"; echo "]" >> "$OUTPUT_FILE"
```

### Windows (`scan.bat`)
Create this file in the root directory:
```batch
@echo off
setlocal EnableDelayedExpansion
set "CONTENT_DIR=blog\content"
set "OUTPUT_FILE=blog\posts-index.json"
echo [ > "%OUTPUT_FILE%"
set "isFirst=1"
for /d %%D in ("%CONTENT_DIR%\*") do (
    set "dirname=%%~nxD"
    set "firstChar=!dirname:~0,1!"
    if not "!firstChar!"=="_" (
        if "!isFirst!"=="0" ( echo , >> "%OUTPUT_FILE%" )
        <nul set /p="  \"!dirname!\"" >> "%OUTPUT_FILE%"
        set "isFirst=0"
    )
)
echo. >> "%OUTPUT_FILE%"
echo ] >> "%OUTPUT_FILE%"
endlocal
```
