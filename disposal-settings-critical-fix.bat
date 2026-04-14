@echo off
cls
echo ?? CRITICAL FIXES - DISPOSAL & SETTINGS
echo ======================================

echo ?? IDENTIFIED PROBLEMS:
echo   ? ?????? ????????? (Disposal) - Still 403 errors
echo   ? ????????? (Settings) - Not showing/accessible

echo ?? ROOT CAUSES FOUND:
echo   • DisposalController: Not all methods were fixed
echo   • Settings Screen: Required "Settings" permission that wasn't in availableScreens
echo   • MainLayout: Settings menu logic needed improvement

echo ? FIXES APPLIED:
echo   • DisposalController: Updated ALL methods (GET, GET by ID, POST)
echo   • RolePermissionsPage: Added "Settings" to availableScreens  
echo   • MainLayout: Enhanced Settings menu logic (show if user has ANY sub-permission)

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting Backend with Critical Fixes...
start "Backend - Disposal & Settings Fix" cmd /k "echo ??? BACKEND - Disposal ^& Settings Fixed && echo =============================== && echo. && echo ? DisposalController COMPLETELY FIXED: && echo   • GET /api/disposal ? RequirePermission(Disposal, view) && echo   • GET /api/disposal/{id} ? RequirePermission(Disposal, view) && echo   • POST /api/disposal ? RequirePermission(Disposal, insert) && echo   • All disposal endpoints should work now && echo. && echo ? Settings Screen Enhanced: && echo   • Added Settings to availableScreens && echo   • MainLayout logic improved && echo   • Settings should appear in menu now && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 8

echo ?? Starting Frontend with Critical Fixes...
cd ClientApp

start "Frontend - Critical Fixes Test" cmd /k "echo ?? FRONTEND - Disposal ^& Settings Fix Test && echo ==================================== && echo. && echo ?? CRITICAL TEST SEQUENCE: && echo. && echo ?? Phase 1: Login and Check Settings Menu && echo   1. Login with user that has comprehensive permissions && echo   2. Check main menu - Settings should now appear ? && echo   3. Click Settings - submenu should show available tabs && echo   4. Test each Settings tab based on permissions && echo. && echo ?? Phase 2: Test Disposal Screen && echo   5. Navigate to '?????? ?????????' && echo   6. Screen should load disposal data ? && echo   7. No more 403 errors in Network tab && echo   8. Disposal management should be fully functional && echo. && echo ?? Phase 3: Comprehensive Settings Test && echo   9. Settings ? Categories: Should work if Categories.view && echo   10. Settings ? Departments: Should work if Departments.view && echo   11. Settings ? Warehouses: Should work if Warehouses.view && echo   12. Settings ? Employees: Should work if Employees.view && echo. && npm run dev"

echo.
echo ?? CRITICAL FIXES READY FOR TESTING!
echo ===================================
echo.

echo ?? SUCCESS INDICATORS:
echo.
echo ? Settings Menu:
echo   ? Settings appears in main menu
echo   ? Settings has submenu with available tabs
echo   ? Each tab works based on user permissions
echo   ? No more missing Settings screen
echo.
echo ? Disposal Screen:
echo   ? '?????? ?????????' loads disposal data
echo   ? Network tab shows 200 OK for disposal APIs
echo   ? Full disposal management functionality
echo   ? No more 403 Forbidden errors
echo.
echo ? Complete System Status:
echo   ? Dashboard: Working ?
echo   ? Assets: Working ? (previously confirmed)
echo   ? Categories: Working ?
echo   ? Departments: Working ?
echo   ? Warehouses: Working ?
echo   ? Transfers: Working ?
echo   ? Disposal: Should work NOW ?
echo   ? Maintenance: Working ?
echo   ? Reports: Working ?
echo   ? User Management: Working ?
echo   ? Role Management: Working ?
echo   ? Settings: Should work NOW ?

pause

echo ?? TESTING WORKFLOW:
echo ===================
echo.
echo ?? Step 1: Settings Menu Test
echo   • Check if Settings appears in left menu
echo   • Click Settings - should expand to show submenu
echo   • Try each submenu item based on permissions
echo.
echo ?? Step 2: Disposal Screen Test  
echo   • Navigate to '?????? ?????????'
echo   • Should show disposal records/management interface
echo   • Check Network tab - APIs should return 200 OK
echo.
echo ?? Step 3: Permission Assignment for Full Test
echo   • Make sure test user has these permissions:
echo     - Disposal.view (for disposal screen)
echo     - Settings.view (for settings menu) 
echo     - Categories.view, Departments.view, etc. (for settings tabs)

echo.
echo ?? EXPECTED FINAL RESULT:
echo ========================
echo.
echo ? ALL SCREENS WORKING:
echo   • Complete system functionality
echo   • No missing screens
echo   • No 403 errors anywhere  
echo   • Settings fully accessible with all tabs
echo   • Disposal management fully functional
echo   • Custom roles work perfectly system-wide

echo.
echo Test these critical fixes now! ??
pause