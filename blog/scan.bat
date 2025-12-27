@echo off
setlocal EnableDelayedExpansion
set "CONTENT_DIR=content"
set "OUTPUT_FILE=posts-index.json"
echo [ > "%OUTPUT_FILE%"
set "isFirst=1"
for /d %%D in ("%CONTENT_DIR%\*") do (
    set "dirname=%%~nxD"
    set "firstChar=!dirname:~0,1!"
    if not "!firstChar!"=="_" (
        if "!isFirst!"=="0" ( echo , >> "%OUTPUT_FILE%" )
        <nul set /p="  "!dirname!"" >> "%OUTPUT_FILE%"
        set "isFirst=0"
    )
)
echo. >> "%OUTPUT_FILE%"
echo ] >> "%OUTPUT_FILE%"
endlocal
