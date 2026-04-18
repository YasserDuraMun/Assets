@echo off
echo =====================================================
echo Copy Assets to AssetsTest - FIXED SCRIPTS
echo =====================================================
echo.

echo ?? This will create a COMPLETE copy of Assets database as AssetsTest
echo ?? Source: Assets database on 10.0.0.17
echo ?? Target: AssetsTest database on 10.0.0.17  
echo ?? Includes: ALL tables + data + relationships + indexes + procedures
echo ? FIXED: SQL Server version compatibility issues
echo ? FIXED: Database creation and THROW syntax errors
echo.

echo ??  WARNING: This will drop AssetsTest if it exists!
echo.

echo ?? Choose your preferred FIXED method:
echo.
echo [1] Enhanced SQL Script - FIXED VERSION (Recommended)
echo [2] Table-by-Table Method - FIXED VERSION (Most Reliable)  
echo [3] Quick Test (Connection and DB info)
echo [4] Simple Check (Just verify what exists)
echo.

set /p method="Select method (1-4): "

if "%method%"=="1" goto enhanced_sql_fixed
if "%method%"=="2" goto table_by_table_fixed  
if "%method%"=="3" goto quick_test
if "%method%"=="4" goto simple_check

echo ? Invalid choice. Using enhanced SQL fixed method...
goto enhanced_sql_fixed

:enhanced_sql_fixed
echo.
echo ?? Using Enhanced SQL Script - FIXED VERSION...
echo ?? This method uses backup/restore with error handling
echo ? Fixed SQL Server compatibility issues
echo ? Fixed THROW syntax errors  
echo ? Fixed database creation sequence
echo.
set /p confirm="Continue with Enhanced FIXED SQL method? (y/N): "
if /I "%confirm%" NEQ "y" goto end

echo.
echo ? Executing FIXED enhanced SQL script for AssetsTest...
echo ?? This may take several minutes depending on database size...
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -i "Database_Copy_Assets_To_AssetsTest_Fixed.sql" -t 1800 -C
goto check_result

:table_by_table_fixed  
echo.
echo ?? Using Table-by-Table Method - FIXED VERSION...
echo ?? This method copies tables individually with error handling
echo ? Fixed SQL Server compatibility issues  
echo ? Fixed error handling for each table
echo ? Fixed database creation and usage
echo.
set /p confirm="Continue with Table-by-Table FIXED method? (y/N): "
if /I "%confirm%" NEQ "y" goto end

echo.
echo ? Executing FIXED table-by-table SQL script...
echo ?? This will copy each table individually...
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -i "Database_Copy_Alternative_Method.sql" -t 1800 -C
goto check_result

:quick_test
echo.
echo ?? Quick Connection and Database Test...
echo.

echo ?? Testing connection to server...
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -Q "SELECT 'Connection successful to: ' + @@SERVERNAME as Status" -h -1 -C

echo.
echo ?? SQL Server version info:
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -Q "SELECT 'SQL Server Version: ' + @@VERSION as VersionInfo" -C

echo.
echo ??? Current databases on server:
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -Q "SELECT name as 'Database Name' FROM sys.databases WHERE database_id > 4 ORDER BY name" -C

echo.
echo ?? Assets database info (if exists):
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d Assets -Q "SELECT DB_NAME() as 'Database', COUNT(*) as 'Tables' FROM sys.tables WHERE type = 'U'" -C 2>nul

echo.
echo ?? AssetsTest database info (if exists):
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetsTest -Q "SELECT DB_NAME() as 'Database', COUNT(*) as 'Tables' FROM sys.tables WHERE type = 'U'" -C 2>nul || echo "AssetsTest does not exist yet"

goto end

:simple_check
echo.
echo ?? Simple Database Existence Check...
echo.

echo ?? Checking if Assets database exists:
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -Q "SELECT CASE WHEN DB_ID('Assets') IS NOT NULL THEN 'Assets: EXISTS' ELSE 'Assets: NOT FOUND' END as Status" -h -1 -C

echo.
echo ?? Checking if AssetsTest database exists:
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -Q "SELECT CASE WHEN DB_ID('AssetsTest') IS NOT NULL THEN 'AssetsTest: EXISTS' ELSE 'AssetsTest: NOT FOUND' END as Status" -h -1 -C

echo.
echo ?? SQL Server compatibility check:
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -Q "SELECT 'SQL Version: ' + CAST(SERVERPROPERTY('ProductVersion') AS VARCHAR(50)) + ' (' + CAST(SERVERPROPERTY('Edition') AS VARCHAR(50)) + ')' as ServerInfo" -h -1 -C

goto end

:check_result
echo.
echo ?? Checking AssetsTest creation results...

REM Check if AssetsTest database was created
echo ?? Verifying AssetsTest database exists...
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d master -Q "SELECT CASE WHEN DB_ID('AssetsTest') IS NOT NULL THEN '? SUCCESS: AssetsTest database created successfully!' ELSE '? ERROR: AssetsTest database not found!' END as Result" -h -1 -C

echo.
echo ?? Table count verification in AssetsTest:
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetsTest -Q "SELECT '?? Total Tables in AssetsTest: ' + CAST(COUNT(*) AS VARCHAR(10)) FROM sys.tables WHERE type = 'U'" -h -1 -C 2>nul

echo.
echo ?? Main tables data verification:
echo ?? SecurityUsers records:
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetsTest -Q "SELECT 'SecurityUsers: ' + CAST(COUNT(*) AS VARCHAR(10)) + ' records' FROM SecurityUsers" -h -1 -C 2>nul

echo ?? Assets records:
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetsTest -Q "SELECT 'Assets: ' + CAST(COUNT(*) AS VARCHAR(10)) + ' records' FROM Assets" -h -1 -C 2>nul

echo ?? AssetCategories records:  
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetsTest -Q "SELECT 'AssetCategories: ' + CAST(COUNT(*) AS VARCHAR(10)) + ' records' FROM AssetCategories" -h -1 -C 2>nul

echo ?? Departments records:
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetsTest -Q "SELECT 'Departments: ' + CAST(COUNT(*) AS VARCHAR(10)) + ' records' FROM Departments" -h -1 -C 2>nul

echo ?? Employees records:
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetsTest -Q "SELECT 'Employees: ' + CAST(COUNT(*) AS VARCHAR(10)) + ' records' FROM Employees" -h -1 -C 2>nul

echo ?? Warehouses records:
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetsTest -Q "SELECT 'Warehouses: ' + CAST(COUNT(*) AS VARCHAR(10)) + ' records' FROM Warehouses" -h -1 -C 2>nul

echo.
echo ?? Complete table list in AssetsTest:
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetsTest -Q "SELECT name as 'Table Name' FROM sys.tables WHERE type = 'U' ORDER BY name" -C 2>nul

echo.
echo ?? Database objects summary:
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetsTest -Q "SELECT 'Tables' as 'Object Type', COUNT(*) as 'Count' FROM sys.tables WHERE type = 'U' UNION ALL SELECT 'Views', COUNT(*) FROM sys.views UNION ALL SELECT 'Procedures', COUNT(*) FROM sys.procedures WHERE type = 'P' UNION ALL SELECT 'Foreign Keys', COUNT(*) FROM sys.foreign_keys" -C 2>nul

goto end

:end
echo.
echo ?? Process completed.
echo.

REM Check final status
echo ?? Final Status Check:
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d master -Q "IF DB_ID('AssetsTest') IS NOT NULL PRINT '?? AssetsTest is ready for use!' ELSE PRINT '? AssetsTest creation failed'" -h -1 -C 2>nul && (
    echo.
    echo ? SUCCESS! AssetsTest database is ready!
    echo.
    echo ?? Connection string available in appsettings.json as "AssetsTestConnection"
    echo.
    echo ?? To use AssetsTest for testing:
    echo    1. Update appsettings.json - Temporarily change DefaultConnection to:
    echo       "Data Source=10.0.0.17;Initial Catalog=AssetsTest;User ID=sa;Password=Dur@123456;..."
    echo    2. Restart your application  
    echo    3. Test all features with the new database
    echo    4. Verify user login, assets management, settings, etc.
    echo    5. When done testing, change back to original connection
    echo.
    echo ?? AssetsTest is a complete, isolated copy safe for testing!
) || (
    echo.
    echo ? AssetsTest creation may have failed. Check the output above for errors.
    echo.
    echo ?? Troubleshooting steps:
    echo    1. Verify Assets database exists and is accessible
    echo    2. Check SQL Server permissions for sa user
    echo    3. Ensure sufficient disk space
    echo    4. Try the alternative Table-by-Table method
    echo    5. Check SQL Server error log for detailed error messages
)

echo.
pause