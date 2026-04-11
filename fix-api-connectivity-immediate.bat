@echo off
cls
echo ?? BACKEND API CONNECTIVITY FIX
echo ================================

echo ?? PROBLEM IDENTIFIED:
echo   ? API call returns HTML instead of JSON
echo   ? URL: https://localhost:44385/api/security-test/my-permissions
echo   ? Response: HTML page (frontend) instead of API data
echo   ? This means backend is not responding or route not found
echo.

echo ?? IMMEDIATE FIXES TO TRY:
echo.

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Step 1: Starting backend with verbose logging...
start "Backend - API Fix" cmd /k "echo ??? BACKEND - API Connectivity Debug && echo ========================== && echo. && echo ?? Starting on HTTPS port 44385 && echo ?? Watch for SecurityTest controller logs && echo ?? API should be: https://localhost:44385/api/security-test/my-permissions && echo. && dotnet run --urls https://localhost:44385"

echo ? Waiting for backend to start...
timeout /t 10

echo ?? Step 2: Testing API directly...
echo Testing API endpoint...
curl -k -H "Content-Type: application/json" https://localhost:44385/api/security-test/public
echo.

echo ?? Step 3: Starting frontend...
cd ClientApp

start "Frontend - API Fix" cmd /k "echo ?? FRONTEND - API Connectivity Test && echo ============================ && echo. && echo ?? Backend should now respond with JSON && echo ?? Try login and check Network tab && echo ?? API call should return JSON data not HTML && echo. && npm run dev"

echo.
echo ?? IMMEDIATE TESTS TO RUN:
echo ==========================
echo.
echo ?? Test 1: Manual API Test
echo   Open browser: https://localhost:44385/api/security-test/public
echo   Should return JSON, not HTML
echo   If HTML: Backend routing issue
echo.
echo ?? Test 2: Check Backend Console
echo   Look for "Starting on HTTPS port 44385"
echo   Look for SecurityTest controller registration
echo   Look for route mapping logs
echo.
echo ?? Test 3: Network Tab Test
echo   Login and check Network tab
echo   GET /api/security-test/my-permissions
echo   Response should be JSON with success/data
echo   If HTML: Backend not handling API routes
echo.

pause

echo ?? ALTERNATIVE FIXES IF ABOVE DOESN'T WORK:
echo ===========================================
echo.
echo ?? Fix 1: Change API URL to HTTP
echo   Edit ClientApp/.env
echo   Change VITE_API_BASE_URL to http://localhost:5000
echo.
echo ?? Fix 2: Start backend on different port
echo   dotnet run --urls http://localhost:5000
echo   Then update frontend .env accordingly
echo.
echo ?? Fix 3: Check launchSettings.json
echo   Verify applicationUrl includes https://localhost:44385
echo   Make sure it matches the API calls
echo.

pause