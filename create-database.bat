@echo off
echo ===============================================
echo      ????? ????? ???????? ???????????
echo ===============================================
echo.

echo ??? ????? ????? ???????? ????????...
echo.

:: Create SQL script for database initialization
echo Creating database initialization script...

echo. > init-database.sql
echo -- Create Database if not exists >> init-database.sql
echo IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'Assets') >> init-database.sql
echo BEGIN >> init-database.sql
echo     CREATE DATABASE Assets; >> init-database.sql
echo END >> init-database.sql
echo GO >> init-database.sql
echo. >> init-database.sql
echo USE Assets; >> init-database.sql
echo GO >> init-database.sql
echo. >> init-database.sql
echo -- Create Users table >> init-database.sql
echo IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U') >> init-database.sql
echo BEGIN >> init-database.sql
echo     CREATE TABLE Users ( >> init-database.sql
echo         Id int IDENTITY(1,1) PRIMARY KEY, >> init-database.sql
echo         Username nvarchar(50) NOT NULL UNIQUE, >> init-database.sql
echo         PasswordHash nvarchar(255) NOT NULL, >> init-database.sql
echo         FullName nvarchar(100) NOT NULL, >> init-database.sql
echo         Role int NOT NULL DEFAULT 2, >> init-database.sql
echo         IsActive bit NOT NULL DEFAULT 1, >> init-database.sql
echo         CreatedAt datetime2 NOT NULL DEFAULT GETDATE(), >> init-database.sql
echo         UpdatedAt datetime2 NULL, >> init-database.sql
echo         LastLoginAt datetime2 NULL >> init-database.sql
echo     ); >> init-database.sql
echo END >> init-database.sql
echo GO >> init-database.sql
echo. >> init-database.sql
echo -- Insert default admin user >> init-database.sql
echo IF NOT EXISTS (SELECT 1 FROM Users WHERE Username = 'admin') >> init-database.sql
echo BEGIN >> init-database.sql
echo     INSERT INTO Users (Username, PasswordHash, FullName, Role, IsActive, CreatedAt) >> init-database.sql
echo     VALUES ('admin', '$2a$11$Qf5DbY1AHcv9LtOZBCb8aOH4UJA7FXLZ/2/ZgLAUvBx6jU4.BjsAi', N'?????? ?????', 0, 1, GETDATE()); >> init-database.sql
echo END >> init-database.sql
echo GO >> init-database.sql
echo. >> init-database.sql
echo -- Insert test user >> init-database.sql
echo IF NOT EXISTS (SELECT 1 FROM Users WHERE Username = 'user1') >> init-database.sql
echo BEGIN >> init-database.sql
echo     INSERT INTO Users (Username, PasswordHash, FullName, Role, IsActive, CreatedAt) >> init-database.sql
echo     VALUES ('user1', '$2a$11$Qf5DbY1AHcv9LtOZBCb8aOH4UJA7FXLZ/2/ZgLAUvBx6jU4.BjsAi', N'?????? ??????', 2, 1, GETDATE()); >> init-database.sql
echo END >> init-database.sql
echo GO >> init-database.sql
echo. >> init-database.sql
echo -- Verify tables and data >> init-database.sql
echo SELECT 'Users Table Created' as Status; >> init-database.sql
echo SELECT COUNT(*) as TotalUsers FROM Users; >> init-database.sql
echo SELECT Id, Username, FullName, Role, IsActive FROM Users; >> init-database.sql

echo.
echo ?? ????? Database Script...
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -i init-database.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ? ?? ????? ????? ???????? ?????!
    echo.
    echo ?? ?????????? ????????:
    echo    Username: admin    | Password: admin123 | Role: SuperAdmin
    echo    Username: user1    | Password: admin123 | Role: User
    echo.
    echo ?? ????????:
    echo    1. Swagger: http://10.0.0.17:8099/swagger/
    echo    2. POST /api/auth/login
    echo    3. Body: {"username": "admin", "password": "admin123"}
    echo.
) else (
    echo.
    echo ? ??? ?? ????? ????? ????????!
    echo.
    echo ?? ???? ??:
    echo    1. SQL Server ????
    echo    2. ??????? sa user
    echo    3. Database connection string
    echo.
)

echo.
echo ?? Roles ?????????:
echo    0 = SuperAdmin
echo    1 = Admin  
echo    2 = User
echo.
pause