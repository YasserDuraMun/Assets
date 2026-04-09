@echo off
echo Updating Database with Security Tables...

dotnet ef database update

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ? Database updated successfully
    echo.
    echo Security tables have been created:
    echo - SecurityUsers (Users table)
    echo - Roles
    echo - UserRoles  
    echo - Screens
    echo - Permissions
    echo.
    echo Default admin user created:
    echo Email: admin@assets.ps
    echo Password: Admin@123
    echo.
) else (
    echo.
    echo ? Error updating database
    echo Make sure SQL Server is running and connection string is correct
    echo.
)

pause