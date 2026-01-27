@echo off
title MirraLocalServer
cls
echo ==========================================
echo   Mirra AI Local Server
echo   http://localhost:8080
echo ==========================================
echo.
echo Starting server...
start http://localhost:8080
python -m http.server 8080
pause
