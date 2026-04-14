@echo off
cls
echo ?? SETTINGS DEBUG WITH FALLBACK MODE
echo ===================================

echo ?? IDENTIFIED ISSUE:
echo   ? User has 12 permissions loaded successfully
echo   ? All permissions have allowView: true
echo   ? SettingsPage still shows Access Denied
echo   ?? Added fallback mode to show tabs when permissions exist

echo ?? CURRENT STATUS:
echo   • Console shows: 12 permissions loaded
echo   • All required permissions present:
echo     - Categories.view ?
echo     - Departments.view ?  
echo     - Employees.view ?
echo     - Warehouses.view ?
echo     - Assets.view ?

echo ?? TEMPORARY FIX APPLIED:
echo   • Added fallback mode in SettingsPage
echo   • If permissions loaded but no tabs ? Show all tabs
echo   • Added extensive console logging
echo   • Will help identify exact issue

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting Backend...
start "Backend - Settings Debug" cmd /k "echo ??? BACKEND - Settings Fallback Mode && echo ======================== && echo. && echo ?? Settings Access Debug: && echo   • User has comprehensive permissions && echo   • SettingsPage modified with fallback && echo   • Should now work in any case && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 8

echo ?? Starting Frontend with Fallback...
cd ClientApp

start "Frontend - Settings Fallback" cmd /k "echo ?? FRONTEND - Settings Fallback Mode && echo ============================= && echo. && echo ?? SETTINGS FALLBACK TEST: && echo. && echo ?? Test Sequence: && echo   1. Login with custom role user && echo   2. Open browser console (F12) && echo   3. Navigate to /settings && echo   4. Check console logs: && echo      • 'SettingsPage: Rendering with permissions count: 12' && echo      • 'Settings Tab Check: [Screen].view = true/false' && echo      • Should see fallback message if needed && echo. && echo ?? Expected Results: && echo   • Settings page loads successfully && echo   • Shows all tabs (fallback mode or normal mode) && echo   • Can access Categories, Departments, Employees, Warehouses && echo   • Console shows detailed permission checks && echo. && npm run dev"

echo.
echo ?? SETTINGS FALLBACK MODE READY!
echo ===============================
echo.

echo ?? DEBUGGING WORKFLOW:
echo.
echo ?? Phase 1: Console Analysis
echo   ? Check 'SettingsPage: Rendering' logs
echo   ? Check 'Settings Tab Check' results  
echo   ? See if fallback mode triggers
echo.
echo ?? Phase 2: Settings Access
echo   ? Navigate to /settings page
echo   ? Should load without Access Denied
echo   ? Should show tabs (normal or fallback)
echo.
echo ?? Phase 3: Tab Functionality
echo   ? Click each settings tab
echo   ? Verify data loads correctly
echo   ? Test CRUD operations if needed

pause

echo ?? EXPECTED OUTCOMES:
echo ====================
echo.
echo ?? If Normal Mode Works:
echo   • Console shows: "Settings Tab Check: [Screen].view = true"
echo   • Settings page shows 4-5 tabs normally
echo   • No fallback message appears
echo.
echo ?? If Fallback Mode Triggers:
echo   • Console shows: "Using fallback - showing all tabs"
echo   • Settings page shows warning message
echo   • All tabs displayed anyway
echo   • Identifies hasPermission timing issue
echo.
echo ?? If Still Access Denied:
echo   • Need deeper AuthContext debugging
echo   • May need to check timing/async issues
echo   • Could be React state update problem

echo.
echo Test settings access now with fallback protection! ??
pause