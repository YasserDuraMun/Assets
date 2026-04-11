@echo off
cls
echo ?? PERMISSION DEBUG - DATABASE VS API INVESTIGATION
echo =================================================

echo ?? CONFIRMED STATUS:
echo   ? Database permissions exist: Viewer ? Dashboard (AllowView=1)
echo   ? PermissionService code looks correct
echo   ? API returning empty permissions
echo   ?? Solution: Add debug logging to find the disconnect

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ?? Adding debug logging to backend...
echo This will show exactly what's happening in the permission query

echo ??? Starting backend with enhanced debug logging...
start "Backend - Permission Debug" cmd /k "echo ??? BACKEND - Permission Service Debug && echo ============================== && echo. && echo ?? Database shows: Viewer has Dashboard permission && echo ?? API returns: Empty permissions array && echo ?? Debug logs will show where the disconnect is && echo ?? Check console for detailed permission query logs && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 10

echo ?? Starting frontend for debugging...
cd ClientApp

start "Frontend - Debug Mode" cmd /k "echo ?? FRONTEND - Permission Debug Mode && echo ============================= && echo. && echo ?? DEBUG TEST SEQUENCE: && echo. && echo ?? Step 1: Login as Viewer user && echo   • Email: haya1.alzeer1992@gmail.com && echo   • Password: password123 && echo. && echo ?? Step 2: Check Backend Console Logs && echo   • Should see: 'Getting permissions for user ID: X' && echo   • Should see: 'User found: email, Roles: 1' && echo   • Should see: 'User role: Viewer (ID: 5)' && echo   • Should see: 'Looking for permissions in roles: [5]' && echo   • Should see: 'Found X permissions' && echo   • Should see: 'Dashboard: View=true, Insert=false...' && echo. && echo ?? Step 3: Check Frontend Network Tab && echo   • API response should match backend logs && echo   • If backend shows permissions but API returns empty && echo   • Then there's a serialization/controller issue && echo. && npm run dev"

echo.
echo ?? PERMISSION DEBUGGING READY!
echo ===============================
echo.

echo ?? CRITICAL DEBUGGING POINTS:
echo.
echo 1?? Backend PermissionService Logs:
echo   ? Check: "Getting permissions for user ID: 3"
echo   ? Check: "User found: haya1.alzeer1992@gmail.com, Roles: 1"  
echo   ? Check: "User role: Viewer (ID: 5)"
echo   ? Check: "Looking for permissions in roles: [5]"
echo   ? Check: "Found 10 permissions" (should be > 0)
echo   ? Check: "Dashboard: View=True, Insert=False..."
echo.
echo 2?? If Permissions Found in Service but API Returns Empty:
echo   • Issue in SecurityTestController response mapping
echo   • Check permissionsList transformation
echo   • Check response serialization
echo.
echo 3?? If PermissionService Returns 0 Permissions:
echo   • Issue in EF Core query
echo   • Check table joins and foreign keys
echo   • Check RoleID vs RoleId property naming
echo.
echo 4?? If User Not Found in Service:
echo   • Issue in CurrentUserService.UserId
echo   • Check JWT token claims
echo   • Check user ID extraction from token
echo.

pause

echo ?? EXPECTED DEBUG FLOW:
echo =======================
echo.
echo ? Successful Flow Should Show:
echo   1. "Getting permissions for user ID: 3"
echo   2. "User found: haya1.alzeer1992@gmail.com, Roles: 1"
echo   3. "User role: Viewer (ID: 5)"  
echo   4. "Looking for permissions in roles: [5]"
echo   5. "Found 10 permissions" (or similar count)
echo   6. "Dashboard: View=True, Insert=False, Update=False, Delete=False"
echo   7. API response contains Dashboard permission
echo   8. Frontend receives and processes permissions correctly
echo.

echo ? If Any Step Fails:
echo   • That's where the issue is located
echo   • We can focus on fixing that specific component
echo   • Database is confirmed working, so it's API/EF layer

echo Run the test and check backend console logs closely! ??

pause