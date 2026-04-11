@echo off
cls
echo ?? FINAL DIAGNOSIS: SUPER ADMIN WORKS, OTHERS FAIL
echo =================================================

echo ?? CONFIRMED ISSUE:
echo   ? Super Admin: admin@assets.ps - Works (has bypass)
echo   ? All other roles: Get "?? permissions" 
echo   ? Permissions state: [] (empty array)
echo   ? API not returning permission data
echo.

echo ?? ROOT CAUSE ANALYSIS:
echo   • Super Admin works because: if (isSuperAdmin) return true;
echo   • Other roles need database permissions, but API fails
echo   • API call likely returning HTML instead of JSON
echo   • Program.cs middleware order may still be wrong
echo.

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ?? Step 1: Testing API endpoint directly...
echo.
echo Testing: https://localhost:44385/api/security-test/public
curl -k -s "https://localhost:44385/api/security-test/public"
echo.

echo ?? If above returned HTML: Middleware order still wrong
echo ?? If above returned JSON: API works, check authenticated endpoint

echo.
echo ?? Step 2: Starting comprehensive test...

echo ??? Starting backend for testing...
start "Backend - Final Test" cmd /k "echo ??? BACKEND - Final Permission Test && echo =============================== && echo. && echo ? Super Admin bypass works && echo ? Other roles need database permissions && echo ?? Check API responses && echo ?? Test: https://localhost:44385/api/security-test/public && echo. && dotnet run"

echo ? Waiting for backend...
timeout /t 10

echo ?? Starting frontend for role testing...
cd ClientApp

start "Frontend - Role Test" cmd /k "echo ?? FRONTEND - Role Permission Test && echo ============================ && echo. && echo ?? COMPREHENSIVE ROLE TESTING: && echo. && echo ? Super Admin Test: && echo   • Login as: admin@assets.ps && echo   • Should see ALL menus (bypass active) && echo. && echo ? Other Roles Test: && echo   • Login as: haya1.alzeer1992@gmail.com / password123 && echo   • Should load permissions from DB && echo   • Currently fails with empty permissions && echo. && echo ?? Check Network tab for API responses && echo. && npm run dev"

echo.
echo ?? COMPREHENSIVE ROLE TESTING READY!
echo ===================================
echo.

echo ?? TEST PLAN:
echo ============
echo.
echo ?? Test 1: Super Admin (Should Work)
echo   1. Go to: http://localhost:5173
echo   2. Login as: admin@assets.ps / [password]
echo   3. Should see ALL menu items
echo   4. Browser console: "Super Admin access granted"
echo   5. No API calls needed (bypass active)
echo.
echo ?? Test 2: Regular User (Currently Fails)  
echo   1. Logout and login as: haya1.alzeer1992@gmail.com / password123
echo   2. Browser console should show:
echo      - "Loading permissions..."
echo      - "Permissions API response: ..." 
echo      - "Setting permissions: [data]"
echo   3. Currently shows: "Permissions state: []" (empty)
echo.
echo ?? Test 3: API Response Check
echo   1. Open Network tab in browser
echo   2. Login as regular user
echo   3. Look for: GET /api/security-test/my-permissions
echo   4. Response should be JSON with permission data
echo   5. Currently may be HTML or empty
echo.

pause

echo ?? DIAGNOSIS RESULTS:
echo ====================
echo.
echo ?? If API returns HTML:
echo   • Middleware order still wrong in Program.cs
echo   • SPA fallback intercepting API calls
echo   • Need to fix MapControllers vs MapFallbackToFile order
echo.
echo ?? If API returns JSON but empty:
echo   • Database permissions not set for non-Super Admin users
echo   • Check SecurityUsers, UserRoles, Permissions tables
echo   • Verify user ID 3 has role assignments
echo.
echo ?? If API returns 404/500:
echo   • SecurityTestController routing issue
echo   • Authentication/Authorization problems
echo   • JWT token validation failing
echo.

echo ?? QUICK FIXES TO TRY:
echo ======================
echo.
echo ?? Fix 1: Manual Program.cs Check
echo   • Ensure app.MapControllers() comes BEFORE app.MapFallbackToFile()
echo   • Current order in lines 270-271 looks correct
echo.
echo ?? Fix 2: Database Check
echo   • Verify user haya1.alzeer1992@gmail.com has UserRoles entries
echo   • Verify Viewer role has Permissions entries  
echo   • Check foreign key relationships
echo.
echo ?? Fix 3: API Route Test
echo   • Test: https://localhost:44385/api/security-test/public
echo   • Should return JSON, not HTML
echo   • If HTML: middleware order issue persists
echo.

echo Run the tests and report back the results! ??

pause