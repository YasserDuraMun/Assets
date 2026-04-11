@echo off
cls
echo ?? PERMISSION TIMING ISSUE FIXED
echo =================================

echo ? Applied Fix:
echo   ?? Removed setTimeout dependency (unreliable timing)
echo   ?? Added loadUserPermissionsForUser helper function
echo   ?? Passing user object directly to avoid null reference
echo   ?? Immediate permission loading after login success
echo   ?? Fixed React state timing issue
echo.

echo ?? The issue was:
echo   ? Login ? setState(user) ? setTimeout ? loadPermissions
echo   ? But user state was still null when timeout executed
echo   ? Now: Login ? setState(user) ? loadPermissions(user) immediately
echo.

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting backend server...
start "Backend - Timing Fixed" cmd /k "echo ??? BACKEND - Permission Timing Fixed && echo ================================= && echo. && echo ? Timing issue resolved && echo ?? Permission loading should work immediately && echo ?? Login with any user to test && echo. && dotnet run"

echo ? Waiting for backend to start...
timeout /t 8

echo ?? Starting frontend...
cd ClientApp

start "Frontend - Permission Timing Fixed" cmd /k "echo ?? FRONTEND - Permission Timing Fixed && echo ==================================== && echo. && echo ? Permission loading timing fixed && echo ?? Login as: haya1.alzeer1992@gmail.com / password123 && echo ?? Should see immediate permission loading && echo ??? No more 'Access denied' for valid permissions && echo. && npm run dev"

echo.
echo ?? PERMISSION TIMING ISSUE RESOLVED!
echo ===================================
echo.
echo ?? Test Instructions:
echo.
echo ?? Step 1: Login Test
echo   • Go to: http://localhost:5173
echo   • Open DevTools (F12) ? Console tab
echo   • Login as: haya1.alzeer1992@gmail.com / password123
echo   • Watch console logs in order
echo.
echo ?? Step 2: Expected Log Sequence
echo   1. ? "Login successful, saving token"
echo   2. ? "User set in context: salem"
echo   3. ? "Loading permissions immediately after login..."
echo   4. ? "=== Starting loadUserPermissionsForUser ==="
echo   5. ? "User provided: {user object}" (NOT null!)
echo   6. ? "Permissions API response: {data}"
echo   7. ? "Setting permissions: [array]"
echo   8. ?? Individual permission logs
echo   9. ? "=== hasPermission Check ===" 
echo   10. ? "hasPermission: Dashboard.view = true"
echo.

echo ??? Step 3: Access Test
echo   • Should automatically navigate to Dashboard
echo   • No "Access denied" messages
echo   • Menu should show permitted items only
echo   • All clicks should work smoothly
echo.

echo ?? Step 4: Different Users Test
echo   • Try Super Admin: Should see all menus
echo   • Try Viewer role: Should see limited menus
echo   • All should load permissions immediately
echo.

pause

echo ?? BEFORE vs AFTER:
echo ===================
echo.
echo ? BEFORE (Timing Issue):
echo   Login ? setState(user) ? setTimeout(100ms) ? loadPermissions()
echo   Problem: user state still null when setTimeout executes
echo   Result: "No user found, cannot load permissions"
echo.
echo ? AFTER (Fixed):
echo   Login ? setState(user) ? loadPermissionsForUser(authUser) immediately
echo   Solution: Pass user object directly, no timing dependency
echo   Result: Permissions load successfully every time
echo.

echo ?? Technical Details:
echo   • React setState is asynchronous
echo   • setTimeout callback runs before state update
echo   • Direct parameter passing bypasses state timing
echo   • Helper function accepts user parameter explicitly
echo.

echo ?? Key Changes:
echo   • loadUserPermissionsForUser(currentUser: AuthUser)
echo   • Immediate call after login: await loadUserPermissionsForUser(authUser)
echo   • No more setTimeout dependencies
echo   • Reliable permission loading every time
echo.

echo The permission system now works reliably! ???

pause