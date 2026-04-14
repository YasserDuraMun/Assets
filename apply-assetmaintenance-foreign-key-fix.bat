@echo off
cls
echo ?? APPLYING ASSETMAINTENANCE FOREIGN KEY FIX MIGRATION
echo ==================================================

echo ?? MIGRATION PURPOSE:
echo   ? Fix FK_AssetMaintenances_Users_CreatedBy (wrong table)
echo   ? Create FK_AssetMaintenances_SecurityUsers_CreatedBy (correct table)
echo   ?? Allow custom role users to create maintenance records

echo ?? MIGRATION DETAILS:
echo   • Drop incorrect foreign key pointing to Users table
echo   • Create correct foreign key pointing to SecurityUsers table
echo   • Maintain referential integrity with proper table reference
echo   • Enable maintenance creation for User ID 3 (custom role)

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ?? Checking current database state...
echo.

echo ?? Step 1: Verify Migration File Exists
if exist "Migrations\20260414100000_FixAssetMaintenanceForeignKeyToSecurityUsers.cs" (
    echo ? Migration file found: 20260414100000_FixAssetMaintenanceForeignKeyToSecurityUsers.cs
) else (
    echo ? Migration file not found! Please check file creation.
    pause
    exit /b 1
)

echo.
echo ?? Step 2: Apply Database Migration
echo ?? Running: dotnet ef database update
echo.

dotnet ef database update

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ? MIGRATION APPLIED SUCCESSFULLY!
    echo =================================
    echo.
    echo ?? Foreign Key Constraint Fixed:
    echo   • Old: FK_AssetMaintenances_Users_CreatedBy ?
    echo   • New: FK_AssetMaintenances_SecurityUsers_CreatedBy ?
    echo.
    echo ?? Expected Results:
    echo   • Custom role users can now create maintenance
    echo   • User ID 3 maintenance creation should work
    echo   • No more foreign key constraint violations
    echo.
    echo ?? Next Steps:
    echo   1. Start backend application
    echo   2. Test maintenance creation with custom role user
    echo   3. Verify User ID 3 can create maintenance successfully
    echo   4. Check that CreatedBy=3 saves properly in AssetMaintenances
) else (
    echo.
    echo ? MIGRATION FAILED!
    echo ==================
    echo.
    echo ?? Possible Issues:
    echo   • Database connection problems
    echo   • Conflicting data in AssetMaintenances table
    echo   • Migration file syntax errors
    echo   • Entity Framework version conflicts
    echo.
    echo ?? Troubleshooting Steps:
    echo   1. Check database connection string
    echo   2. Verify no existing maintenance records with invalid CreatedBy
    echo   3. Review migration file for syntax errors
    echo   4. Check Entity Framework tools installation
)

echo.
echo ?? Step 3: Verify Migration in Database
echo ?? Check if foreign key constraint was updated correctly...

echo.
pause

echo ?? FOREIGN KEY MIGRATION PROCESS COMPLETE!
echo ==========================================
echo.

echo ?? TESTING CHECKLIST:
echo.
echo ? Database Migration:
echo   ? Migration applied successfully
echo   ? Foreign key constraint updated
echo   ? No database errors or conflicts
echo.
echo ? Backend Testing:
echo   ? Start backend application without errors
echo   ? Entity Framework recognizes new FK relationship
echo   ? No model validation errors
echo.
echo ? Maintenance Creation Testing:
echo   ? Custom role user (ID: 3) can create maintenance
echo   ? No FK constraint violation errors
echo   ? CreatedBy=3 saves successfully to AssetMaintenances
echo   ? Foreign key references SecurityUsers.Id properly
echo.
echo ?? Ready for comprehensive maintenance system testing!

pause