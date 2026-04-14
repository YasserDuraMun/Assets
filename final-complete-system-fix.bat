@echo off
cls
echo ?? FINAL CONTROLLERS FIX - ALL MISSING SCREENS
echo ==============================================

echo ?? PROBLEM IDENTIFIED:
echo   ? ?????? ????????? (Disposal) - 403 errors
echo   ? ??????? (Maintenance) - 403 errors  
echo   ? ???????? (Reports) - 403 errors
echo   ? ????? ?????????? (Users) - 403 errors
echo   ? ????? ??????? ?????????? (Permissions) - 403 errors

echo ?? ROOT CAUSE:
echo   • These Controllers still used hardcoded roles
echo   • Custom roles were rejected with 403 Forbidden
echo   • User had permissions but Controllers didn't check them

echo ? CONTROLLERS FIXED:
echo   • DisposalController ? RequirePermission("Disposal", "view")
echo   • MaintenanceController ? RequirePermission("Maintenance", "view")
echo   • ReportsController ? RequirePermission("Reports", "view")
echo   • Security/UsersController ? RequirePermission("Users", "view")
echo   • Security/PermissionsController ? RequirePermission("Permissions", "view")

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting Backend with ALL Controllers Fixed...
start "Backend - Complete Fix" cmd /k "echo ??? BACKEND - ALL CONTROLLERS PERMISSION-BASED && echo ===================================== && echo. && echo ? FULLY FIXED CONTROLLERS: && echo   • Dashboard: RequirePermission active && echo   • Assets: RequirePermission active && echo   • Categories: RequirePermission active && echo   • Departments: RequirePermission active && echo   • Warehouses: RequirePermission active && echo   • Transfers: RequirePermission active && echo   • Disposal: RequirePermission active && echo   • Maintenance: RequirePermission active && echo   • Reports: RequirePermission active && echo   • Users: RequirePermission active && echo   • Permissions: RequirePermission active && echo. && echo ?? ALL SCREENS SHOULD WORK NOW: && echo   • Custom roles will have full system access && echo   • Based on assigned permissions only && echo   • No more hardcoded role limitations && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 10

echo ?? Starting Frontend Complete System Test...
cd ClientApp

start "Frontend - Complete System" cmd /k "echo ?? FRONTEND - Complete System Test && echo ============================= && echo. && echo ?? FINAL COMPREHENSIVE TEST: && echo. && echo ?? Phase 1: Login with Custom Role User && echo   • User should have ALL permissions assigned && echo   • Login should work perfectly && echo. && echo ?? Phase 2: Test ALL Fixed Screens && echo   • Dashboard ? Should work ? && echo   • Assets ? Should work ? (confirmed working) && echo   • Categories ? Should work ? && echo   • Departments ? Should work ? && echo   • Warehouses ? Should work ? && echo   • Transfers ? Should work ? && echo   • ?????? ????????? (Disposal) ? Should work NOW ? && echo   • ??????? (Maintenance) ? Should work NOW ? && echo   • ???????? (Reports) ? Should work NOW ? && echo   • ????? ?????????? (Users) ? Should work NOW ? && echo   • ????? ??????? ?????????? (Permissions) ? Should work NOW ? && echo. && echo ?? Phase 3: Complete System Validation && echo   • ALL screens should show data && echo   • NO 403 errors in Network tab && echo   • Custom roles work perfectly && echo   • Permission system fully functional && echo. && npm run dev"

echo.
echo ?? COMPLETE SYSTEM FIX READY!
echo ============================
echo.

echo ?? SUCCESS CRITERIA - ALL SCREENS WORKING:
echo.
echo ? MAIN SCREENS:
echo   ? Dashboard: Full data display
echo   ? Assets: Asset list display
echo   ? Categories: Category management
echo   ? Departments: Department management  
echo   ? Warehouses: Warehouse management
echo   ? Transfers: Transfer history
echo.
echo ? SPECIALIZED SCREENS:
echo   ? ?????? ?????????: Disposal management
echo   ? ???????: Maintenance records
echo   ? ????????: Reports generation
echo.
echo ? SECURITY SCREENS:
echo   ? ????? ??????????: User management
echo   ? ????? ??????? ??????????: Role/Permission management
echo.
echo ? TECHNICAL VALIDATION:
echo   ? Network tab: All APIs return 200 OK
echo   ? No 403 Forbidden errors
echo   ? Custom roles work system-wide
echo   ? Permission-based access control active

pause

echo ?? COMPLETE SYSTEM TEST WORKFLOW:
echo ================================
echo.
echo ?? Step-by-Step Validation:
echo   1. Login with custom role user (full permissions)
echo   2. Navigate through EVERY screen systematically:
echo      a) Dashboard ? Check stats/charts
echo      b) Assets ? Check asset list  
echo      c) Categories ? Check category management
echo      d) Departments ? Check department list
echo      e) Warehouses ? Check warehouse list
echo      f) Transfers ? Check transfer history
echo      g) Disposal ? Check disposal management
echo      h) Maintenance ? Check maintenance records  
echo      i) Reports ? Check report generation
echo      j) User Management ? Check user list
echo      k) Role Management ? Check role management
echo   3. Verify each screen loads data successfully
echo   4. Check Network tab - should be all 200 OK responses

echo.
echo ?? EXPECTED FINAL RESULT:
echo =======================
echo.
echo ? COMPLETE PERMISSION-BASED SYSTEM:
echo   • Unlimited custom roles supported
echo   • Granular permission control  
echo   • No hardcoded role limitations
echo   • Enterprise-grade access control
echo   • Scalable role management
echo.
echo ? USER EXPERIENCE:
echo   • Seamless role creation and assignment
echo   • Immediate permission application
echo   • Intuitive permission management
echo   • Comprehensive screen access control

echo.
echo This should be the FINAL fix - test all screens now! ??
pause