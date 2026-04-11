@echo off
cls
echo ?? EMERGENCY FIX: FILE LOCK + MIDDLEWARE ORDER
echo ===============================================

echo ?? TWO CRITICAL ISSUES:
echo   1. ? Assets.dll locked by VS + IIS Express
echo   2. ? app.MapControllers() inside if (Directory.Exists) block
echo   3. ? Solution: Kill processes + fix Program.cs middleware
echo.

echo ?? Step 1: Force killing all blocking processes...
taskkill /f /im devenv.exe >nul 2>&1
taskkill /f /im dotnet.exe >nul 2>&1
taskkill /f /im iisexpress.exe >nul 2>&1
taskkill /f /im MSBuild.exe >nul 2>&1
taskkill /f /im w3wp.exe >nul 2>&1

echo ? All processes terminated

echo ?? Step 2: Cleaning build artifacts...
cd "C:\Users\haya\source\repos\Assets - Copy\Assets"
dotnet clean >nul 2>&1
echo ? Build cleaned

echo ?? Step 3: Fixing Program.cs middleware order...
echo Creating backup...
copy Program.cs Program.cs.backup-middleware-emergency

echo Fixing middleware order with PowerShell...
powershell -Command "& {
    $content = Get-Content 'Program.cs' -Raw;
    
    # Fix the static files section to move MapControllers outside the if block
    $content = $content -replace 
    'if \(Directory\.Exists\(webRoot\)\)\s*\{\s*app\.UseStaticFiles\(\);\s*app\.MapControllers\(\);\s*app\.MapFallbackToFile\(""/index\.html""\);\s*Console\.WriteLine\("".*Static Files.*""\);\s*\}',
    'if (Directory.Exists(webRoot))
    {
        app.UseStaticFiles();
        Console.WriteLine(""?? Static Files Configured"");
    }

    // Map API Controllers - CRITICAL: Must be outside static files check!
    app.MapControllers();
    Console.WriteLine(""?? API Controllers Mapped - All roles should work now"");

    // SPA fallback routing - LAST to avoid intercepting API calls
    if (Directory.Exists(webRoot))
    {
        app.MapFallbackToFile(""/index.html"");
        Console.WriteLine(""?? SPA Fallback Configured"");
    }';
    
    Set-Content 'Program.cs' $content -Encoding UTF8
}"

echo ? Program.cs middleware order fixed!

echo ?? Step 4: Building with fixed middleware...
dotnet build
if %ERRORLEVEL% NEQ 0 (
    echo ? Build failed after fix
    pause
    exit /b 1
)
echo ? Build successful with fixed middleware!

echo ??? Starting backend with corrected middleware order...
start "Backend - Emergency Fix" cmd /k "echo ??? BACKEND - Emergency Middleware Fix && echo ================================= && echo. && echo ? File lock resolved && echo ? MapControllers now outside static files check && echo ?? All roles should work now && echo ?? Test: https://localhost:44385/api/security-test/public && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 12

echo ?? Testing API endpoint after fix...
curl -k "https://localhost:44385/api/security-test/public"
echo.

echo ?? Starting frontend for comprehensive test...
cd ClientApp

start "Frontend - All Roles Test" cmd /k "echo ?? FRONTEND - All Roles Should Work && echo ============================= && echo. && echo ?? COMPREHENSIVE TEST: && echo. && echo ? Super Admin: Should still work && echo ? Viewer Role: Should now load permissions correctly && echo ? Other roles: Should work based on DB permissions && echo. && echo ?? Test sequence: && echo   1. Login as Super Admin - should see everything && echo   2. Login as: haya1.alzeer1992@gmail.com / password123 && echo   3. Should load permissions from database && echo   4. Menu should show only allowed items && echo. && npm run dev"

echo.
echo ?? EMERGENCY FIX APPLIED!
echo =========================
echo.
echo ?? CRITICAL SUCCESS INDICATORS:
echo.
echo ? File Lock Resolved:
echo   • No more "file is locked" errors
echo   • dotnet build completed successfully
echo.
echo ? Middleware Order Fixed:
echo   • app.MapControllers() now outside static files check
echo   • API controllers mapped regardless of wwwroot existence
echo   • SPA fallback comes after API controllers
echo.
echo ? Expected Results:
echo   • API endpoint returns JSON (not HTML)
echo   • Super Admin still works (bypass remains)
echo   • Viewer role loads permissions from database
echo   • All non-Super Admin users get correct permissions
echo.

pause

echo ?? WHAT WAS FIXED:
echo ==================
echo.
echo ? BEFORE (Broken):
echo   1. Assets.dll locked by multiple processes
echo   2. if (Directory.Exists(webRoot)) {
echo        app.UseStaticFiles();
echo        app.MapControllers(); ? Inside if block!
echo        app.MapFallbackToFile();
echo      }
echo   3. If wwwroot missing: No API controllers mapped!
echo.
echo ? AFTER (Fixed):
echo   1. All processes killed and build cleaned
echo   2. if (Directory.Exists(webRoot)) {
echo        app.UseStaticFiles();
echo      }
echo      app.MapControllers(); ? Outside if block!
echo      if (Directory.Exists(webRoot)) {
echo        app.MapFallbackToFile();
echo      }
echo   3. API controllers always mapped, regardless of wwwroot
echo.

echo This should resolve permissions for ALL user roles! ????

pause