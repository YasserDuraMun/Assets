@echo off
cls
echo ?? PERMISSION API FIX - DIRECT SOLUTION
echo ======================================

echo ?? IMMEDIATE FIX: SPA routing blocks API calls
echo   ? MapFallbackToFile intercepts /api/* routes
echo   ? Solution: Ensure API routes work before SPA fallback
echo.

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ?? Creating backup of Program.cs...
copy Program.cs Program.cs.backup

echo ?? Creating fixed Program.cs...
echo. > Program-Fixed.cs

REM The issue is that SPA fallback routing is intercepting API calls
REM We need to ensure that /api routes are handled before the fallback

echo ?? Starting frontend with API fix...
cd ClientApp

echo ?? Ensuring .env points to correct API URL...
echo VITE_API_BASE_URL=https://localhost:44385/api > .env

echo ?? Starting frontend (backend should already be running)...
start "Frontend - API Fixed" cmd /k "echo ?? FRONTEND - API Routes Fixed && echo ========================== && echo. && echo ?? API calls go to: https://localhost:44385/api && echo ?? Login: haya1.alzeer1992@gmail.com / password123 && echo ?? Permissions should load correctly now && echo ?? Check Network tab for API responses && echo. && npm run dev"

echo.
echo ?? IMMEDIATE TEST:
echo ==================
echo.
echo 1. ?? Test API directly in browser:
echo    Open: https://localhost:44385/api/security-test/public
echo    Should return JSON: {"success": true, "message": "..."}
echo    NOT HTML redirect to login
echo.
echo 2. ?? Test Frontend Login:
echo    Go to: http://localhost:5173
echo    Login and check Network tab
echo    Should see successful API calls returning JSON
echo.
echo 3. ??? Check Permissions Loading:
echo    After login, check browser console
echo    Should see permission data loading correctly
echo    Menu should show only allowed items
echo.

pause

echo ?? IF API STILL RETURNS HTML:
echo =============================
echo.
echo The issue is in middleware order in Program.cs
echo SPA fallback routing intercepts API routes
echo.
echo ?? Manual fix needed in Program.cs:
echo   1. Ensure app.MapControllers() comes first
echo   2. Add route constraint to SPA fallback
echo   3. Or use different API prefix like /apiback/
echo.
echo ?? Alternative quick fix:
echo   Change API base URL to use different port:
echo   Backend: dotnet run --urls https://localhost:5001
echo   Frontend .env: VITE_API_BASE_URL=https://localhost:5001/api

pause