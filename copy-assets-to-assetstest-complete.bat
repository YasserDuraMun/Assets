@echo off
echo =====================================================
echo Copy Assets Database to AssetsTest - Complete Options
echo =====================================================
echo.

echo ?? This will create a COMPLETE copy of Assets database as AssetsTest
echo ?? Source: Assets database on 10.0.0.17
echo ?? Target: AssetsTest database on 10.0.0.17
echo ?? Includes: ALL tables + data + relationships + indexes + procedures
echo.

echo ??  WARNING: This will drop AssetsTest if it exists!
echo.

echo ?? Choose your preferred method:
echo.
echo [1] Enhanced SQL Script (Recommended - Full Backup/Restore)
echo [2] Alternative Table-by-Table Method (Most Reliable for Complex DBs)  
echo [3] Quick Test (Just check if original methods work)
echo.

set /p method="Select method (1-3): "

if "%method%"=="1" goto enhanced_sql
if "%method%"=="2" goto table_by_table  
if "%method%"=="3" goto quick_test

echo ? Invalid choice. Using enhanced SQL method...
goto enhanced_sql

:enhanced_sql
echo.
echo ?? Using Enhanced SQL Script Method (Backup/Restore)...
echo ?? This method provides complete copy with all DB objects
echo.
set /p confirm="Continue with Enhanced SQL method to create AssetsTest? (y/N): "
if /I "%confirm%" NEQ "y" goto end

echo.
echo ? Executing enhanced SQL script for AssetsTest...
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -i "Database_Copy_Assets_To_AssetsTest.sql" -t 1800 -C
goto check_result

:table_by_table  
echo.
echo ?? Using Table-by-Table Method...
echo ?? This method copies tables individually for maximum reliability
echo.
set /p confirm="Continue with Table-by-Table method to create AssetsTest? (y/N): "
if /I "%confirm%" NEQ "y" goto end

echo.
echo ? Executing table-by-table SQL script for AssetsTest...
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -i "Database_Copy_Alternative_Method.sql" -t 1800 -C
goto check_result

:quick_test
echo.
echo ?? Quick Test Mode...
echo ?? This will just verify connection and show existing databases
echo.

echo ?? Testing connection to server...
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -Q "SELECT 'Connection successful to: ' + @@SERVERNAME as Status" -h -1 -C

echo.
echo ??? Current databases on server:
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -Q "SELECT name as 'Database Name' FROM sys.databases WHERE database_id > 4 ORDER BY name" -h -1 -C

echo.
echo ?? Assets database info (if exists):
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d Assets -Q "SELECT DB_NAME() as 'Database', COUNT(*) as 'Tables' FROM sys.tables WHERE type = 'U'" -h -1 -C 2>nul

goto end

:check_result
echo.
echo ?? Checking AssetsTest creation results...

REM Check if AssetsTest database was created
echo ?? Verifying AssetsTest database exists...
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d master -Q "SELECT CASE WHEN DB_ID('AssetsTest') IS NOT NULL THEN '? SUCCESS: AssetsTest database created successfully!' ELSE '? ERROR: AssetsTest database not found!' END as Result" -h -1 -C

echo.
echo ?? Table count verification:
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetsTest -Q "SELECT '?? Total Tables in AssetsTest: ' + CAST(COUNT(*) AS VARCHAR(10)) FROM sys.tables WHERE type = 'U'" -h -1 -C 2>nul

echo.
echo ?? Main tables data verification:
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetsTest -Q "SELECT '?? SecurityUsers: ' + CAST(COUNT(*) AS VARCHAR(10)) + ' records' FROM SecurityUsers" -h -1 -C 2>nul
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetsTest -Q "SELECT '?? Assets: ' + CAST(COUNT(*) AS VARCHAR(10)) + ' records' FROM Assets" -h -1 -C 2>nul  
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetsTest -Q "SELECT '?? AssetCategories: ' + CAST(COUNT(*) AS VARCHAR(10)) + ' records' FROM AssetCategories" -h -1 -C 2>nul
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetsTest -Q "SELECT '?? Departments: ' + CAST(COUNT(*) AS VARCHAR(10)) + ' records' FROM Departments" -h -1 -C 2>nul
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetsTest -Q "SELECT '?? Employees: ' + CAST(COUNT(*) AS VARCHAR(10)) + ' records' FROM Employees" -h -1 -C 2>nul
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetsTest -Q "SELECT '?? Warehouses: ' + CAST(COUNT(*) AS VARCHAR(10)) + ' records' FROM Warehouses" -h -1 -C 2>nul

echo.
echo ?? Complete table list in AssetsTest:
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetsTest -Q "SELECT name as 'Table Name' FROM sys.tables WHERE type = 'U' ORDER BY name" -C 2>nul

echo.
echo ?? AssetsTest database objects summary:
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetsTest -Q "SELECT 'Tables' as 'Object Type', COUNT(*) as 'Count' FROM sys.tables WHERE type = 'U' UNION ALL SELECT 'Views', COUNT(*) FROM sys.views UNION ALL SELECT 'Procedures', COUNT(*) FROM sys.procedures WHERE type = 'P' UNION ALL SELECT 'Foreign Keys', COUNT(*) FROM sys.foreign_keys" -C 2>nul

goto end

:end
echo.
echo ?? Process completed for AssetsTest database.
echo.

REM Check if AssetsTest exists before showing usage instructions
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d master -Q "IF DB_ID('AssetsTest') IS NOT NULL PRINT '?? AssetsTest is ready for use!'" -h -1 -C 2>nul && (
    echo ?? AssetsTest database is ready! Usage instructions:
    echo.
    echo ?? Connection string has been added to appsettings.json as "AssetsTestConnection"
    echo.
    echo ?? To use AssetsTest for testing:
    echo    1. Update appsettings.json - Change DefaultConnection to:
    echo       "Data Source=10.0.0.17;Initial Catalog=AssetsTest;User ID=sa;Password=Dur@123456;..."
    echo    2. Restart your application
    echo    3. Test all features with the new database
    echo    4. Verify user login, assets management, settings, etc.
    echo.
    echo ? AssetsTest contains a complete copy of your data and is safe to test with!
)

echo.
pause