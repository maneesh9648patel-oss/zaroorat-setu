@echo off
cd /d "%~dp0formsaathi"
echo ==============================================================
echo Launching FormSaathi Scholarship & Document Assistant...
echo ==============================================================
py run.py
if errorlevel 1 (
    python run.py
)
pause
