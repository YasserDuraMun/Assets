@echo off
cls
echo ?? SIMPLE PERMISSION FIX - SAFE APPROACH
echo =======================================

echo ?? PROBLEM: Super Admin works, other roles don't
echo ?? SOLUTION: Fix middleware order in Program.cs manually
echo.

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ?? Step 1: Creating backup...
copy Program.cs Program.cs.backup-simple-fix
echo ? Backup created: Program.cs.backup-simple-fix

echo ?? Step 2: Checking current Program.cs...
echo Looking for MapControllers position...
findstr /n "MapControllers" Program.cs
echo.

echo Looking for MapFallbackToFile position...
findstr /n "MapFallbackToFile" Program.cs
echo.

echo ?? MANUAL FIX REQUIRED:
echo ======================
echo.
echo The issue is in Program.cs middleware order:
echo.
echo ? CURRENT (Wrong Order):
echo   Line ~239: app.MapControllers();
echo   Line ~268: app.MapFallbackToFile("/index.html");
echo.
echo ? REQUIRED (Correct Order):
echo   MapControllers should come AFTER Static Files
echo   but BEFORE MapFallbackToFile
echo.

echo ?? SIMPLE MANUAL STEPS:
echo   1. Open Program.cs in VS Code
echo   2. Find line: app.MapControllers();
echo   3. Cut this line (Ctrl+X)
echo   4. Find line: app.MapFallbackToFile("/index.html");
echo   5. Paste app.MapControllers(); BEFORE MapFallbackToFile
echo   6. Save the file
echo.

pause

echo ?? Alternative: Testing if API works now...
echo ===========================================

echo ??? Starting backend to test current state...
start "Backend Test" cmd /k "echo ??? BACKEND - Testing API && echo =================== && echo. && echo ?? Test API endpoint: && echo https://localhost:44385/api/security-test/public && echo. && echo Should return JSON, not HTML && echo. && dotnet run"

echo ? Waiting for backend...
timeout /t 10

echo ?? Testing API endpoint...
echo.
curl -k "https://localhost:44385/api/security-test/public"
echo.

echo ?? Starting frontend to test login...
cd ClientApp

start "Frontend Test" cmd /k "echo ?? FRONTEND - Permission Test && echo ======================== && echo. && echo ?? Test non-Super Admin login: && echo   Email: haya1.alzeer1992@gmail.com && echo   Password: password123 && echo. && echo ? If permissions load: Problem fixed && echo ? If Access denied: Manual fix needed && echo. && npm run dev"

echo.
echo ?? TEST RESULTS:
echo ===============
echo.
echo ?? Test 1: API Endpoint
echo   If curl returned JSON: API works
echo   If curl returned HTML: Middleware order issue
echo.
echo ?? Test 2: Login Test  
echo   Go to: http://localhost:5173
echo   Login as: haya1.alzeer1992@gmail.com / password123
echo   If menu shows correctly: Problem solved
echo   If Access denied: Need manual Program.cs fix
echo.

pause

echo ?? IF MANUAL FIX IS NEEDED:
echo ============================
echo.
echo 1. ?? Open Program.cs in VS Code
echo 2. ?? Find around line 239: app.MapControllers();
echo 3. ?? Cut this line (Ctrl+X)
echo 4. ?? Find around line 268: app.MapFallbackToFile("/index.html");
echo 5. ?? Paste app.MapControllers(); on the line BEFORE MapFallbackToFile
echo 6. ?? Save the file (Ctrl+S)
echo 7. ?? Restart the backend
echo.

echo This simple fix will resolve the permission issue for all roles! ???

pause