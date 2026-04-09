@echo off
echo Creating Security Tables Migration...

dotnet ef migrations add "AddSecurityTables" --output-dir "Migrations"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ? Migration created successfully
    echo.
    echo To apply the migration, run:
    echo dotnet ef database update
    echo.
) else (
    echo.
    echo ? Error creating migration
    echo.
)

pause