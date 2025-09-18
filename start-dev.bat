@echo off
echo Starting Baat Chit Development Servers...
echo.

echo Stopping any existing servers...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /PID %%a /F 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do taskkill /PID %%a /F 2>nul
echo.

echo Installing Backend Dependencies...
cd /d "%~dp0backend"
call npm install
echo.

echo Installing Frontend Dependencies...
cd /d "%~dp0frontend"
call npm install
echo.

echo Starting Backend Server...
cd /d "%~dp0backend"
start "Backend Server" cmd /k "npm run dev"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
cd /d "%~dp0frontend"
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:8080
echo.
echo Press any key to exit...
pause > nul