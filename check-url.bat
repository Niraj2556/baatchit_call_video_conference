@echo off
echo Current URL should be: http://localhost:8080
echo.
echo If you're using 127.0.0.1:8080, change it to localhost:8080
echo.
echo Starting servers with correct localhost binding...
echo.

cd /d "%~dp0"
call start-dev.bat