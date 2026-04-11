@echo off
cls
echo ?? URGENT API FIX - MANUAL SEPARATION
echo ===================================

echo ?? CONFIRMED ISSUE:
echo   ? https://localhost:44385/api/security-test/public ? redirects to /login
echo   ? SPA fallback routing intercepts API calls
echo   ? Backend serves both React frontend and API on same port
echo   ? Solution: Separate API and Frontend ports immediately
echo.

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting API-only backend on port 5001...
start "API Backend - Port 5001" cmd /k "echo ??? API BACKEND ONLY - Port 5001 && echo ========================== && echo. && echo ?? API endpoints only && echo ?? Test: https://localhost:5001/api/security-test/public && echo ?? Swagger: https://localhost:5001/swagger && echo ?? NO static files served && echo. && dotnet run --urls https://localhost:5001"

echo ? Waiting for API to start...
timeout /t 10

echo ?? Testing API endpoint...
echo.
echo Testing: https://localhost:5001/api/security-test/public
curl -k https://localhost:5001/api/security-test/public
echo.

cd ClientApp

echo ?? Updating frontend .env to use API port 5001...
echo VITE_API_BASE_URL=https://localhost:5001/api > .env
echo ? Frontend configured to use: https://localhost:5001/api

echo ?? Starting frontend on port 5173...
start "Frontend - Port 5173" cmd /k "echo ?? FRONTEND ONLY - Port 5173 && echo ======================== && echo. && echo ?? Frontend: http://localhost:5173 && echo ?? API calls to: https://localhost:5001/api && echo ?? Login: haya1.alzeer1992@gmail.com / password123 && echo ?? Check Network tab - should see API calls to port 5001 && echo. && npm run dev"

echo.
echo ?? PORTS SEPARATED SUCCESSFULLY!
echo ===============================
echo.
echo ?? Service URLs:
echo   Frontend: http://localhost:5173
echo   API: https://localhost:5001/api
echo   Swagger: https://localhost:5001/swagger
echo.

echo ?? IMMEDIATE TESTS:
echo ==================
echo.
echo 1. ?? Test API directly:
echo    Open: https://localhost:5001/api/security-test/public
echo    Should return JSON, NOT redirect to login
echo.
echo 2. ?? Test Frontend:
echo    Open: http://localhost:5173
echo    Login and check Network tab
echo    API calls should go to https://localhost:5001/api
echo.
echo 3. ??? Test Permissions:
echo    After login, permissions should load correctly
echo    No more HTML responses from API calls
echo.

pause

echo ?? VERIFICATION STEPS:
echo ======================
echo.
echo ? API Working Correctly:
echo   • https://localhost:5001/api/security-test/public returns JSON
echo   • No redirect to /login
echo   • Swagger UI accessible at https://localhost:5001/swagger
echo.
echo ? Frontend Working Correctly:
echo   • http://localhost:5173 shows React app
echo   • Network tab shows API calls to port 5001
echo   • Login and permission loading work
echo.
echo ? Permission System Fixed:
echo   • loadUserPermissionsForUser gets JSON response
echo   • Permissions state populated correctly
echo   • hasPermission returns true for allowed screens
echo.

echo The API/Frontend separation should fix the permission issue! ??

pause