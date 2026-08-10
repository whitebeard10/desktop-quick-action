@echo off
cd /d "%~dp0"

REM Fast launch: only build if dist files are missing
if not exist "dist-electron\main.cjs" goto FULL_BUILD
if not exist "dist\index.html" goto FULL_BUILD

echo [Desktop Action Hub] Starting (cached build)...
start /b "" npx electron .
goto END

:FULL_BUILD
echo [Desktop Action Hub] First-time build in progress...
call npx tsc -p tsconfig.electron.json
powershell -Command "Get-ChildItem dist-electron -Filter '*.js' | ForEach-Object { $dest = $_.FullName -replace '\.js$','.cjs'; if (-not (Test-Path $dest)) { Rename-Item $_.FullName $dest } }"
call npx vite build
start /b "" npx electron .

:END
