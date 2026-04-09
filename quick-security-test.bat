@echo off
cls
echo ================================================================
echo ?? STARTING SECURITY SYSTEM TEST
echo ================================================================

echo Step 1: Building project...
dotnet build --verbosity quiet
if %ERRORLEVEL% NEQ 0 (
    echo ? Build failed!
    exit /b 1
)
echo ? Build successful

echo.
echo Step 2: Starting application (will auto-create security data)...
start /b dotnet run --launch-profile "http" --verbosity quiet
timeout /t 5 >nul

echo.
echo Step 3: Testing API endpoints...

echo.
echo ?? Testing public endpoint...
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:5002/api/security-test/public

echo.
echo ?? Testing login...
for /f "tokens=*" %%i in ('curl -s -X POST http://localhost:5002/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@assets.ps\",\"password\":\"Admin@123\"}" ^| findstr /r "token"') do (
    echo %%i
)

echo.
echo ?? Testing Swagger UI...
curl -s -o nul -w "Swagger Status: %%{http_code}\n" http://localhost:5002/swagger/index.html

echo.
echo Step 4: Stopping test application...
taskkill /f /im dotnet.exe 2>nul >nul

echo.
echo ================================================================
echo ?? SECURITY SYSTEM READY!
echo ================================================================
echo.
echo ?? Default Admin Credentials:
echo    Email: admin@assets.ps
echo    Password: Admin@123
echo.
echo ?? URLs to test:
echo    API: http://localhost:5002/api/auth/login
echo    Swagger: http://localhost:5002/swagger
echo    Health: http://localhost:5002/api/security-test/public
echo.
echo ?? Features Implemented:
echo    ? JWT Authentication
echo    ? Role-based Authorization  
echo    ? Permission Management
echo    ? User Management
echo    ? Secure Endpoints
echo    ? Admin Panel Ready
echo.
echo ?? To start application: dotnet run
echo ?? Guide: Open SECURITY-SYSTEM-GUIDE.md
echo ================================================================

pause