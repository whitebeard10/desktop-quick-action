@echo off
cd /d "%~dp0"

REM Fast launch: only build if build outputs are missing
if not exist "out\main\main.js" goto FULL_BUILD
if not exist "out\renderer\index.html" goto FULL_BUILD

echo [Desktop Action Hub] Starting (cached build)...
start "" npx electron .
goto END

:FULL_BUILD
echo [Desktop Action Hub] Building Desktop Action Hub...
call npx electron-vite build
start "" npx electron .

:END
