@echo off
setlocal
cd /d "%~dp0"
set "PATH=%~dp0.tools\node;%PATH%"

echo ==============================================================
echo 🌿 Launching ZarooratSetu: Unified Full-Stack Website & API
echo 📍 Pilot: REC Banda ^& nearby areas (HackFest 3.0)
echo ==============================================================
echo.
echo Starting Combined Server on http://localhost:5000 ...
echo - Serving React Frontend (SPA)
echo - Serving REST API Endpoints (/api/*)
echo - Mock Phone OTP: 123456
echo.
node server.js
pause
