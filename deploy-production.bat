@echo off
echo ===================================================
echo          Assets Management System 
echo              Production Deployment
echo ===================================================
echo.

set /p "confirm=Are you sure you want to build for PRODUCTION? (y/n): "
if /i not "%confirm%"=="y" (
    echo Deployment cancelled.
    pause
    exit /b 0
)

echo.
echo ?? Starting production build process...
echo.

:: Step 1: Clean previous builds
echo 1?? Cleaning previous builds...
if exist "publish" rmdir /s /q "publish"
if exist "ClientApp\dist" rmdir /s /q "ClientApp\dist"
if exist "wwwroot" rmdir /s /q "wwwroot"
dotnet clean --configuration Release --verbosity quiet

:: Step 2: Update frontend environment for production
echo 2?? Setting up production environment...
cd ClientApp
echo VITE_API_BASE_URL=/api > .env.production
echo Production environment configured.

:: Step 3: Install frontend dependencies
echo 3?? Installing frontend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ? Failed to install frontend dependencies!
    pause
    exit /b 1
)

:: Step 4: Build frontend for production
echo 4?? Building frontend for production...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ? Frontend build failed!
    pause
    exit /b 1
)

cd ..

:: Step 5: Copy frontend to wwwroot
echo 5?? Copying frontend to backend...
mkdir wwwroot
xcopy "ClientApp\dist\*" "wwwroot\" /E /I /Y /Q

:: Step 6: Build backend for production
echo 6?? Building backend for production...
dotnet publish -c Release -o "./publish" --self-contained false
if %ERRORLEVEL% NEQ 0 (
    echo ? Backend build failed!
    pause
    exit /b 1
)

:: Step 7: Copy additional files to publish folder
echo 7?? Copying additional files...
copy "appsettings.Production.json" "publish\" >nul
copy "web.config" "publish\" >nul

:: Step 8: Create deployment package info
echo 8?? Creating deployment info...
echo Deployment created on %date% at %time% > "publish\deployment-info.txt"
echo Frontend build: React SPA >> "publish\deployment-info.txt"
echo Backend build: .NET 9 ASP.NET Core >> "publish\deployment-info.txt"
echo Configuration: Production >> "publish\deployment-info.txt"

echo.
echo ? Production build completed successfully!
echo.
echo ?? Published files location: %cd%\publish\
echo.
echo ?? Next steps for IIS deployment:
echo    1. Copy the 'publish' folder to your IIS server
echo    2. Create a new IIS Application pointing to the publish folder
echo    3. Make sure .NET 9 Runtime is installed on the server
echo    4. Configure the application pool to use 'No Managed Code'
echo    5. Update database connection string in appsettings.Production.json
echo    6. Run database migrations on production server
echo.
echo ?? Server Requirements:
echo    - Windows Server with IIS
echo    - .NET 9 ASP.NET Core Runtime
echo    - SQL Server or SQL Server Express
echo    - IIS Application pool with 'No Managed Code'
echo.
pause