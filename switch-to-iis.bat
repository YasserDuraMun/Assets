@echo off
echo Switching to IIS Express configuration...

:: Update .env file for IIS Express with proxy
cd ClientApp
echo # Local development with proxy (for IIS Express) > .env
echo VITE_API_BASE_URL=/api >> .env
echo. >> .env
echo # Direct connection (alternative) >> .env
echo # VITE_API_BASE_URL=http://localhost:60194/api >> .env
echo IIS Express configuration: Using proxy to http://localhost:60194/api

cd ..
echo.
echo Done! You can now run the project using IIS Express profile in Visual Studio.
echo Frontend will use proxy to connect to backend.
echo.
pause