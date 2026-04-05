@echo off
echo Building and deploying Frontend + Backend to IIS Express...
echo.

:: Build the React app
echo 1. Building React application...
cd ClientApp
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Error building React app!
    pause
    exit /b 1
)

:: Copy dist to backend folder (if not already there)
echo 2. Copying frontend build to backend...
if not exist "..\ClientApp\dist\*" (
    echo Error: dist folder not found!
    pause
    exit /b 1
)

cd ..

:: Build/Publish the backend
echo 3. Publishing backend...
dotnet publish -c Release -o "./publish"
if %ERRORLEVEL% NEQ 0 (
    echo Error publishing backend!
    pause
    exit /b 1
)

:: Copy frontend dist to publish folder
echo 4. Copying frontend to publish folder...
if not exist "publish\ClientApp" mkdir "publish\ClientApp"
xcopy "ClientApp\dist" "publish\ClientApp\dist" /E /I /Y

echo.
echo ? Build completed successfully!
echo.
echo Published files are in: ./publish/
echo You can now run the application from Visual Studio using IIS Express.
echo The frontend will be served from the same host as the backend.
echo.
echo URLs will be:
echo - Application: http://localhost:60194/
echo - API: http://localhost:60194/api/
echo - Swagger: http://localhost:60194/swagger/
echo.
pause