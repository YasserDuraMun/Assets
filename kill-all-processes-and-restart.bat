@echo off
cls
echo ?? FILE LOCK ISSUE - KILLING PROCESSES
echo ===================================

echo ?? PROBLEM: Assets.dll is locked by VS and IIS Express
echo ?? SOLUTION: Kill all processes and restart clean
echo.

echo ?? Step 1: Killing all related processes...
taskkill /f /im dotnet.exe 2>nul
taskkill /f /im iisexpress.exe 2>nul  
taskkill /f /im devenv.exe 2>nul
taskkill /f /im MSBuild.exe 2>nul

echo ? Processes killed

echo ?? Step 2: Cleaning build artifacts...
cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

dotnet clean
echo ? Build cleaned

echo ?? Step 3: Testing API connection...
echo.

echo ??? Starting backend cleanly...
start "Backend - Clean Start" cmd /k "echo ??? BACKEND - Clean Restart && echo ====================== && echo. && echo ? All processes killed && echo ?? Testing API: https://localhost:44385/api/security-test/public && echo ?? Should return JSON not HTML && echo. && dotnet run"

echo ? Waiting for backend to start...
timeout /t 15

echo ?? Testing API endpoint...
curl -k "https://localhost:44385/api/security-test/public"
echo.

echo ?? Starting frontend...
cd ClientApp

start "Frontend - Clean Start" cmd /k "echo ?? FRONTEND - Clean Start && echo ===================== && echo. && echo ?? Test login now: && echo   • Go to: http://localhost:5173 && echo   • Login: haya1.alzeer1992@gmail.com / password123 && echo   • Check if permissions load correctly && echo. && npm run dev"

echo.
echo ?? CLEAN RESTART COMPLETE!
echo ==========================
echo.
echo ?? TEST SEQUENCE:
echo   1. ? All blocking processes killed
echo   2. ? Build artifacts cleaned  
echo   3. ?? Backend starting fresh
echo   4. ?? API endpoint should return JSON
echo   5. ?? Frontend ready for testing
echo.

pause

echo ?? NEXT STEPS:
echo ==============
echo.
echo ?? If API returns JSON:
echo   • Problem may be fixed
echo   • Test login with non-Super Admin user
echo   • Check if permissions load correctly
echo.
echo ?? If API still returns HTML:
echo   • Need to fix Program.cs middleware order
echo   • MapControllers must come before MapFallbackToFile
echo   • Manual edit required in Program.cs
echo.

echo File lock issue resolved! ??

pause