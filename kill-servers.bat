@echo off
echo Stopping any running servers...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Killing process on port 3000: %%a
    taskkill /PID %%a /F 2>nul
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do (
    echo Killing process on port 8080: %%a
    taskkill /PID %%a /F 2>nul
)

echo Done.
pause