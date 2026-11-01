@echo off
echo Starting FormSaathi Application...
python run.py
if errorlevel 1 (
    py run.py
)
pause
