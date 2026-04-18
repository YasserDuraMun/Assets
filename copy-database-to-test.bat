@echo off
echo =====================================================
echo Copy Assets Database to AssetTest - Enhanced Version  
echo =====================================================
echo.

echo ?? This will create a COMPLETE copy of Assets database as AssetTest
echo ?? Source: Assets database on 10.0.0.17
echo ?? Target: AssetTest database on 10.0.0.17
echo ?? Includes: ALL tables + data + relationships + indexes + procedures
echo.

echo ??  WARNING: This will drop AssetTest if it exists!
echo.

echo ?? Choose your preferred method:
echo.
echo [1] Enhanced SQL Script (Recommended - Most Complete)
echo [2] Alternative SQL Method (Table by Table Copy)  
echo [3] Advanced PowerShell (Uses SqlServer Module)
echo [4] Original Simple Method
echo.

set /p method="Select method (1-4): "

if "%method%"=="1" goto enhanced_sql
if "%method%"=="2" goto alternative_sql  
if "%method%"=="3" goto advanced_powershell
if "%method%"=="4" goto original_method

echo ? Invalid choice. Using enhanced SQL method...
goto enhanced_sql

:enhanced_sql
echo.
echo ?? Using Enhanced SQL Script Method...
echo ?? This method provides the most complete copy with all objects
echo.
set /p confirm="Continue with Enhanced SQL method? (y/N): "
if /I "%confirm%" NEQ "y" goto end

echo.
echo ? Executing enhanced SQL script...
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -i "Database_Copy_Assets_To_AssetTest.sql" -t 1800 -C
goto check_result

:alternative_sql  
echo.
echo ?? Using Alternative SQL Method (Table by Table)...
echo ?? This method copies tables one by one for maximum reliability
echo.
set /p confirm="Continue with Alternative SQL method? (y/N): "
if /I "%confirm%" NEQ "y" goto end

echo.
echo ? Executing alternative SQL script...
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -i "Database_Copy_Alternative_Method.sql" -t 1800 -C
goto check_result

:advanced_powershell
echo.
echo ?? Using Advanced PowerShell Method...
echo ?? This method uses SqlServer PowerShell module for precision
echo.
set /p confirm="Continue with PowerShell method? (y/N): "
if /I "%confirm%" NEQ "y" goto end

echo.
echo ? Executing advanced PowerShell script...
powershell -ExecutionPolicy Bypass -File "Copy_Database_Advanced_PowerShell.ps1"
goto end

:original_method
echo.
echo ?? Using Original Simple Method...
echo ?? This is the basic backup/restore method
echo.
set /p confirm="Continue with Original method? (y/N): "
if /I "%confirm%" NEQ "y" goto end

echo.
echo ? Executing original PowerShell script...
powershell -ExecutionPolicy Bypass -File "Copy_Database_To_Test.ps1"
goto end

:check_result
echo.
echo ?? Checking results...

REM Check if AssetTest database was created
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d master -Q "SELECT CASE WHEN DB_ID('AssetTest') IS NOT NULL THEN 'SUCCESS: AssetTest database created successfully!' ELSE 'ERROR: AssetTest database not found!' END as Result" -h -1 -C

echo.
echo ?? Quick verification - Table count in AssetTest:
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetTest -Q "SELECT 'Tables: ' + CAST(COUNT(*) AS VARCHAR(10)) FROM sys.tables WHERE type = 'U'" -h -1 -C

echo.
echo ?? Sample data check - Main tables record counts:
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetTest -Q "SELECT 'SecurityUsers: ' + CAST(COUNT(*) AS VARCHAR(10)) FROM SecurityUsers" -h -1 -C 2>nul
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetTest -Q "SELECT 'Assets: ' + CAST(COUNT(*) AS VARCHAR(10)) FROM Assets" -h -1 -C 2>nul  
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetTest -Q "SELECT 'Departments: ' + CAST(COUNT(*) AS VARCHAR(10)) FROM Departments" -h -1 -C 2>nul

goto end

:end
echo.
echo ?? Process completed. 
echo.
echo ?? If successful, update your appsettings.json:
echo    Change DefaultConnection to use AssetTest database
echo    Test your application with the new database
echo.
echo ?? TestConnection string:
echo Data Source=10.0.0.17;Initial Catalog=AssetTest;User ID=sa;Password=Dur@123456;Connect Timeout=30;Encrypt=True;Trust Server Certificate=True;Application Intent=ReadWrite;Multi Subnet Failover=False
echo.
pause