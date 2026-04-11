@echo off
cls
echo ?? DEBUGGING PERMISSION ACCESS DENIED ISSUE
echo =============================================

echo ?? This will help identify why PermissionGuard denies access
echo   even when user should have permissions
echo.

echo Applied Fixes:
echo   ? Enhanced AuthContext with detailed logging
echo   ? Improved hasPermission function with step-by-step debug
echo   ? Added force reload of permissions after login
echo   ? Better error handling and user state checks
echo.

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting backend with debug logging...
start "Backend - Permission Debug" cmd /k "echo ??? BACKEND - Permission Access Debug && echo ============================== && echo. && echo ?? Enhanced permission logging enabled && echo ?? Watch for detailed permission queries && echo ??? Pay attention to SecurityTest logs && echo. && dotnet run"

echo ? Waiting for backend to start...
timeout /t 8

echo ?? Starting frontend with debugging...
cd ClientApp

start "Frontend - Permission Debug" cmd /k "echo ?? FRONTEND - Permission Access Debug && echo ================================ && echo. && echo ?? Permission debugging enhanced && echo ?? Check browser console for detailed logs && echo ?? Expected logs sequence: && echo   1. Loading user permissions... && echo   2. Permissions API response && echo   3. Setting permissions: [array] && echo   4. hasPermission checks with details && echo. && npm run dev"

echo.
echo ?? DEBUGGING PERMISSION ACCESS ISSUE
echo ====================================
echo.
echo ?? Step-by-Step Debugging Instructions:
echo.
echo ?? Step 1: Login and Watch Console
echo   • Go to: http://localhost:5173
echo   • Open DevTools (F12) ? Console tab
echo   • Login with your credentials
echo   • Watch for these logs in order:
echo     1. "Loading user permissions..."
echo     2. "Permissions API response: {data}"
echo     3. "Setting permissions: [array]"
echo     4. "=== hasPermission Check ===" when accessing Dashboard
echo.

echo ?? Step 2: Check Permission Loading
echo   • Look for "Permissions API response"
echo   • Should contain data array with permissions
echo   • If empty or error - API issue
echo   • If successful - check next step
echo.

echo ??? Step 3: Check hasPermission Function
echo   • Look for "=== hasPermission Check ==="
echo   • Check "Checking: Dashboard.view"
echo   • Verify "User:" shows correct user data
echo   • Check "Permissions state:" shows loaded permissions
echo   • Look for "Found permission:" for Dashboard
echo.

echo ??? Step 4: Check Backend Logs
echo   • Backend console should show:
echo     - "Getting permissions for user ID: X"
echo     - "User has roles: [roles]"
echo     - "Found X permissions"
echo     - Permission details for Dashboard
echo.

pause

echo ?? COMMON ISSUES AND SOLUTIONS:
echo ================================
echo.
echo ? Issue 1: "No permissions received from API"
echo   ?? Solution: Check API endpoint, token, and backend logs
echo   ?? Verify: Network tab shows successful API call
echo.
echo ? Issue 2: "Permissions state: []" (empty array)
echo   ?? Solution: API response format issue
echo   ?? Check: Backend returns data in correct format
echo.
echo ? Issue 3: "No permission found for screen 'Dashboard'"
echo   ?? Solution: Screen name mismatch
echo   ?? Check: Available screens vs requested screen name
echo.
echo ? Issue 4: "Found permission" but still denied
echo   ?? Solution: Permission property is false
echo   ?? Check: allowView property in permission object
echo.
echo ? Issue 5: User not loading properly
echo   ?? Solution: AuthContext initialization issue
echo   ?? Check: User state and roles in console logs
echo.

pause

echo ?? DEBUGGING CHECKLIST:
echo =======================
echo.
echo ? Check browser console logs for:
echo   • Login success
echo   • Permission API call
echo   • Permission data loading
echo   • hasPermission detailed checks
echo   • Error messages
echo.
echo ? Check Network tab for:
echo   • GET /api/securitytest/my-permissions
echo   • Status 200 response
echo   • Response data format
echo.
echo ? Check backend console for:
echo   • User authentication
echo   • Permission queries
echo   • Database results
echo.
echo Follow the logs and identify where the permission check fails! ???

pause