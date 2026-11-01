@echo off
setlocal EnableDelayedExpansion

echo ==============================================================
echo  FormSaathi.in — Windows Domain Setup Script
echo ==============================================================
echo This script maps http://formsaathi.in to your local server (127.0.0.1).
echo It requires Administrator permission to update C:\Windows\System32\drivers\etc\hosts.
echo.

:: Check for administrative rights
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Requesting Administrator privileges...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process cmd -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b
)

:: We are running as Administrator
set "HOSTS_FILE=%windir%\System32\drivers\etc\hosts"

findstr /i "formsaathi.in" "%HOSTS_FILE%" >nul
if %errorlevel% equ 0 (
    echo [OK] 'formsaathi.in' is ALREADY configured in your hosts file.
) else (
    echo Appending formsaathi.in to %HOSTS_FILE%...
    echo.>> "%HOSTS_FILE%"
    echo # FormSaathi Local Domain Mapping>> "%HOSTS_FILE%"
    echo 127.0.0.1       formsaathi.in>> "%HOSTS_FILE%"
    echo 127.0.0.1       www.formsaathi.in>> "%HOSTS_FILE%"
    echo [SUCCESS] Domain mappings added!
)

echo Flushing DNS resolver cache...
ipconfig /flushdns >nul

echo.
echo ==============================================================
echo  Setup Completed Successfully!
echo  You can now open: http://formsaathi.in
echo ==============================================================
echo.
pause
