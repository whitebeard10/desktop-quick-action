@echo off
cd /d "%~dp0"

echo [Desktop Action Hub] Starting Desktop Action Hub...
call node_modules\.bin\electron.cmd .
