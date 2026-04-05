@echo off
echo Copying frontend dist folder to backend project...
echo.

:: Check if dist folder exists
if not exist "ClientApp\dist\*" (
    echo Error: ClientApp\dist folder not found!
    echo Please run 'npm run build' in ClientApp folder first.
    pause
    exit /b 1
)

:: Copy dist contents to project root (for development)
echo Copying dist files...
if not exist "wwwroot" mkdir "wwwroot"
xcopy "ClientApp\dist\*" "wwwroot\" /E /I /Y

echo.
echo ? Frontend files copied to wwwroot successfully!
echo.
echo You can now run the project from Visual Studio.
echo The frontend will be served from: http://localhost:60194/
echo The API will be available at: http://localhost:60194/api/
echo.
pause