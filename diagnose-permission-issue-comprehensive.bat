@echo off
cls
echo ?? DIAGNOSING PERMISSION SYSTEM - COMPREHENSIVE CHECK
echo ====================================================

echo ?? This script will check:
echo   1. User database records
echo   2. User-Role relationships
echo   3. Role-Permission relationships
echo   4. API responses
echo   5. Frontend behavior
echo.

echo ?? Starting diagnosis...

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ?? Step 1: Starting backend server...
start "Backend Server" cmd /k "echo ??? BACKEND SERVER - Diagnosis Mode && echo ================================ && echo. && echo ?? Enhanced logging enabled && echo ?? Check console for detailed logs && echo ?? API URL: https://localhost:44385 && echo. && dotnet run"

echo ? Waiting for backend to start...
timeout /t 10

echo ?? Step 2: Testing API endpoints...

echo.
echo ?? Testing my-permissions API for user salem...
echo ================================================

curl -X GET "https://localhost:44385/api/securitytest/my-permissions" ^
  -H "accept: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  --insecure

echo.
echo ?? Step 3: Starting frontend with debug mode...

cd ClientApp

start "Frontend - Debug Mode" cmd /k "echo ?? FRONTEND - Debug Mode && echo ======================= && echo. && echo ?? Enhanced console logging enabled && echo ?? Check browser console for logs && echo ?? Frontend URL: http://localhost:5173 && echo. && echo ?? Test Instructions: && echo   1. Login as salem && echo   2. Open browser DevTools (F12) && echo   3. Go to Console tab && echo   4. Watch for permission logs && echo. && npm run dev"

echo.
echo ?? DIAGNOSIS TOOLS ARE READY!
echo =============================
echo.
echo ?? How to diagnose the permission issue:
echo.
echo ?? Step 1: Check Backend Logs
echo   • Look at the backend console window
echo   • Login as salem user
echo   • Watch for these logs:
echo     - ?? "Getting permissions for user ID: X"
echo     - ?? "User found: salem@example.com, Roles: X"
echo     - ?? "User role: Viewer (ID: X)"
echo     - ??? "Found X permissions"
echo     - ?? Permission details for each screen
echo.

echo ?? Step 2: Check Frontend Console
echo   • Open browser DevTools (F12)
echo   • Go to Console tab
echo   • Login as salem
echo   • Watch for these logs:
echo     - ?? "Loading user permissions..."
echo     - ??? "Permissions response: [data]"
echo     - ?? Individual permission details
echo     - ? "No permissions received from API" (if issue exists)
echo.

echo ?? Step 3: Check API Response
echo   • Open Network tab in DevTools
echo   • Login as salem
echo   • Look for GET request to: /api/securitytest/my-permissions
echo   • Check if response contains data or is empty
echo.

pause

echo ?? COMMON ISSUES AND SOLUTIONS:
echo =================================
echo.
echo ? Issue 1: "No permissions received from API"
echo   ?? Solution: Check if user salem exists in SecurityUsers table
echo   ?? Solution: Check if salem is assigned to Viewer role
echo   ?? Solution: Check if Viewer role has permissions
echo.

echo ? Issue 2: "User not found" in backend logs
echo   ?? Solution: Check JWT token contains correct userId claim
echo   ?? Solution: Verify user salem exists with correct ID
echo.

echo ? Issue 3: "Found 0 permissions" in backend logs
echo   ?? Solution: Check Permissions table has records for Viewer role
echo   ?? Solution: Verify UserRoles table links salem to Viewer role
echo.

echo ?? Database Check Commands:
echo   SELECT * FROM SecurityUsers WHERE Email = 'salem@example.com';
echo   SELECT * FROM UserRoles WHERE UserId = (SELECT Id FROM SecurityUsers WHERE Email = 'salem@example.com');
echo   SELECT * FROM Permissions WHERE RoleID IN (SELECT RoleId FROM UserRoles WHERE UserId = ...);
echo.

echo ?? Quick Fixes:
echo   • If user doesn't exist: Use User Management to create salem user
echo   • If user has no role: Assign Viewer role via User Management
echo   • If role has no permissions: Use Role Permissions Management to set them
echo.

echo The diagnostic tools are running. Check the logs! ???

pause