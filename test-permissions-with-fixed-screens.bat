@echo off
cls
echo ??? TESTING PERMISSIONS WITH FIXED SCREEN NAMES
echo ===============================================

echo ?? Applied Fixes:
echo   ? Fixed MainLayout to use correct screen names
echo   ? Updated "Disposals" ? "Disposal" to match database
echo   ? Removed "Settings" (not in database)
echo   ? Added detailed logging in SecurityTestController
echo   ? Enhanced PermissionService with debug logs
echo   ? Fixed CurrentUserService with better error handling
echo.

echo ?? Current Database Status:
echo   ?? User: haya1.alzeer1992@gmail.com (ID: 3)
echo   ?? Role: Viewer
echo   ?? Permissions: Dashboard (full), Assets (view), Categories (view), etc.
echo.

echo ?? Starting comprehensive test...

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting backend with enhanced logging...
start "Backend - Enhanced Logging" cmd /k "echo ??? BACKEND - PERMISSIONS DEBUGGING && echo ================================= && echo. && echo ?? Enhanced logging enabled && echo ?? Login as: haya1.alzeer1992@gmail.com && echo ??? Watch console for detailed permission logs && echo ?? Claims, UserId, and permission resolution && echo. && dotnet run"

echo ? Waiting for backend to start...
timeout /t 8

echo ?? Starting frontend...
cd ClientApp

start "Frontend - Permission Test" cmd /k "echo ?? FRONTEND - Permission Testing && echo ============================ && echo. && echo ?? Test Instructions: && echo   1. Go to: http://localhost:5173 && echo   2. Login as: haya1.alzeer1992@gmail.com / password123 && echo   3. Check console for permission logs && echo   4. Should see: Dashboard, Assets, Categories, Departments, etc. && echo   5. Should NOT see: Users, Permissions (no access) && echo. && echo ?? Check browser DevTools Console for detailed logs && echo. && npm run dev"

echo.
echo ?? PERMISSION TESTING READY!
echo ===========================
echo.
echo ?? Test Checklist:
echo.

echo ?? Step 1: Login Test
echo   • Go to: http://localhost:5173
echo   • Login as: haya1.alzeer1992@gmail.com / password123
echo   • Should login successfully
echo.

echo ??? Step 2: Backend Console Check
echo   • Look at backend console window
echo   • Should see detailed logs when logging in:
echo     - "=== Starting GetMyPermissions ==="
echo     - "HttpContext exists: True"
echo     - "User authenticated: True"
echo     - Claims details (email, userId, roles)
echo     - "Getting permissions for user ID: 3"
echo     - Found permissions list with screen names
echo.

echo ?? Step 3: Frontend Console Check
echo   • Open browser DevTools (F12)
echo   • Go to Console tab
echo   • Should see:
echo     - "Loading user permissions..."
echo     - "Permissions response: [array of permissions]"
echo     - "Menu access check" logs for each screen
echo.

echo ?? Step 4: Menu Visibility Test
echo   • Should see in sidebar menu:
echo     ? Dashboard (has full permissions)
echo     ? Assets (has view permission)
echo     ? Categories (has view permission)
echo     ? Departments (has view permission)
echo     ? Employees (has view permission)
echo     ? Warehouses (has view permission)
echo     ? Transfers (has view permission)
echo     ? Maintenance (no permission)
echo     ? Disposal (no permission)
echo     ? Reports (no permission)
echo     ? Users (no permission)
echo     ? Permissions (no permission)
echo.

pause

echo ?? DEBUGGING GUIDE:
echo ==================
echo.
echo ? If user still sees all menus:
echo   1. Check backend console for permission logs
echo   2. Verify API call returns correct data
echo   3. Check browser Network tab for API response
echo   4. Ensure user is logged in with correct email
echo.

echo ? If "No permissions received from API":
echo   1. Check backend console for errors
echo   2. Verify UserId is extracted from JWT correctly
echo   3. Check database relationships (Users ? UserRoles ? Permissions)
echo   4. Verify JWT token contains userId claim
echo.

echo ? If API returns empty permissions:
echo   1. Check UserRoles table for user ID 3
echo   2. Verify Permissions table has records for Viewer role
echo   3. Check database foreign key relationships
echo.

echo ?? Quick Database Verification:
echo   SELECT u.Id, u.Email, r.RoleName 
echo   FROM SecurityUsers u 
echo   JOIN UserRoles ur ON u.Id = ur.UserId 
echo   JOIN Roles r ON ur.RoleId = r.RoleId 
echo   WHERE u.Email = 'haya1.alzeer1992@gmail.com';
echo.

echo The permission system should now work correctly! ????

pause