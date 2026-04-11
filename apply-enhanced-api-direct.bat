@echo off
cls
echo ??? APPLYING ENHANCED PERMISSION API DIRECTLY
echo ===========================================

echo ?? ENHANCEMENT SUMMARY:
echo   ? Super Admin gets full permissions automatically
echo   ? Regular users get permissions from database  
echo   ? Enhanced logging and error handling
echo   ? Better response format with additional fields
echo   ? Improved debugging capabilities
echo.

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ?? Step 1: Creating backup...
copy Controllers\SecurityTestController.cs Controllers\SecurityTestController-Backup.cs
echo ? Backup created: SecurityTestController-Backup.cs

echo ?? Step 2: Applying enhanced version...
copy Controllers\SecurityTestController-Enhanced.cs Controllers\SecurityTestController.cs
echo ? Enhanced version applied

echo ?? Step 3: Building project...
dotnet build
if %ERRORLEVEL% NEQ 0 (
    echo ? Build failed - restoring backup
    copy Controllers\SecurityTestController-Backup.cs Controllers\SecurityTestController.cs
    pause
    exit /b 1
)
echo ? Build successful with enhanced API

echo ??? Starting backend with enhanced permissions API...
start "Backend - Enhanced Permissions" cmd /k "echo ??? BACKEND - Enhanced Permission API && echo ============================= && echo. && echo ? SecurityTestController enhanced successfully && echo ??? Super Admin: Auto-granted full permissions && echo ?? Regular users: Database-based permissions && echo ?? Enhanced logging and debugging && echo ?? Test: https://localhost:44385/api/security-test/my-permissions && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 10

echo ?? Testing enhanced API endpoint...
curl -k "https://localhost:44385/api/security-test/public"
echo.

echo ?? Starting frontend for enhanced permission testing...
cd ClientApp

start "Frontend - Enhanced Test" cmd /k "echo ?? FRONTEND - Enhanced Permission Testing && echo =================================== && echo. && echo ?? COMPREHENSIVE ROLE TESTING: && echo. && echo ?? Super Admin Test: && echo   • Should get ALL permissions automatically && echo   • No database queries needed && echo   • Full access to all screens && echo. && echo ?? Regular User Test (Viewer): && echo   • Login: haya1.alzeer1992@gmail.com / password123 && echo   • Should get permissions from database && echo   • Limited access based on role && echo. && echo ?? Enhanced Response Format: && echo   • isSuperAdmin flag && echo   • totalPermissions count && echo   • timestamp field && echo   • Better error messages && echo. && npm run dev"

echo.
echo ?? ENHANCED PERMISSION SYSTEM READY!
echo ===================================
echo.

echo ?? EXPECTED IMPROVEMENTS:
echo.
echo ?? Super Admin Benefits:
echo   • Instant access - no database lookup
echo   • All 13 screens with full permissions
echo   • Consistent behavior across sessions
echo.
echo ?? Regular User Benefits:
echo   • Role-based permissions from database
echo   • Graceful handling of empty permissions
echo   • Better error reporting for missing data
echo.
echo ?? Developer Benefits:
echo   • Detailed console logging
echo   • Step-by-step permission resolution
echo   • Enhanced debugging information
echo   • Better error messages and stack traces
echo.

pause

echo ?? TESTING CHECKLIST:
echo ====================
echo.
echo ? Test 1: Super Admin Login
echo   1. Login as Super Admin
echo   2. Check console: "Super Admin detected - granting full permissions"
echo   3. Response should have isSuperAdmin: true
echo   4. Should see 13 screens with full permissions
echo   5. All menu items should be visible
echo.
echo ? Test 2: Viewer Role Login
echo   1. Login as: haya1.alzeer1992@gmail.com / password123
echo   2. Check console: "Regular user - fetching permissions from database"
echo   3. Response should have isSuperAdmin: false
echo   4. Should get role-appropriate permissions from DB
echo   5. Limited menu items based on permissions
echo.
echo ? Test 3: API Response Format
echo   1. Check Network tab after login
echo   2. GET /api/security-test/my-permissions response should include:
echo      - success: true
echo      - data: [permissions array]
echo      - userId: number
echo      - email: string  
echo      - roles: [array of role names]
echo      - isSuperAdmin: boolean
echo      - totalPermissions: number
echo      - timestamp: datetime
echo.

echo The enhanced permission system should now work perfectly for all roles! ????

pause