@echo off
cls
echo ?? APPLYING FOREIGN KEY MIGRATION - IMMEDIATE FIX
echo ===============================================

echo ?? PROBLEM ANALYSIS:
echo   ? Super Admin works: User ID 1 exists in Users table
echo   ? Custom roles fail: User ID 3 exists in SecurityUsers table only
echo   ? Foreign Key points to wrong table: Users instead of SecurityUsers

echo ?? SOLUTION: Apply migration to fix Foreign Key constraint

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo.
echo ?? Step 1: Check Current Migration Status
echo ?? Listing current migrations...
dotnet ef migrations list

echo.
echo ?? Step 2: Apply Foreign Key Fix Migration
echo ?? Applying migration: FixAssetMaintenanceForeignKeyToSecurityUsers
echo.

dotnet ef database update

echo.
echo ?? Step 3: Verify Migration Result
if %ERRORLEVEL% EQU 0 (
    echo ? MIGRATION APPLIED SUCCESSFULLY!
    echo ================================
    echo.
    echo ?? Foreign Key Constraint Updated:
    echo   • Old: FK_AssetMaintenances_Users_CreatedBy ?
    echo   • New: FK_AssetMaintenances_SecurityUsers_CreatedBy ?
    echo.
    echo ?? Expected Results:
    echo   • Super Admin: Continue working (User ID 1)
    echo   • Custom Roles: NOW WORKING (User ID 3, 5, 6, etc.)
    echo   • All users: Reference SecurityUsers table correctly
    echo.
) else (
    echo ? MIGRATION FAILED!
    echo ==================
    echo.
    echo ?? Possible Issues:
    echo   • Database connection problems
    echo   • Migration file errors
    echo   • Conflicting data in database
    echo.
    echo ?? Manual Fix Option:
    echo If migration fails, you can apply manually:
    echo.
    echo SQL Command:
    echo ALTER TABLE AssetMaintenances DROP CONSTRAINT FK_AssetMaintenances_Users_CreatedBy;
    echo ALTER TABLE AssetMaintenances ADD CONSTRAINT FK_AssetMaintenances_SecurityUsers_CreatedBy 
    echo FOREIGN KEY ^(CreatedBy^) REFERENCES SecurityUsers^(Id^);
)

echo.
echo ?? Step 4: Test Backend Startup
echo ?? Starting backend to verify Entity Framework configuration...

start "Backend - Post Migration" cmd /k "echo ??? BACKEND - Post Migration Test && echo =================== && echo. && echo ?? TESTING AFTER FOREIGN KEY FIX: && echo   • Entity Framework should recognize new FK constraint && echo   • AssetMaintenance.Creator ? User (SecurityUsers table) && echo   • No model validation errors && echo. && echo ?? WATCH FOR: && echo   • Successful startup without EF errors && echo   • No foreign key constraint warnings && echo   • Model configuration validation passes && echo. && echo ?? READY FOR MAINTENANCE TESTING: && echo   • Custom role users should now create maintenance && echo   • No more FK constraint violations && echo   • CreatedBy field references SecurityUsers.Id && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 15

echo.
echo ?? Step 5: Frontend Test Setup
cd ClientApp

start "Frontend - Migration Test" cmd /k "echo ?? FRONTEND - Post Migration Maintenance Test && echo ========================= && echo. && echo ?? COMPREHENSIVE MAINTENANCE TEST: && echo. && echo ?? Phase 1: Custom Role User Test ^(Critical^) && echo   1. Login as User ID 3 ^(salem - haya1.alzeer1992@gmail.com^) && echo   2. Navigate to assets page && echo   3. Select any asset && echo   4. Create maintenance request: && echo      • Type: Preventive Maintenance && echo      • Date: Today && echo      • Description: 'Foreign Key fix test' && echo   5. Submit form && echo. && echo ? Expected Result: SUCCESS ^(201 Created^) && echo   • No FK constraint violation && echo   • Maintenance record created && echo   • CreatedBy=3 saved successfully && echo. && echo ?? Phase 2: Super Admin Validation && echo   6. Test Super Admin maintenance creation && echo   7. Should continue working as before && echo. && echo ?? Phase 3: Database Verification && echo   8. Check AssetMaintenances table: && echo      • New records should have CreatedBy referencing SecurityUsers && echo      • Foreign key constraint points to correct table && echo. && npm run dev"

cd ..

echo.
echo ?? FOREIGN KEY MIGRATION APPLIED!
echo ================================
echo.

echo ?? MIGRATION SUCCESS INDICATORS:
echo.
echo ? Database Level:
echo   ? Migration applied without errors
echo   ? Foreign key constraint updated
echo   ? AssetMaintenances table references SecurityUsers
echo.
echo ? Backend Level:
echo   ? Backend starts without EF errors
echo   ? Model validation passes
echo   ? No foreign key warnings
echo.
echo ? Application Level:
echo   ? Custom role users can create maintenance
echo   ? No 500 Internal Server Error
echo   ? CreatedBy field saves correctly
echo.
echo ? If Still Not Working:
echo   ? Check backend logs for different errors
echo   ? Verify User ID extraction in JWT
echo   ? Confirm user exists in SecurityUsers table

pause

echo.
echo ?? CRITICAL NEXT STEP: TEST MAINTENANCE CREATION NOW!
echo ==================================================
echo.
echo ?? Test with User ID 3:
echo   • Email: haya1.alzeer1992@gmail.com
echo   • Should now create maintenance successfully
echo   • No more FK constraint violations
echo.
echo ?? Report Result:
echo   • SUCCESS: Migration fixed the issue ?
echo   • PARTIAL: Different error appeared ??
echo   • FAILED: Same FK error persists ?
echo.
echo Test now and report the exact result! ??