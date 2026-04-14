@echo off
cls
echo ?? SETTINGS ACCESS DENIED - DEBUG PERMISSIONS
echo =============================================

echo ?? PROBLEM REPORTED:
echo   ? Created new role with comprehensive permissions  
echo   ? Assigned role to employee
echo   ? Gave permissions: add, view, edit, delete on all screens
echo   ? Settings page shows Access Denied
echo   ? Should show 4 sub-screens: Departments, Employees, Warehouses, Asset Statuses

echo ?? DEBUGGING STEPS:
echo   • Added console logging to SettingsPage
echo   • Will check which specific permissions are missing
echo   • Will verify AuthContext permission loading

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting Backend for Permission Debug...
start "Backend - Settings Debug" cmd /k "echo ??? BACKEND - Settings Permission Debug && echo ========================== && echo. && echo ?? Settings Access Issue Debug: && echo   • User reports having all permissions && echo   • Settings page shows Access Denied && echo   • Need to verify actual permission loading && echo. && echo ?? Check Backend Logs For: && echo   • Permission queries for custom role user && echo   • Successful permission grants && echo   • Any permission-related errors && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 8

echo ?? Starting Frontend Settings Debug...
cd ClientApp

start "Frontend - Settings Debug" cmd /k "echo ?? FRONTEND - Settings Access Debug && echo ========================== && echo. && echo ?? SETTINGS DEBUG TEST SEQUENCE: && echo. && echo ?? Phase 1: Login and Check Console && echo   1. Login with the custom role user && echo   2. Open browser Developer Tools ? Console && echo   3. Navigate to /settings && echo   4. Check console logs: && echo      • 'Settings Tab Check: Categories.view = true/false' && echo      • 'Settings Tab Check: Departments.view = true/false' && echo      • 'Settings Tab Check: Employees.view = true/false' && echo      • 'Settings Tab Check: Warehouses.view = true/false' && echo      • 'Settings: Available tabs count = X' && echo. && echo ?? Phase 2: Permission Verification && echo   5. Check AuthContext logs in console: && echo      • Should show loaded permissions for user && echo      • Should show hasPermission calls and results && echo. && echo ?? Phase 3: Database vs Frontend Check && echo   6. Verify in Role Management: && echo      • Login as Super Admin && echo      • Go to Role Permissions page && echo      • Check if custom role actually has permissions && echo      • Verify permissions are saved correctly && echo. && npm run dev"

echo.
echo ?? SETTINGS ACCESS DEBUG READY!
echo ===============================
echo.

echo ?? DEBUGGING CHECKLIST:
echo.
echo 1?? CONSOLE LOG ANALYSIS:
echo   ? Check browser console during /settings navigation
echo   ? Look for 'Settings Tab Check' logs
echo   ? Verify which permissions return false
echo   ? Check 'Available tabs count' value
echo.
echo 2?? AUTHCONTEXT VERIFICATION:
echo   ? Check if user permissions are loaded
echo   ? Verify hasPermission function is working
echo   ? Check AuthContext state in browser dev tools
echo.
echo 3?? ROLE PERMISSIONS VERIFICATION:
echo   ? Login as Super Admin
echo   ? Check role permissions management
echo   ? Verify custom role has expected permissions
echo   ? Ensure permissions are saved to database
echo.
echo 4?? API RESPONSE VERIFICATION:
echo   ? Check Network tab during login
echo   ? Verify /api/security/current-user-permissions returns data
echo   ? Check permissions API response format

pause

echo ?? EXPECTED DEBUGGING RESULTS:
echo =============================
echo.
echo ?? If Permissions Are Missing:
echo   • Console shows: "Settings Tab Check: [Screen].view = false"
echo   • Available tabs count = 0
echo   • Need to add missing permissions to role
echo.
echo ?? If Permissions Exist But Not Loading:
echo   • Console shows: "Settings Tab Check: [Screen].view = true" 
echo   • But still shows Access Denied
echo   • AuthContext or hasPermission issue
echo.
echo ?? If Database Permissions Missing:
echo   • Role management shows no permissions assigned
echo   • Need to properly assign permissions to role
echo   • Re-assign comprehensive permissions

echo.
echo ?? DEBUGGING STEPS:
echo ==================
echo.
echo ?? Step 1: Check Console Logs
echo   • Open /settings page
echo   • Check browser console for permission checks
echo   • Note which permissions return false
echo.
echo ?? Step 2: Verify Role Permissions  
echo   • Login as Super Admin
echo   • Go to Role Permissions management
echo   • Verify custom role has all screen permissions
echo.
echo ?? Step 3: Test Individual Screens
echo   • Try accessing /categories directly
echo   • Try accessing /departments directly  
echo   • Try accessing /employees directly
echo   • Try accessing /warehouses directly

echo.
echo Start debugging and check console logs! ??
pause