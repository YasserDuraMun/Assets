@echo off
cls
echo ?? SETTINGS ACCESS FIX - ADD SETTINGS PERMISSION
echo ==============================================

echo ?? PROBLEM IDENTIFIED:
echo   ? Custom role user cannot access /settings
echo   ? Gets "Access Denied - Required: Settings.view"
echo   ? Can access sub-pages directly (/categories, /departments, etc.)

echo ?? ROOT CAUSE:
echo   • User has: Categories.view, Departments.view, Employees.view, Warehouses.view
echo   • User missing: Settings.view permission
echo   • Settings page requires Settings.view to display

echo ?? SOLUTION 1: Add Settings.view Permission
echo ========================================

echo ?? QUICK FIX STEPS:
echo   1. Login as Super Admin
echo   2. Go to "????? ??????? ??????????"
echo   3. Select the custom role (the one causing issues)
echo   4. Enable "Settings" ? "View" permission ?
echo   5. Save permissions
echo   6. Test /settings access with custom role user

echo ?? Alternative: Modify SettingsPage Logic
echo ==========================================

echo ?? CODE FIX OPTION:
echo   • Modify SettingsPage.tsx to not require Settings.view
echo   • Make it show tabs based on sub-permissions only
echo   • Remove Settings.view requirement entirely

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting System for Settings Fix...
start "Backend - Settings Permission Fix" cmd /k "echo ??? BACKEND - Settings Permission Debug && echo ========================== && echo. && echo ?? Settings Access Issue: && echo   • User has sub-permissions but not Settings.view && echo   • Settings page requires Settings.view permission && echo   • Sub-pages work because they check specific permissions && echo. && echo ?? Quick Fix Required: && echo   • Add Settings.view to custom role permissions && echo   • Or modify SettingsPage logic (code change) && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 8

echo ?? Starting Frontend for Settings Test...
cd ClientApp

start "Frontend - Settings Access Test" cmd /k "echo ?? FRONTEND - Settings Access Debug && echo =========================== && echo. && echo ?? SETTINGS ACCESS TEST: && echo. && echo ?? Current Status: && echo   • /categories ? Works ? (Categories.view) && echo   • /departments ? Works ? (Departments.view) && echo   • /employees ? Works ? (Employees.view) && echo   • /warehouses ? Works ? (Warehouses.view) && echo   • /settings ? Access Denied ? (Missing Settings.view) && echo. && echo ?? After Adding Settings.view Permission: && echo   1. Login with custom role user && echo   2. Navigate to /settings && echo   3. Should now work and show all available tabs && echo   4. Each tab based on specific permissions && echo. && npm run dev"

echo.
echo ?? SETTINGS ACCESS FIX READY!
echo ============================
echo.

echo ?? SOLUTION OPTIONS:
echo.
echo ? OPTION 1: Add Settings Permission (Recommended)
echo   ? Login as Super Admin
echo   ? ????? ??????? ?????????? ? Select custom role
echo   ? Enable Settings ? View permission
echo   ? Save permissions
echo   ? Test /settings access
echo.
echo ? OPTION 2: Code Modification (Advanced)
echo   ? Modify SettingsPage.tsx logic
echo   ? Remove Settings.view requirement
echo   ? Show tabs based on sub-permissions only
echo   ? Requires code deployment
echo.
echo ?? EXPECTED RESULT:
echo   • /settings page accessible
echo   • Shows tabs based on user permissions:
echo     - Categories tab (if Categories.view)
echo     - Departments tab (if Departments.view)
echo     - Employees tab (if Employees.view)
echo     - Warehouses tab (if Warehouses.view)

pause

echo ?? PERMISSION MATRIX FOR SETTINGS:
echo =================================
echo.
echo ?? Required Permissions for Full Settings Access:
echo   Settings.view ? Access to /settings page itself
echo   Categories.view ? Categories tab in settings
echo   Departments.view ? Departments tab in settings
echo   Employees.view ? Employees tab in settings
echo   Warehouses.view ? Warehouses tab in settings
echo.
echo ?? Current User Status:
echo   Settings.view ? ? Missing (causes Access Denied)
echo   Categories.view ? ? Has (sub-page works)
echo   Departments.view ? ? Has (sub-page works)  
echo   Employees.view ? ? Has (sub-page works)
echo   Warehouses.view ? ? Has (sub-page works)

echo.
echo Add Settings.view permission to fix the issue! ??
pause