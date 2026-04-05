@echo off
echo ===================================================
echo        Database Migration for Production
echo ===================================================
echo.

echo This script will generate SQL scripts for production deployment.
echo.

:: Generate SQL script for database creation and migration
echo ?? Generating database migration script...
dotnet ef migrations script --output "./publish/database-migration.sql" --verbose

if %ERRORLEVEL% EQU 0 (
    echo ? Database migration script created: ./publish/database-migration.sql
    echo.
    echo ?? To apply on production server:
    echo    1. Copy database-migration.sql to your production server
    echo    2. Run the script against your production database
    echo    3. Update connection string in appsettings.Production.json
    echo.
) else (
    echo ? Failed to generate migration script
    echo Make sure Entity Framework tools are installed:
    echo    dotnet tool install --global dotnet-ef
    echo.
)

pause