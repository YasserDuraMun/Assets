@echo off
echo =====================================================
echo Copy Assets Database to AssetsTest - Alternative Method
echo =====================================================
echo.

echo ?? This will create a COMPLETE copy of Assets database as AssetsTest
echo ?? Source: Assets database on 10.0.0.17
echo ?? Target: AssetsTest database on 10.0.0.17
echo ?? Method: Table-by-Table Copy (Most Reliable)
echo ?? Includes: ALL tables + data + relationships + indexes
echo.

echo ??  WARNING: This will drop AssetsTest if it exists!
echo.

set /p confirm="Continue with Table-by-Table copy to AssetsTest? (y/N): "

if /I "%confirm%" NEQ "y" (
    echo ? Operation cancelled.
    pause
    exit /b 0
)

echo.
echo ?? Starting table-by-table copy process...
echo ?? This method ensures EVERY table is copied individually
echo.

REM Execute the Alternative SQL script for AssetsTest
echo ? Executing alternative SQL script for AssetsTest...
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -i "Database_Copy_Alternative_Method.sql" -t 1800 -C

echo.
echo ?? Checking results...

REM Check if AssetsTest database was created
echo ?? Verifying AssetsTest database creation...
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d master -Q "SELECT CASE WHEN DB_ID('AssetsTest') IS NOT NULL THEN 'SUCCESS: AssetsTest database created successfully!' ELSE 'ERROR: AssetsTest database not found!' END as Result" -h -1 -C

echo.
echo ?? Quick verification - Table count in AssetsTest:
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetsTest -Q "SELECT 'Total Tables: ' + CAST(COUNT(*) AS VARCHAR(10)) FROM sys.tables WHERE type = 'U'" -h -1 -C 2>nul

echo.
echo ?? Sample data check - Main tables record counts:
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetsTest -Q "SELECT 'SecurityUsers: ' + CAST(COUNT(*) AS VARCHAR(10)) FROM SecurityUsers" -h -1 -C 2>nul
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetsTest -Q "SELECT 'Assets: ' + CAST(COUNT(*) AS VARCHAR(10)) FROM Assets" -h -1 -C 2>nul  
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetsTest -Q "SELECT 'AssetCategories: ' + CAST(COUNT(*) AS VARCHAR(10)) FROM AssetCategories" -h -1 -C 2>nul
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetsTest -Q "SELECT 'Departments: ' + CAST(COUNT(*) AS VARCHAR(10)) FROM Departments" -h -1 -C 2>nul
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetsTest -Q "SELECT 'Employees: ' + CAST(COUNT(*) AS VARCHAR(10)) FROM Employees" -h -1 -C 2>nul

echo.
echo ?? Detailed table list in AssetsTest:
sqlcmd -S 10.0.0.17 -U sa -P Dur@123456 -d AssetsTest -Q "SELECT name as 'Table Name' FROM sys.tables WHERE type = 'U' ORDER BY name" -h -1 -C 2>nul

echo.
echo ?? Process completed for AssetsTest database.
echo.
echo ?? If successful, you can now use AssetsTest for testing:
echo.
echo ?? AssetsTestConnection string (already added to appsettings.json):
echo Data Source=10.0.0.17;Initial Catalog=AssetsTest;User ID=sa;Password=Dur@123456;Connect Timeout=30;Encrypt=True;Trust Server Certificate=True;Application Intent=ReadWrite;Multi Subnet Failover=False
echo.
echo ?? To use AssetsTest database:
echo    1. Update appsettings.json: Change DefaultConnection to use AssetsTest
echo    2. Test your application with the new database
echo    3. Verify all features work correctly
echo.
pause