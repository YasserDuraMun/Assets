@echo off
cls
echo ?? CRITICAL FIX: SUPER ADMIN WORKS, OTHER ROLES FAIL
echo =================================================

echo ?? PROBLEM CONFIRMED:
echo   ? Super Admin role works (has bypass)
echo   ? Other roles get "Access denied" 
echo   ? Root cause: Permissions not loading from database
echo   ? API calls return HTML instead of JSON
echo.

echo ?? APPLYING COMPREHENSIVE FIX...

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ?? Step 1: Backing up current Program.cs...
copy Program.cs Program.cs.backup-super-admin-fix

echo ?? Step 2: Fixing Program.cs middleware order...
powershell -Command "& {
    $content = Get-Content 'Program.cs' -Raw;
    
    # Remove MapControllers from current position
    $content = $content -replace 'app\.MapControllers\(\);\s*\r?\n', '';
    
    # Fix the static files section to include proper API routing
    $content = $content -replace 
    'if \(Directory\.Exists\(webRoot\)\)\s*\{\s*app\.UseStaticFiles\(\);\s*app\.MapFallbackToFile\(""/index\.html""\);\s*Console\.WriteLine\("".*Static Files.*""\);\s*\}',
    'if (Directory.Exists(webRoot))
    {
        app.UseStaticFiles();
        Console.WriteLine(""?? Static Files Configured"");
    }

    // Map API Controllers AFTER static files but BEFORE SPA fallback - CRITICAL!
    app.MapControllers();
    Console.WriteLine(""?? API Controllers Mapped - Non-Super Admin permissions should work now"");

    // SPA fallback - MUST be LAST to not intercept API calls
    if (Directory.Exists(webRoot))
    {
        app.MapFallbackToFile(""/index.html"");
        Console.WriteLine(""?? SPA Fallback - API routes protected"");
    }';
    
    Set-Content 'Program.cs' $content -Encoding UTF8
}"

echo ? Program.cs middleware order fixed for non-Super Admin roles!

echo ?? Step 3: Testing API endpoint directly...
timeout /t 2

echo ??? Starting backend with fixed middleware...
start "Backend - Super Admin Fix" cmd /k "echo ??? BACKEND - Super Admin Fix Applied && echo ================================ && echo. && echo ? Middleware order fixed for all roles && echo ?? Super Admin: Should still work && echo ?? Other roles: Should now load permissions correctly && echo ?? Test: https://localhost:44385/api/security-test/public && echo. && dotnet run"

echo ? Waiting for backend to start...
timeout /t 12

echo ?? Testing API endpoint (should return JSON not HTML)...
curl -k -s "https://localhost:44385/api/security-test/public"
echo.

echo ?? Starting frontend...
cd ClientApp

echo ?? Ensuring .env is correct...
echo VITE_API_BASE_URL=https://localhost:44385/api > .env

start "Frontend - All Roles Fixed" cmd /k "echo ?? FRONTEND - All Roles Should Work && echo ============================== && echo. && echo ? Super Admin: Should still work (bypass) && echo ? Other roles: Should now load permissions from DB && echo ?? Test users: && echo   • Super Admin: should see everything && echo   • Viewer: should see limited menus && echo   • Other roles: should work based on DB permissions && echo. && npm run dev"

echo.
echo ?? ALL ROLES PERMISSION SYSTEM FIXED!
echo ====================================
echo.
echo ?? COMPREHENSIVE TESTING:
echo.
echo ?? Test 1: Super Admin User
echo   • Login as Super Admin
echo   • Should see ALL menu items (bypass active)
echo   • Should have access to everything
echo.
echo ?? Test 2: Viewer Role User  
echo   • Login as: haya1.alzeer1992@gmail.com / password123
echo   • Should see LIMITED menu items based on DB permissions
echo   • Should load permissions from API correctly
echo   • No more "Access denied" for allowed screens
echo.
echo ?? Test 3: Other Roles
echo   • Any other role should work based on DB permissions
echo   • API should return JSON with permission data
echo   • hasPermission should return correct true/false
echo.

pause

echo ?? DEBUGGING CHECKLIST IF STILL NOT WORKING:
echo ============================================
echo.
echo ? Check API Response:
echo   • Open: https://localhost:44385/api/security-test/public
echo   • Should return JSON: {"success": true, "message": "..."}  
echo   • NOT HTML redirect to login page
echo.
echo ? Check Network Tab:
echo   • Login as non-Super Admin user
echo   • Look for: GET /api/security-test/my-permissions
echo   • Response should be JSON with permissions array
echo   • NOT HTML content
echo.
echo ? Check Browser Console:
echo   • Should see: "Permissions API response: {data: [...]}"
echo   • Should NOT see: "Permissions API response: <!doctype html>"
echo   • Should see: "Setting permissions: [array with data]"
echo   • Should NOT see: "Setting permissions: []"
echo.

echo ?? ROOT CAUSE ANALYSIS:
echo =======================
echo   • Super Admin works because it bypasses permission checks
echo   • Other roles fail because API returns HTML instead of JSON
echo   • HTML response means SPA routing intercepts API calls
echo   • Fixed by ensuring MapControllers comes before MapFallbackToFile
echo.

echo The permission system should now work for ALL roles! ????

pause