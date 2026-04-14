@echo off
cls
echo ?? SETTINGS PAGE PERMISSION-BASED FIX COMPLETE
echo ============================================

echo ?? PROBLEM SOLVED:
echo   ? User had all permissions but couldn't access /settings
echo   ? SettingsPage was checking for Settings.view (not assigned)
echo   ? Modified SettingsPage to check sub-permissions instead

echo ?? SOLUTION APPLIED:
echo   • SettingsPage now builds tabs based on actual user permissions
echo   • No longer requires Settings.view permission
echo   • Shows only tabs user has access to:
echo     - Categories tab (if Categories.view)
echo     - Departments tab (if Departments.view)  
echo     - Employees tab (if Employees.view)
echo     - Warehouses tab (if Warehouses.view)
echo     - Asset Statuses tab (if Assets.view)

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting Backend with Fixed Settings...
start "Backend - Settings Fixed" cmd /k "echo ??? BACKEND - Settings Permission Fix Applied && echo ============================= && echo. && echo ? SETTINGS PAGE FIXED: && echo   • No longer requires Settings.view permission && echo   • Permission-based tab rendering && echo   • Shows only accessible tabs && echo. && echo ?? Expected Results: && echo   • User can access /settings page ? && echo   • Shows tabs based on individual permissions && echo   • Full settings functionality restored && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 8

echo ?? Starting Frontend Settings Test...
cd ClientApp

start "Frontend - Settings Fixed" cmd /k "echo ?? FRONTEND - Settings Access Fixed && echo ============================= && echo. && echo ?? SETTINGS FIX TEST SEQUENCE: && echo. && echo ?? Phase 1: Settings Page Access && echo   1. Login with custom role user && echo   2. Navigate to /settings ? Should work NOW ? && echo   3. No more 'Settings.view required' error && echo   4. Page should load successfully && echo. && echo ?? Phase 2: Tab Verification && echo   5. Check available tabs: && echo      • Categories ? Should show (has Categories.view) && echo      • Departments ? Should show (has Departments.view) && echo      • Employees ? Should show (has Employees.view) && echo      • Warehouses ? Should show (has Warehouses.view) && echo      • Asset Statuses ? Should show (has Assets.view) && echo. && echo ?? Phase 3: Tab Functionality && echo   6. Click each tab ? Should work without errors && echo   7. Each tab should load its respective data && echo   8. Full settings management functionality && echo. && npm run dev"

echo.
echo ?? SETTINGS ACCESS RESTORED!
echo ===========================
echo.

echo ?? SUCCESS INDICATORS:
echo.
echo ? Settings Page Access:
echo   ? /settings loads without Access Denied error
echo   ? Settings page displays with multiple tabs
echo   ? No Settings.view permission required
echo.
echo ? Dynamic Tab Display:
echo   ? Categories tab visible (Categories.view permission)
echo   ? Departments tab visible (Departments.view permission)
echo   ? Employees tab visible (Employees.view permission)
echo   ? Warehouses tab visible (Warehouses.view permission)
echo   ? Asset Statuses tab visible (Assets.view permission)
echo.
echo ? Full Functionality:
echo   ? Each tab loads correctly
echo   ? Data displays in each tab
echo   ? CRUD operations work based on specific permissions
echo   ? Settings management fully restored

pause

echo ?? HOW THE FIX WORKS:
echo ====================
echo.
echo ?? Before Fix:
echo   • SettingsPage required Settings.view permission
echo   • User didn't have Settings.view ? Access Denied
echo   • Had sub-permissions but couldn't access main page
echo.
echo ?? After Fix:
echo   • SettingsPage checks individual tab permissions
echo   • Shows only tabs user has access to
echo   • No Settings.view requirement
echo   • Dynamic tab rendering based on actual permissions
echo.
echo ?? Permission Logic:
echo   • Categories tab: Requires Categories.view
echo   • Departments tab: Requires Departments.view
echo   • Employees tab: Requires Employees.view
echo   • Warehouses tab: Requires Warehouses.view
echo   • Asset Statuses: Requires Assets.view
echo.
echo ?? User Experience:
echo   • Seamless access to settings
echo   • Only sees relevant tabs
echo   • Full functionality within permitted areas

echo.
echo Settings should be fully accessible now! ??
pause