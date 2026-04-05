@echo off
echo Quick setup for IIS Express hosting...
echo.

:: Step 1: Copy existing dist to wwwroot
if exist "ClientApp\dist\index.html" (
    echo ? Found existing dist folder
    echo Copying to wwwroot...
    call copy-dist-to-wwwroot.bat
) else (
    echo ? No dist folder found
    echo Building frontend first...
    cd ClientApp
    call npm run build
    if %ERRORLEVEL% NEQ 0 (
        echo Error building frontend!
        pause
        exit /b 1
    )
    cd ..
    echo Copying to wwwroot...
    call copy-dist-to-wwwroot.bat
)

echo.
echo ?? Setup complete!
echo.
echo Next steps:
echo 1. Open Visual Studio
echo 2. Select 'IIS Express' from the dropdown
echo 3. Run the project (F5 or Ctrl+F5)
echo.
echo Your app will be available at:
echo ?? Frontend: http://localhost:60194/
echo ?? API: http://localhost:60194/api/
echo ?? Swagger: http://localhost:60194/swagger/
echo.
echo Everything runs from the same host - No CORS issues! ??
echo.
pause