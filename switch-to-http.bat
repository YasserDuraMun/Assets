@echo off
echo Switching to HTTP/Kestrel configuration...

:: Update .env file for Kestrel
cd ClientApp
echo # Local development with proxy (for Kestrel) > .env
echo VITE_API_BASE_URL=/api >> .env
echo. >> .env
echo # Direct connection (alternative) >> .env
echo # VITE_API_BASE_URL=http://localhost:5002/api >> .env
echo HTTP/Kestrel configuration: Using proxy to auto-detected port

cd ..

:: Update vite.config.ts for Kestrel
echo Updating Vite proxy target for Kestrel...
powershell -Command "(Get-Content 'ClientApp\vite.config.ts') -replace 'target: ''http://localhost:60194''', 'target: ''http://localhost:5002''' | Set-Content 'ClientApp\vite.config.ts'"

echo.
echo Done! You can now run the project using HTTP profile in Visual Studio.
echo Frontend will use proxy to connect to backend on port 5002.
echo.
pause