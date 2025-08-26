@echo off
chcp 65001 >nul
powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0start-dev.ps1" -Port 5173 -DevHost 127.0.0.1
pause
