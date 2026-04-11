@echo off
cls
echo ?? ENHANCED PERMISSION LOADING DEBUG
echo ===================================

echo ? Applied Enhancements:
echo   ?? Enhanced try/catch in login function with detailed logging
echo   ?? Improved initializeAuth to load permissions on page refresh
echo   ?? Step-by-step logging in loadUserPermissionsForUser
echo   ?? Better error handling with stack traces
echo   ?? Verification that function calls actually execute
echo.

echo ?? Now we'll see exactly where the permission loading fails
echo.

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting backend server...
start "Backend - Enhanced Debug" cmd /k "echo ??? BACKEND - Enhanced Permission Debug && echo ================================= && echo. && echo ?? Enhanced error handling enabled && echo ?? Watch for detailed API logs && echo ??? Check SecurityTest controller logs && echo. && dotnet run"

echo ? Waiting for backend to start...
timeout /t 8

echo ?? Starting frontend with enhanced debugging...
cd ClientApp

start "Frontend - Enhanced Debug" cmd /k "echo ?? FRONTEND - Enhanced Permission Debug && echo ================================== && echo. && echo ?? Enhanced error handling and logging applied && echo ?? Expected detailed log sequence: && echo   1. 'Loading permissions immediately after login...' && echo   2. 'AuthUser object for permissions: {object}' && echo   3. '=== Starting loadUserPermissionsForUser ===' && echo   4. 'Calling permissionsAPI.getMyPermissions()...' && echo   5. 'Permissions API response: {response}' && echo   6. 'Setting permissions: [array]' && echo   7. 'Permission 1: Dashboard - View=true...' && echo. && npm run dev"

echo.
echo ?? DETAILED DEBUGGING INSTRUCTIONS
echo ==================================
echo.
echo ?? What to Look For:
echo.
echo ?? Step 1: Login Process
echo   • Login as: haya1.alzeer1992@gmail.com / password123
echo   • Open DevTools (F12) ? Console
echo   • Should see complete sequence of logs
echo.
echo ? Expected Success Sequence:
echo   1. ? "Login successful, saving token"
echo   2. ? "User set in context: salem"
echo   3. ? "Loading permissions immediately after login..."
echo   4. ? "AuthUser object for permissions: {object}"
echo   5. ? "=== Starting loadUserPermissionsForUser ==="
echo   6. ? "User provided: {user object}"
echo   7. ? "Calling permissionsAPI.getMyPermissions()..."
echo   8. ? "Permissions API response: {data}"
echo   9. ? "Setting permissions: [array with data]"
echo   10. ? "Permission X: Dashboard - View=true..."
echo   11. ? "Permissions state updated successfully"
echo   12. ? "hasPermission: Dashboard.view = true"
echo.

echo ? Failure Scenarios to Watch For:
echo.
echo ?? Scenario 1: Function Not Called
echo   • Missing: "Loading permissions immediately after login..."
echo   • Issue: Login function not executing permission loading
echo   • Solution: Check login function implementation
echo.
echo ?? Scenario 2: API Call Fails
echo   • Missing: "Permissions API response"
echo   • Check: Network tab for failed API call
echo   • Look for: 401/403/500 errors
echo.
echo ?? Scenario 3: Empty API Response
echo   • See: "Permissions API response: {success: true, data: []}"
echo   • Issue: Backend returns empty permissions
echo   • Check: Backend console for database queries
echo.
echo ?? Scenario 4: API Format Issue
echo   • See: "Invalid permissions response" or "No data"
echo   • Issue: Response format mismatch
echo   • Check: API response structure
echo.

pause

echo ?? STEP-BY-STEP TROUBLESHOOTING:
echo =================================
echo.
echo ?? Phase 1: Verify Login Function Execution
echo   • Look for "Loading permissions immediately after login..."
echo   • If missing: Login function not calling permission loading
echo   • If present: Function is being called, continue to Phase 2
echo.
echo ?? Phase 2: Check API Call
echo   • Look for "Calling permissionsAPI.getMyPermissions()..."
echo   • Check Network tab for GET /api/securitytest/my-permissions
echo   • Verify response status and data
echo.
echo ?? Phase 3: Verify Response Processing
echo   • Look for "Permissions API response: {data}"
echo   • Check if data array has permissions
echo   • Look for individual permission logs
echo.
echo ?? Phase 4: Check State Update
echo   • Look for "Permissions state updated successfully"
echo   • Then check "Permissions count: X" in hasPermission logs
echo   • Should be greater than 0
echo.
echo ??? Backend Console Checks:
echo   • "Getting permissions for user ID: 3"
echo   • "User has roles: [Viewer]"
echo   • "Found X permissions"
echo   • Permission details for each screen
echo.

echo Now run the test and follow the diagnostic steps! ???

pause