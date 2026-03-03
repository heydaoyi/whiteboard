@echo off
setlocal

echo ===================================
echo Whiteboard App Startup Script
echo ===================================

set /p FRONTEND_PORT="Enter Frontend Port (default 5173): "
if "%FRONTEND_PORT%"=="" set FRONTEND_PORT=5173

set /p BACKEND_PORT="Enter Backend Port (default 3001): "
if "%BACKEND_PORT%"=="" set BACKEND_PORT=3001

echo.
echo Starting Backend on port %BACKEND_PORT%...
cd server
set PORT=%BACKEND_PORT%
start "Whiteboard Backend" cmd /k "node index.js"

echo.
echo Starting Frontend on port %FRONTEND_PORT%...
cd ../client
set VITE_API_URL=http://localhost:%BACKEND_PORT%/api
start "Whiteboard Frontend" cmd /k "npm run dev -- --port %FRONTEND_PORT%"

cd ..

echo.
echo Both services are starting in new command windows!
echo Frontend will be accessible at: http://localhost:%FRONTEND_PORT%
echo Backend API is running at: http://localhost:%BACKEND_PORT%
echo.
pause
