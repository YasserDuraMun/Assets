@echo off
cls
echo ?? CLEAN RESTART FOR PERMISSION FIX
echo ===================================

echo ?? Fixing file lock and testing permission system
echo.

echo ?? Step 1: Force kill all blocking processes...
echo Killing Visual Studio processes...
taskkill /f /im devenv.exe >nul 2>&1
echo Killing .NET processes...  
taskkill /f /im dotnet.exe >nul 2>&1
echo Killing IIS Express processes...
taskkill /f /im iisexpress.exe >nul 2>&1
echo Killing MSBuild processes...
taskkill /f /im MSBuild.exe >nul 2>&1

echo ? All processes terminated

echo ?? Step 2: Cleaning project...
cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

dotnet clean >nul 2>&1
echo ? Project cleaned

echo ?? Step 3: Building fresh...
dotnet build >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ? Build failed - check for compilation errors
    pause
    exit /b 1
)
echo ? Build successful

echo ?? Step 4: Testing API before starting...
echo.

echo ??? Starting backend server...
start "Backend - Permission Fix" cmd /k "echo ??? BACKEND - Permission System Fix && echo ========================== && echo. && echo ? Clean build completed && echo ?? Testing API endpoint first && echo ?? API: https://localhost:44385/api/security-test/public && echo ??? Should return JSON for permissions to work && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 12

echo ?? CRITICAL API TEST:
echo ====================

echo Testing: https://localhost:44385/api/security-test/public
curl -k -s "https://localhost:44385/api/security-test/public"
echo.

echo ?? If above returned JSON: ? API works
echo ?? If above returned HTML: ? Middleware order issue

echo.

echo ?? Starting frontend for full test...
cd ClientApp

start "Frontend - Permission Test" cmd /k "echo ?? FRONTEND - Permission System Test && echo ============================ && echo. && echo ?? COMPREHENSIVE TEST PLAN: && echo   1. Login as Super Admin (should work) && echo   2. Login as: haya1.alzeer1992@gmail.com / password123 && echo   3. Check if Viewer permissions load correctly && echo   4. Menu should show only allowed items && echo. && echo ?? Expected for Viewer role: && echo   ? Dashboard, Assets, Categories (limited access) && echo   ? Users, Permissions (no access) && echo. && npm run dev"

echo.
echo ?? CLEAN PERMISSION TEST READY!
echo ===============================
echo.
echo ?? CRITICAL SUCCESS INDICATORS:
echo.
echo ? API Test Success:
echo   • curl command above returned JSON
echo   • Contains "success": true or similar
echo   • NOT HTML content with <doctype>
echo.
echo ? Permission Loading Success:
echo   • Login as haya1.alzeer1992@gmail.com
echo   • Browser console shows permission data loading
echo   • Menu shows correct items based on role
echo   • No "Access denied" for allowed screens
echo.
echo ? Still Failing Indicators:
echo   • API returns HTML instead of JSON
echo   • Empty permissions array in browser console  
echo   • All non-Super Admin users get "Access denied"
echo.

pause

echo ?? IF STILL NOT WORKING:
echo ========================
echo.
echo The issue is in Program.cs middleware order:
echo   1. Open Program.cs in editor
echo   2. Find: app.MapControllers(); (around line 239)
echo   3. Cut this line
echo   4. Find: app.MapFallbackToFile("/index.html"); (around line 268)
echo   5. Paste app.MapControllers(); BEFORE MapFallbackToFile
echo   6. Save and restart backend
echo.

echo This will ensure API routes work before SPA fallback! ???

pause