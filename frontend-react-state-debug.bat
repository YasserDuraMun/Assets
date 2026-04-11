@echo off
cls
echo ?? FRONTEND DEBUG - API WORKS, FRONTEND BROKEN
echo ==============================================

echo ?? CONFIRMED STATUS:
echo   ? Database: Viewer has Dashboard permission (AllowView=1)
echo   ? API Response: Perfect JSON with Dashboard allowView: true
echo   ? Frontend: Still shows "Access denied for Dashboard.view"  
echo   ?? Issue: React state management or hasPermission logic

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Backend is working perfectly, keeping it running...
start "Backend - API Working" cmd /k "echo ??? BACKEND - API Working Perfectly && echo ============================= && echo. && echo ? API returns correct JSON: && echo   {screenName: Dashboard, allowView: true} && echo ? Database permissions confirmed correct && echo ? PermissionService working correctly && echo ?? Focus is now on frontend React state && echo. && dotnet run"

echo ? Waiting for backend...
timeout /t 8

echo ?? Starting frontend with debug mode...
cd ClientApp

start "Frontend - State Debug" cmd /k "echo ?? FRONTEND - React State Debug && echo ========================== && echo. && echo ?? CRITICAL FRONTEND DEBUGGING: && echo. && echo ?? Step 1: Login and Watch Console Logs && echo   • Email: haya1.alzeer1992@gmail.com && echo   • Password: password123 && echo   • API returns perfect data && echo   • Watch for React state update issues && echo. && echo ?? Step 2: Check State Management && echo   • Look for: 'Setting permissions:' log && echo   • Look for: 'Permissions state updated successfully' && echo   • Check if permissions array has correct data && echo. && echo ?? Step 3: Test hasPermission Function && echo   • In console, type: window.debugPermissions() && echo   • Should show current permissions state && echo   • Should show hasPermission test result && echo. && echo ?? Step 4: Check Timing Issues && echo   • PermissionGuard may check before state updates && echo   • Look for race conditions in useEffect && echo. && npm run dev"

echo.
echo ?? FRONTEND REACT STATE DEBUGGING!
echo ==================================
echo.

echo ?? FRONTEND DEBUGGING CHECKLIST:
echo.
echo 1?? AuthContext State Update:
echo   ? Check: "Permissions API response: {success: true, data: [...]}"
echo   ? Check: "Setting permissions: [Dashboard permission]"
echo   ? Issue: State not updating or timing problem
echo.
echo 2?? hasPermission Function:
echo   ? Check: Function receives correct parameters
echo   ? Check: permissions array has data when function runs
echo   ? Issue: permissions array empty when checked
echo.
echo 3?? PermissionGuard Timing:
echo   ? Check: When does PermissionGuard check permissions
echo   ? Check: Are permissions loaded before guard checks
echo   ? Issue: Guard checks before permissions load
echo.
echo 4?? React Rendering Issues:
echo   ? Check: useEffect dependencies
echo   ? Check: State updates triggering re-renders
echo   ? Issue: State updates not triggering re-renders
echo.

pause

echo ?? MANUAL FRONTEND DEBUGGING STEPS:
echo ===================================
echo.
echo ?? After Login, in Browser Console:
echo   1. Type: console.log(window.debugPermissions)
echo   2. If function exists, call: window.debugPermissions()
echo   3. Check permissions state and hasPermission result
echo.
echo ?? Check Network Tab:
echo   1. Verify API call: GET /api/SecurityTest/my-permissions
echo   2. Confirm response: {success: true, data: [{screenName: Dashboard, allowView: true}]}
echo   3. Check if response matches what AuthContext receives
echo.
echo ?? Check Console Timeline:
echo   1. "Permissions API response" - should show correct data
echo   2. "Setting permissions" - should show Dashboard permission  
echo   3. "hasPermission Check" - should find Dashboard permission
echo   4. "PermissionGuard result" - should grant access
echo.

echo The issue is definitely in React state management! ??

pause