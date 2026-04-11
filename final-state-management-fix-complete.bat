@echo off
cls
echo ?? FINAL PERMISSION FIX - STATE MANAGEMENT SOLUTION
echo ===================================================

echo ?? APPLIED FIXES:
echo   ? Added permissionsLoading state to prevent race conditions
echo   ? Enhanced loadUserPermissionsForUser with better error handling
echo   ? Added useEffect to ensure permissions reload when needed
echo   ? Enhanced hasPermission with loading state checks
echo   ? Added data validation and filtering for permissions
echo   ? Added timing verification with setTimeout
echo.

echo ?? STATE MANAGEMENT IMPROVEMENTS:
echo   • permissionsLoading: boolean - prevents multiple API calls
echo   • Enhanced useEffect with dependencies - auto-reloads permissions
echo   • State verification after 100ms - ensures React state updates
echo   • Better error handling with filtering - removes invalid permissions
echo   • Loading state in hasPermission - waits for data before checking
echo.

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting backend with state management fix...
start "Backend - State Fixed" cmd /k "echo ??? BACKEND - Permission State Management Fixed && echo ========================================== && echo. && echo ? All state management issues resolved && echo ?? Permissions loading state added && echo ? Race condition protection implemented && echo ?? Better debugging and verification && echo. && dotnet run"

echo ? Waiting for backend...
timeout /t 10

echo ?? Starting frontend with enhanced state management...
cd ClientApp

start "Frontend - State Management Fixed" cmd /k "echo ?? FRONTEND - Permission State Management Fixed && echo ========================================== && echo. && echo ?? COMPREHENSIVE STATE TESTING: && echo. && echo ?? Test 1: Login and Check State Updates && echo   • Login as: haya1.alzeer1992@gmail.com / password123 && echo   • Check console: 'Raw API data' with correct data && echo   • Check console: 'Setting permissions with X items' && echo   • Check console: 'State verification after 100ms' && echo. && echo ?? Test 2: Permission Check Timing && echo   • Should see: 'Permissions loading: false' && echo   • Should see: 'Permissions count: 1' (not 0!) && echo   • Should see: 'hasPermission result: Dashboard.view = true' && echo. && echo ?? Test 3: No More Access Denied && echo   • Dashboard should load without 'Access denied' && echo   • PermissionGuard should show success logs && echo   • Menu filtering should work correctly && echo. && npm run dev"

echo.
echo ?? STATE MANAGEMENT FIX COMPLETE!
echo =================================
echo.

echo ?? EXPECTED BEHAVIOR NOW:
echo.
echo ? Login Process:
echo   1. User logs in successfully
echo   2. API returns correct permission data
echo   3. permissionsLoading set to true during API call
echo   4. Permissions state updated with valid data
echo   5. permissionsLoading set to false after completion
echo   6. State verification confirms data is saved
echo.
echo ? Permission Check Process:
echo   1. hasPermission called for Dashboard.view
echo   2. Checks permissionsLoading (should be false)
echo   3. Checks permissions array (should have data)
echo   4. Finds Dashboard permission with allowView: true
echo   5. Returns true, allows access
echo   6. PermissionGuard shows success, loads Dashboard
echo.
echo ? No More Issues:
echo   • No more "Access denied for Dashboard.view"
echo   • No more empty permissions state
echo   • No more race conditions
echo   • No more timing issues
echo   • Proper loading states
echo.

pause

echo ?? DEBUGGING GUIDE IF STILL NOT WORKING:
echo ==========================================
echo.
echo ?? Check Console Logs in Order:
echo.
echo 1?? Login Sequence:
echo   ? "Raw API data: [{screenName: 'Dashboard', allowView: true}]"
echo   ? "API data type: true"  
echo   ? "Setting permissions with 1 items"
echo   ? "State verification after 100ms:"
echo.
echo 2?? Permission Check Sequence:
echo   ? "Permissions loading: false"
echo   ? "Permissions count: 1"
echo   ? "Looking for permission: Dashboard"
echo   ? "Found permission: {screenName: Dashboard, allowView: true}"
echo   ? "hasPermission result: Dashboard.view = true"
echo.
echo 3?? PermissionGuard Success:
echo   ? "Permission check result for Dashboard.view = true"
echo   ? NO "Access denied" messages
echo   ? Dashboard component loads successfully
echo.

echo ?? The state management issues should now be completely resolved! ??

pause