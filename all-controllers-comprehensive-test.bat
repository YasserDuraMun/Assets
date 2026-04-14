@echo off
cls
echo ?? ALL CONTROLLERS FIXED - COMPREHENSIVE TEST
echo ============================================

echo ? CONTROLLERS FIXED:
echo   • DashboardController - ? Complete
echo   • AssetsController - ? Complete (CONFIRMED WORKING)
echo   • CategoriesController - ? Complete
echo   • TransfersController - ? Fixed main methods
echo   • DepartmentsController - ? Fixed main methods
echo   • WarehousesController - ? Fixed main methods

echo ?? EXPECTED RESULTS:
echo   • Dashboard: Working ?
echo   • Assets: Working ? (User confirmed)
echo   • Categories: Should work now ?
echo   • Departments: Should work now ?
echo   • Warehouses: Should work now ?
echo   • Transfers: Should work now ?
echo   • Settings: Depends on sub-page permissions

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting Backend with All Major Fixes...
start "Backend - All Controllers" cmd /k "echo ??? BACKEND - All Major Controllers Fixed && echo ================================== && echo. && echo ? PERMISSION-BASED AUTHORIZATION: && echo   • Dashboard: RequirePermission active && echo   • Assets: RequirePermission active && echo   • Categories: RequirePermission active && echo   • Departments: RequirePermission active && echo   • Warehouses: RequirePermission active && echo   • Transfers: RequirePermission active && echo. && echo ?? Custom roles should now access: && echo   • All screens based on assigned permissions && echo   • No more 403 errors on fixed controllers && echo   • Settings will work if user has specific permissions && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 8

echo ?? Starting Frontend Comprehensive Test...
cd ClientApp

start "Frontend - All Screens Test" cmd /k "echo ?? FRONTEND - All Screens Comprehensive Test && echo ======================================== && echo. && echo ?? COMPLETE TESTING SEQUENCE: && echo. && echo ?? Phase 1: Login with Custom Role && echo   • Use user with comprehensive permissions && echo   • Should login successfully && echo. && echo ?? Phase 2: Test All Fixed Screens && echo   • Dashboard ? Should work (confirmed) ? && echo   • Assets ? Should work (USER CONFIRMED) ? && echo   • Categories ? Should now work ? && echo   • Departments ? Should now work ? && echo   • Warehouses ? Should now work ? && echo   • Transfers ? Should now work ? && echo. && echo ?? Phase 3: Test Settings Page && echo   • Settings ? Check each tab: && echo     - Categories tab (needs Categories.view) && echo     - Departments tab (needs Departments.view) && echo     - Warehouses tab (needs Warehouses.view) && echo     - Employees tab (needs Employees.view) && echo. && echo ?? Phase 4: Network Tab Analysis && echo   • All APIs should return 200 OK now && echo   • No more 403 errors on fixed controllers && echo   • Data should load in all screens && echo. && npm run dev"

echo.
echo ?? COMPREHENSIVE TEST READY!
echo ===========================
echo.

echo ?? SUCCESS CRITERIA:
echo.
echo ? MAJOR SCREENS FIXED:
echo   ? Dashboard with full data  
echo   ? Assets with asset list (CONFIRMED ?)
echo   ? Categories with category list
echo   ? Departments with department list
echo   ? Warehouses with warehouse list
echo   ? Transfers with transfer list
echo.
echo ? SETTINGS PAGE TESTING:
echo   ? Settings page opens
echo   ? Categories tab shows category data
echo   ? Departments tab shows department data  
echo   ? Warehouses tab shows warehouse data
echo   ? Each tab works based on permissions
echo.
echo ? NETWORK TAB SUCCESS:
echo   ? /api/dashboard/* ? 200 OK
echo   ? /api/assets ? 200 OK (CONFIRMED ?)
echo   ? /api/categories ? 200 OK
echo   ? /api/departments ? 200 OK
echo   ? /api/warehouses ? 200 OK
echo   ? /api/transfers ? 200 OK

pause

echo ?? TESTING WORKFLOW:
echo ===================
echo.
echo ?? Complete System Test:
echo   1. Login with custom role user
echo   2. Navigate to each main screen:
echo      • Dashboard ? Check charts and stats
echo      • Assets ? Check asset list (should work)
echo      • Categories ? Check category list  
echo      • Departments ? Check department list
echo      • Warehouses ? Check warehouse list
echo      • Transfers ? Check transfer list
echo   3. Test Settings page:
echo      • Open Settings from menu
echo      • Click each tab and verify data loads
echo   4. Check browser Network tab:
echo      • Should see 200 OK responses
echo      • No 403 Forbidden errors

echo.
echo ?? EXPECTED RESULTS:
echo ===================
echo.
echo ? BEFORE: Only Dashboard worked
echo ? NOW: Assets + Dashboard work (confirmed)
echo ? AFTER THIS FIX: All major screens should work
echo ? Settings: Will work based on specific permissions

echo.
echo Test all screens now - should see dramatic improvement! ??
pause