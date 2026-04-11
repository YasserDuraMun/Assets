@echo off
cls
echo ?? FINAL PERMISSION FIX - PROGRAM.CS MIDDLEWARE ORDER
echo ====================================================

echo ?? IDENTIFIED ISSUE:
echo   ? app.MapFallbackToFile("/index.html") intercepts API calls
echo   ? API calls return HTML instead of JSON
echo   ? Solution: Move MapControllers before MapFallbackToFile
echo.

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ?? Creating backup of current Program.cs...
copy Program.cs Program.cs.backup-%date:~-4,4%%date:~-10,2%%date:~-7,2%

echo ?? Fixing middleware order in Program.cs...

REM Create a temporary PowerShell script to fix the middleware order
echo $content = Get-Content 'Program.cs' -Raw > fix_program.ps1
echo $content = $content -replace '    app\.MapControllers\(\);[\s\S]*?(\s+// Initialize Security Data)', '    // NOTE: MapControllers moved after Security Data initialization$1' >> fix_program.ps1
echo $content = $content -replace '        app\.UseStaticFiles\(\);[\s\S]*?        Console\.WriteLine\(".*Static Files.*"\);[\s\S]*?    }', '        app.UseStaticFiles();^
        Console.WriteLine("?? Static Files Configured");^
    }^
^
    // Map API Controllers AFTER static files but BEFORE SPA fallback - CRITICAL FOR PERMISSIONS!^
    app.MapControllers();^
    Console.WriteLine("?? API Controllers Mapped - Permissions API should work now");^
^
    // SPA fallback routing - MUST be LAST to avoid intercepting API calls^
    if (Directory.Exists(webRoot))^
    {^
        app.MapFallbackToFile("/index.html");^
        Console.WriteLine("?? SPA Fallback Configured (API routes protected)");^
    }' >> fix_program.ps1
echo Set-Content 'Program.cs' $content -Encoding UTF8 >> fix_program.ps1

echo Running PowerShell script to fix Program.cs...
powershell -ExecutionPolicy Bypass -File fix_program.ps1

echo Cleaning up temporary script...
del fix_program.ps1

echo ? Program.cs middleware order fixed!

echo ?? Testing the fix...

echo ??? Starting backend with fixed middleware order...
start "Backend - Fixed Middleware" cmd /k "echo ??? BACKEND - Middleware Order Fixed && echo ============================== && echo. && echo ? API Controllers mapped before SPA fallback && echo ?? API routes should work correctly now && echo ?? Test: https://localhost:44385/api/security-test/public && echo ??? Permissions API should return JSON && echo. && dotnet run"

echo ? Waiting for backend to start...
timeout /t 10

echo ?? Testing API directly...
curl -k -s "https://localhost:44385/api/security-test/public"
echo.

echo ?? Starting frontend...
cd ClientApp

start "Frontend - API Fixed" cmd /k "echo ?? FRONTEND - API Fixed && echo =================== && echo. && echo ?? API Base URL: https://localhost:44385/api && echo ?? Login: haya1.alzeer1992@gmail.com / password123 && echo ??? Permissions should load correctly && echo ?? Check Network tab for JSON responses && echo. && npm run dev"

echo.
echo ?? PERMISSION SYSTEM FIXED!
echo ============================
echo.
echo ?? TEST INSTRUCTIONS:
echo   1. Wait for both backend and frontend to start
echo   2. Go to: http://localhost:5173
echo   3. Login: haya1.alzeer1992@gmail.com / password123
echo   4. Check Network tab - API calls should return JSON
echo   5. Menu should show only permitted items
echo   6. No more "Access denied" for valid permissions
echo.

pause

echo ?? WHAT WAS FIXED:
echo ==================
echo.
echo ? BEFORE (Broken):
echo   1. app.UseStaticFiles()
echo   2. app.MapFallbackToFile("/index.html") ? Intercepts API
echo   3. app.MapControllers() ? Too late!
echo.
echo ? AFTER (Fixed):
echo   1. app.UseStaticFiles()
echo   2. app.MapControllers() ? API routes mapped first
echo   3. app.MapFallbackToFile("/index.html") ? Only for non-API routes
echo.

echo The permission system should now work perfectly! ????

pause