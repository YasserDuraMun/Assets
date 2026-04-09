@echo off
echo Testing Security System Setup...

echo.
echo 1. Building the project...
dotnet build --configuration Release

if %ERRORLEVEL% NEQ 0 (
    echo ? Build failed!
    pause
    exit /b 1
)

echo ? Build successful!

echo.
echo 2. Starting the application for 10 seconds to initialize security data...
echo (This will create tables and seed data automatically)

timeout /t 2 >nul

start /b dotnet run --launch-profile "http" --no-build
echo Application starting... Please wait...

timeout /t 8 >nul

echo.
echo 3. Stopping application...
taskkill /f /im dotnet.exe 2>nul

echo.
echo 4. Testing database connection...
sqlcmd -S "10.0.0.17" -U "sa" -P "Dur@123456" -d "Assets" -Q "SELECT 'Tables Status:' as Info, (SELECT COUNT(*) FROM sys.tables WHERE name IN ('SecurityUsers', 'Roles', 'Screens', 'UserRoles', 'Permissions')) as SecurityTables, (SELECT COUNT(*) FROM Roles) as TotalRoles, (SELECT COUNT(*) FROM SecurityUsers) as TotalUsers;" 2>nul

if %ERRORLEVEL% EQU 0 (
    echo ? Database connection successful!
) else (
    echo ? Database connection failed!
)

echo.
echo ================================================================
echo ?? SECURITY SYSTEM SETUP COMPLETE!
echo ================================================================
echo.
echo Default Login Credentials:
echo Email: admin@assets.ps
echo Password: Admin@123
echo.
echo API Endpoints to test:
echo POST http://localhost:5002/api/auth/login
echo GET  http://localhost:5002/api/security-test/public
echo GET  http://localhost:5002/api/security-test/authenticated
echo.
echo Swagger: http://localhost:5002/swagger
echo.
echo Next Steps:
echo 1. Run: dotnet run
echo 2. Open: http://localhost:5002/swagger
echo 3. Test login with the credentials above
echo 4. Test different security endpoints
echo.
echo ================================================================

pause