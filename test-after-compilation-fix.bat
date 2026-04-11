@echo off
cls
echo ?? COMPILATION CONFLICTS RESOLVED - TESTING PERMISSIONS
echo ====================================================

echo ?? ISSUE RESOLVED:
echo   ? Removed duplicate SecurityTestController-Enhanced.cs file
echo   ? Compilation errors cleared
echo   ? Build successful
echo   ? Ready to test permission system
echo.

echo ?? CURRENT STATE:
echo   • AuthContext.tsx: Enhanced with permissionsLoading state
echo   • SecurityTestController.cs: Original file with API working
echo   • PermissionGuard.tsx: Ready for loading state support
echo   • No more compilation conflicts
echo.

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting backend after conflict resolution...
start "Backend - Conflicts Resolved" cmd /k "echo ??? BACKEND - Compilation Conflicts Resolved && echo ===================================== && echo. && echo ? SecurityTestController-Enhanced.cs removed && echo ? Build successful with no conflicts && echo ?? API endpoint: https://localhost:44385/api/SecurityTest/my-permissions && echo ?? Ready for permission testing && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 10

echo ?? Starting frontend for comprehensive testing...
cd ClientApp

start "Frontend - Conflicts Resolved" cmd /k "echo ?? FRONTEND - Compilation Conflicts Resolved && echo ====================================== && echo. && echo ?? COMPREHENSIVE PERMISSION TESTING: && echo. && echo ?? Test 1: Super Admin Login && echo   • Should work perfectly with bypass && echo   • All menus should be visible && echo. && echo ?? Test 2: Viewer Role Login && echo   • Email: haya1.alzeer1992@gmail.com && echo   • Password: password123 && echo   • Should load permissions from API && echo   • Should get Dashboard access if API returns allowView: true && echo. && echo ?? Test 3: Check Console Logs && echo   • API should return JSON with correct permissions && echo   • AuthContext should save permissions to state && echo   • hasPermission should find Dashboard permission && echo   • PermissionGuard should grant access && echo. && npm run dev"

echo.
echo ?? PERMISSION SYSTEM READY FOR TESTING!
echo ========================================
echo.

echo ?? FINAL TEST SEQUENCE:
echo.
echo 1?? Backend Test:
echo   • Check: https://localhost:44385/api/SecurityTest/public
echo   • Should return: {"message": "API ???? ???? ????", "success": true}
echo   • If works: Backend is ready
echo.
echo 2?? Frontend Login Test:
echo   • Go to: http://localhost:5173
echo   • Login as: haya1.alzeer1992@gmail.com / password123
echo   • Check browser console for permission loading logs
echo.
echo 3?? Permission Check:
echo   • Should see: "Raw API data" with Dashboard permission
echo   • Should see: "Setting permissions with 1 items"
echo   • Should see: "hasPermission result: Dashboard.view = true"
echo   • Should NOT see: "Access denied for Dashboard.view"
echo.
echo 4?? Expected Success:
echo   • Dashboard loads successfully
echo   • No access denied messages
echo   • Menu shows appropriate items based on permissions
echo.

pause

echo ?? TROUBLESHOOTING GUIDE:
echo =========================
echo.
echo ?? If API returns HTML instead of JSON:
echo   • Check Program.cs middleware order
echo   • MapControllers should come before MapFallbackToFile
echo.
echo ?? If permissions state remains empty:
echo   • Check AuthContext loading logic
echo   • Verify API response format
echo   • Check React state management timing
echo.
echo ?? If hasPermission returns false despite good data:
echo   • Check screen name matching (case sensitive)
echo   • Verify allowView property in permission object
echo   • Check for timing issues with state updates
echo.

echo The compilation conflicts are resolved - test the system now! ??

pause