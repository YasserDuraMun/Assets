@echo off
cls
echo ?? IMMEDIATE MIDDLEWARE ORDER FIX
echo =================================

echo ?? CRITICAL ISSUE IDENTIFIED:
echo   ? app.MapControllers() comes too early
echo   ? app.MapFallbackToFile() intercepts API calls
echo   ? Solution: Reorder middleware for proper API routing
echo.

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ?? Creating backup...
copy Program.cs Program.cs.backup-middleware-fix

echo ?? Creating corrected Program.cs with proper middleware order...

REM Use PowerShell to fix middleware order
powershell -Command "& {
    $content = Get-Content 'Program.cs' -Raw;
    $content = $content -replace 'app\.MapControllers\(\);[\r\n\s]*// Initialize Security Data', '// Initialize Security Data';
    $content = $content -replace 'app\.UseStaticFiles\(\);[\r\n\s]*app\.MapFallbackToFile\(""/index\.html""\);[\r\n\s]*Console\.WriteLine\("".*Static Files.*""\);', 'app.UseStaticFiles();
        Console.WriteLine(""?? Static Files Configured"");
    }

    // Map API Controllers AFTER security data and static files - CRITICAL FOR PERMISSIONS!
    app.MapControllers();
    Console.WriteLine(""?? API Controllers Mapped - Permissions API should work now"");

    // SPA fallback routing - MUST be LAST to avoid intercepting API calls
    if (Directory.Exists(webRoot))
    {
        app.MapFallbackToFile(""/index.html"");
        Console.WriteLine(""?? SPA Fallback Configured (API routes protected)"");';
    Set-Content 'Program.cs' $content -Encoding UTF8
}"

echo ? Program.cs middleware order fixed!

echo ?? Testing the fix...

echo ??? Starting backend with corrected middleware order...
start "Backend - Middleware Fixed" cmd /k "echo ??? BACKEND - Middleware Order Fixed && echo ================================ && echo. && echo ? MapControllers now comes AFTER static files && echo ? MapControllers now comes BEFORE SPA fallback && echo ?? API routes should work correctly && echo ?? Test: https://localhost:44385/api/security-test/public && echo. && dotnet run"

echo ? Waiting for backend to start...
timeout /t 10

echo ?? Testing API endpoint...
curl -k "https://localhost:44385/api/security-test/public"
echo.

echo ?? Starting frontend...
cd ClientApp

start "Frontend - Middleware Fixed" cmd /k "echo ?? FRONTEND - Middleware Fixed && echo ========================== && echo. && echo ?? API Base: https://localhost:44385/api && echo ?? Login: haya1.alzeer1992@gmail.com / password123 && echo ??? Permissions should load correctly now && echo ?? Check Network tab for JSON responses && echo. && npm run dev"

echo.
echo ?? MIDDLEWARE ORDER FIXED!
echo ==========================
echo.
echo ?? TEST RESULTS EXPECTED:
echo   1. ? API endpoint returns JSON (not HTML)
echo   2. ? Login works without 404 errors
echo   3. ? Permissions load correctly after login
echo   4. ? Menu shows only permitted items
echo   5. ? No more "Access denied" for valid permissions
echo.

pause

echo ?? WHAT WAS FIXED:
echo ==================
echo.
echo ? BEFORE (Broken Middleware Order):
echo   1. app.UseAuthentication()
echo   2. app.UseAuthorization()
echo   3. app.MapControllers() ? Too early!
echo   4. // Security Data Initialization
echo   5. app.UseStaticFiles()
echo   6. app.MapFallbackToFile() ? Intercepts API!
echo.
echo ? AFTER (Correct Middleware Order):
echo   1. app.UseAuthentication()
echo   2. app.UseAuthorization()
echo   3. // Security Data Initialization
echo   4. app.UseStaticFiles()
echo   5. app.MapControllers() ? Proper position!
echo   6. app.MapFallbackToFile() ? Only for non-API routes
echo.

echo This ensures API routes are handled before SPA fallback! ??

pause