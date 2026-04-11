@echo off
cls
echo ??? APPLYING ENHANCED PERMISSION API
echo ==================================

echo ?? ENHANCEMENT FEATURES:
echo   ? Super Admin gets full permissions automatically
echo   ? Regular users get permissions from database
echo   ? Enhanced error handling and logging
echo   ? Better debugging information
echo   ? Proper role-based permission loading
echo.

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ?? Step 1: Backing up original SecurityTestController...
copy Controllers\SecurityTestController.cs Controllers\SecurityTestController-Original.cs
echo ? Backup created

echo ?? Step 2: Applying enhanced SecurityTestController...
copy Controllers\SecurityTestController-Enhanced.cs Controllers\SecurityTestController.cs
echo ? Enhanced controller applied

echo ?? Step 3: Cleaning and building...
dotnet clean >nul 2>&1
dotnet build
if %ERRORLEVEL% NEQ 0 (
    echo ? Build failed - restoring original controller
    copy Controllers\SecurityTestController-Original.cs Controllers\SecurityTestController.cs
    pause
    exit /b 1
)
echo ? Build successful with enhanced API

echo ??? Starting backend with enhanced permission API...
start "Backend - Enhanced API" cmd /k "echo ??? BACKEND - Enhanced Permission API && echo ============================== && echo. && echo ? Enhanced SecurityTestController applied && echo ??? Super Admin: Gets full permissions automatically && echo ?? Regular users: Get permissions from database && echo ?? Enhanced logging and error handling && echo ?? Test API: https://localhost:44385/api/security-test/my-permissions && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 10

echo ?? Testing enhanced API...
curl -k "https://localhost:44385/api/security-test/public"
echo.

echo ?? Starting frontend to test enhanced permissions...
cd ClientApp

start "Frontend - Enhanced Permissions" cmd /k "echo ?? FRONTEND - Enhanced Permission System && echo ================================== && echo. && echo ?? COMPREHENSIVE TESTING PLAN: && echo. && echo ?? Super Admin Test: && echo   • Login as Super Admin && echo   • Should get full permissions automatically && echo   • No database lookup needed && echo. && echo ?? Regular User Test: && echo   • Login as: haya1.alzeer1992@gmail.com / password123 && echo   • Should get permissions from database && echo   • Check browser console for detailed logs && echo. && echo ?? Expected improvements: && echo   • Better error handling && echo   • More detailed permission logs && echo   • Proper role-based permission assignment && echo. && npm run dev"

echo.
echo ?? ENHANCED PERMISSION API READY!
echo =================================
echo.
echo ?? TESTING INSTRUCTIONS:
echo.
echo ?? Test 1: Super Admin
echo   1. Login as Super Admin
echo   2. Check browser console logs
echo   3. Should see: "Super Admin detected - granting full permissions"
echo   4. Should have access to all screens
echo.
echo ?? Test 2: Regular Users (e.g., Viewer)
echo   1. Login as: haya1.alzeer1992@gmail.com / password123
echo   2. Check browser console logs
echo   3. Should see: "Regular user - fetching permissions from database"
echo   4. Should see: "Found X permissions in database"
echo   5. Should get role-appropriate permissions
echo.
echo ?? Test 3: API Response Check
echo   1. Open Network tab
echo   2. Login as any user
echo   3. Check GET /api/security-test/my-permissions
echo   4. Response should include:
echo      - success: true
echo      - data: [permissions array]
echo      - isSuperAdmin: true/false
echo      - roles: [user roles]
echo      - totalPermissions: number
echo.

pause

echo ?? ENHANCED API FEATURES:
echo =========================
echo.
echo ??? Super Admin Handling:
echo   • Automatically gets full permissions to all screens
echo   • No database lookup required
echo   • Covers all system screens
echo.
echo ?? Regular User Handling:
echo   • Fetches permissions from database via PermissionService
echo   • Role-based permission assignment
echo   • Handles empty permission cases gracefully
echo.
echo ?? Enhanced Debugging:
echo   • Detailed console logging
echo   • Step-by-step permission loading logs
echo   • Better error messages and stack traces
echo   • Claims inspection for troubleshooting
echo.
echo ?? Improved Response Format:
echo   • Includes isSuperAdmin flag
echo   • Contains user roles information
echo   • Shows total permissions count
echo   • Adds timestamp for debugging
echo.

echo The enhanced permission API should resolve all role-based access issues! ????

pause