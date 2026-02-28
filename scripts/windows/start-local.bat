@echo off
setlocal enabledelayedexpansion

REM Resolve repository root from this script location
set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..\..") do set "REPO_ROOT=%%~fI"
cd /d "%REPO_ROOT%"

set "MONGO_URI=mongodb://127.0.0.1:27017"
set "MONGO_DB_NAME=hajjumrah_wayfinder"
set "JWT_SECRET=change-me-in-production"
set "JWT_EXPIRES_IN=8h"

echo ==================================================
echo   HajjUmrah Wayfinder - Local Launcher (Windows)
echo ==================================================

echo [1/6] Checking Node.js...
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js is not installed or not in PATH.
  echo Install Node.js LTS from: https://nodejs.org/
  pause
  exit /b 1
)

echo [2/6] Installing dependencies (if needed)...
call npm install
if errorlevel 1 (
  echo ERROR: npm install failed.
  pause
  exit /b 1
)

echo [3/6] Ensuring MongoDB is running on 127.0.0.1:27017...
set "MONGO_OK="
for /f %%A in ('powershell -NoProfile -Command "try { $c=New-Object System.Net.Sockets.TcpClient('127.0.0.1',27017); $c.Close(); 'OK' } catch { 'NO' }"') do set "MONGO_OK=%%A"

if /I not "%MONGO_OK%"=="OK" (
  echo MongoDB not reachable. Trying to start Windows service "MongoDB"...
  net start MongoDB >nul 2>nul
  timeout /t 2 /nobreak >nul
  set "MONGO_OK="
  for /f %%A in ('powershell -NoProfile -Command "try { $c=New-Object System.Net.Sockets.TcpClient('127.0.0.1',27017); $c.Close(); 'OK' } catch { 'NO' }"') do set "MONGO_OK=%%A"
)

if /I not "%MONGO_OK%"=="OK" (
  echo MongoDB service still unavailable. Trying Docker container ^(mongo-wayfinder^) ...
  where docker >nul 2>nul
  if not errorlevel 1 (
    docker start mongo-wayfinder >nul 2>nul
    if errorlevel 1 (
      docker run -d --name mongo-wayfinder -p 27017:27017 mongo:7 >nul 2>nul
    )
    timeout /t 3 /nobreak >nul
    set "MONGO_OK="
    for /f %%A in ('powershell -NoProfile -Command "try { $c=New-Object System.Net.Sockets.TcpClient('127.0.0.1',27017); $c.Close(); 'OK' } catch { 'NO' }"') do set "MONGO_OK=%%A"
  )
)

if /I not "%MONGO_OK%"=="OK" (
  echo ERROR: MongoDB is not running on 127.0.0.1:27017.
  echo Please do one of the following and rerun launch-local.bat:
  echo   1^)^ Install MongoDB Community and start service "MongoDB"
  echo   2^)^ Install Docker Desktop and run: docker run -d --name mongo-wayfinder -p 27017:27017 mongo:7
  pause
  exit /b 1
)

echo [4/6] Writing .env defaults if missing...
if not exist ".env" (
  > .env echo VITE_API_URL=http://localhost:4000/api
  >> .env echo MONGO_URI=%MONGO_URI%
  >> .env echo MONGO_DB_NAME=%MONGO_DB_NAME%
  >> .env echo JWT_SECRET=%JWT_SECRET%
  >> .env echo JWT_EXPIRES_IN=%JWT_EXPIRES_IN%
)

echo [5/6] Starting backend in a new window...
start "Wayfinder Backend" /D "%REPO_ROOT%" cmd /k "set MONGO_URI=%MONGO_URI% && set MONGO_DB_NAME=%MONGO_DB_NAME% && set JWT_SECRET=%JWT_SECRET% && set JWT_EXPIRES_IN=%JWT_EXPIRES_IN% && npm run server"

echo [6/6] Starting frontend in a new window...
start "Wayfinder Frontend" /D "%REPO_ROOT%" cmd /k "npm run dev"

echo.
echo Backend  : http://localhost:4000
echo Frontend : http://localhost:5173
echo.
echo NOTE: Close the two opened terminal windows to stop the app.
start "" "http://localhost:5173"

pause
endlocal
