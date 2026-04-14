@echo off
cls
echo ?? FINAL AUTHORIZATION CLEANUP - ACCESS DENIED FIX
echo ================================================

echo ?? USER REPORTED PROBLEMS:
echo   ? ????????? (Categories) - Access denied  
echo   ? ??????? (Departments) - Access denied
echo   ? ???????? (Employees) - Access denied
echo   ? ??????? (Warehouses) - Access denied
echo   ? ???????? (Reports) - No data showing

echo ?? CONTROLLERS FIXED THIS ROUND:
echo   ? EmployeesController - Complete fix (GET, POST, PUT methods)
echo   ? ReportsController - Additional methods fixed
echo   ? All remaining hardcoded roles should be eliminated

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting Backend with Final Authorization Fix...
start "Backend - Final Auth Fix" cmd /k "echo ??? BACKEND - Final Authorization Cleanup && echo =============================== && echo. && echo ? COMPLETELY FIXED CONTROLLERS: && echo   • DashboardController: RequirePermission active && echo   • AssetsController: RequirePermission active && echo   • CategoriesController: RequirePermission active && echo   • DepartmentsController: RequirePermission active && echo   • WarehousesController: RequirePermission active && echo   • TransfersController: RequirePermission active && echo   • DisposalController: RequirePermission active && echo   • MaintenanceController: RequirePermission active && echo   • EmployeesController: RequirePermission active ? NEW && echo   • ReportsController: RequirePermission active ? UPDATED && echo   • Security/UsersController: RequirePermission active && echo   • Security/PermissionsController: RequirePermission active && echo. && echo ?? ALL REPORTED SCREENS SHOULD WORK NOW: && echo   • No more hardcoded role restrictions && echo   • Custom roles should have full access && echo   • Permission-based authorization system-wide && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 8

echo ?? Starting Frontend Final Test...
cd ClientApp

start "Frontend - Final Access Test" cmd /k "echo ?? FRONTEND - Final Access Denied Fix Test && echo ===================================== && echo. && echo ?? TARGETED FIX TEST SEQUENCE: && echo. && echo ?? Phase 1: Test Previously Failing Screens && echo   1. Login with custom role user (comprehensive permissions) && echo   2. Navigate to ????????? (Categories) ? Should work NOW ? && echo   3. Navigate to ??????? (Departments) ? Should work NOW ? && echo   4. Navigate to ???????? (Employees) ? Should work NOW ? && echo   5. Navigate to ??????? (Warehouses) ? Should work NOW ? && echo   6. Navigate to ???????? (Reports) ? Should show data NOW ? && echo. && echo ?? Phase 2: Complete System Validation && echo   7. Test all remaining screens: && echo      • Dashboard ? • Assets ? • Transfers ? && echo      • Disposal ? • Maintenance ? • Settings ? && echo      • User Management ? • Role Management ? && echo. && echo ?? Phase 3: Network Tab Verification && echo   8. Check Network tab - ALL APIs should return 200 OK && echo   9. No 403 Forbidden errors anywhere && echo   10. Complete permission-based system working && echo. && npm run dev"

echo.
echo ?? FINAL AUTHORIZATION FIX READY!
echo ================================
echo.

echo ?? SUCCESS CRITERIA - NO MORE ACCESS DENIED:
echo.
echo ? PREVIOUSLY FAILING SCREENS:
echo   ? ?????????: Category management interface
echo   ? ???????: Department management interface  
echo   ? ????????: Employee management interface
echo   ? ???????: Warehouse management interface
echo   ? ????????: Reports with actual data
echo.
echo ? COMPLETE SYSTEM STATUS:
echo   ? Dashboard: Working ?
echo   ? Assets: Working ? 
echo   ? Categories: Should work NOW ?
echo   ? Departments: Should work NOW ?
echo   ? Warehouses: Should work NOW ?
echo   ? Transfers: Working ?
echo   ? Employees: Should work NOW ?
echo   ? Disposal: Working ?
echo   ? Maintenance: Working ?
echo   ? Reports: Should work NOW ?
echo   ? User Management: Working ?
echo   ? Role Management: Working ?
echo   ? Settings: Working ?
echo.
echo ? TECHNICAL VALIDATION:
echo   ? Network tab: All APIs return 200 OK
echo   ? No 403 Forbidden errors system-wide
echo   ? Custom roles work perfectly everywhere
echo   ? Permission-based authorization fully active

pause

echo ?? COMPREHENSIVE SYSTEM TEST:
echo =============================
echo.
echo ?? Complete Workflow Test:
echo   1. Login with custom role user
echo   2. Ensure user has ALL permissions:
echo      - Dashboard.view, Assets.view
echo      - Categories.view, Departments.view  
echo      - Warehouses.view, Employees.view
echo      - Transfers.view, Reports.view
echo      - Disposal.view, Maintenance.view
echo      - Users.view, Permissions.view, Settings.view
echo   3. Navigate through ALL screens systematically
echo   4. Verify each screen loads data successfully
echo   5. Check Network tab - should be all green (200 OK)

echo.
echo ?? EXPECTED FINAL RESULT:
echo ========================
echo.
echo ? ZERO ACCESS DENIED ERRORS:
echo   • All screens accessible based on permissions
echo   • No hardcoded role limitations anywhere
echo   • Complete permission-based access control
echo   • Enterprise-grade role management system
echo.
echo ? FULL SYSTEM FUNCTIONALITY:
echo   • Asset management system fully operational
echo   • Custom roles work system-wide
echo   • Granular permission control
echo   • Scalable for unlimited custom roles

echo.
echo This should eliminate ALL access denied errors! ??
pause