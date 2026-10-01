@echo off
title SBAgro - Run Frontend + Backend
color 0A

echo ==========================================
echo              SBcropmarket »عدزاثق
echo ==========================================
echo.

cd /d "%~dp0"

echo [1/2] Starting Django Backend...
if not exist "backend\.venv\Scripts\python.exe" (
    echo ERROR: backend\.venv\Scripts\python.exe not found.
    pause
    exit /b 1
)

start "SBAgro Backend" cmd /k "cd /d "%~dp0backend" && .venv\Scripts\activate && python manage.py runserver"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Next.js Frontend...
if not exist "frontend\package.json" (
    echo ERROR: frontend\package.json not found.
    pause
    exit /b 1
)

start "SBAgro Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ==========================================
echo SBAgro is starting...
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:3000
echo ==========================================
echo.
pause
