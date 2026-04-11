@echo off
cls
echo ?? IMMEDIATE API TEST - BACKEND IS WORKING
echo ==========================================

echo ?? CONFIRMED: Backend works on port 44385
echo   ? Swagger: https://localhost:44385/swagger/index.html
echo   ? Backend is running and responding
echo   ?? Issue: SPA routing intercepts API calls
echo.

echo ?? Testing API endpoints directly...

echo ?? Test 1: Public endpoint
curl -k -s "https://localhost:44385/api/security-test/public" 
echo.

echo ?? Test 2: Check if we get JSON or HTML
echo Testing: https://localhost:44385/api/security-test/public
curl -k -H "Accept: application/json" -H "Content-Type: application/json" "https://localhost:44385/api/security-test/public" > api_test_response.txt 2>&1
echo Response saved to: api_test_response.txt
type api_test_response.txt
echo.

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ?? Quick fix: Update frontend .env to use correct base URL
cd ClientApp

echo ?? Ensuring .env uses correct API URL...
echo VITE_API_BASE_URL=https://localhost:44385/api > .env
echo ? Frontend configured to use: https://localhost:44385/api

echo ?? Starting frontend with correct API URL...
start "Frontend - Correct API" cmd /k "echo ?? FRONTEND - Correct API URL && echo ========================== && echo. && echo ?? API Base: https://localhost:44385/api && echo ?? Backend already running on 44385 && echo ?? Test login now && echo ?? Check Network tab for API responses && echo. && npm run dev"

echo.
echo ?? QUICK FIX APPLIED!
echo ====================
echo.
echo ?? TEST IMMEDIATELY:
echo   1. Frontend: http://localhost:5173
echo   2. Login: haya1.alzeer1992@gmail.com / password123
echo   3. Check Network tab - API calls to port 44385
echo   4. Should get JSON responses now
echo.

echo ?? If still getting HTML responses:
echo   • The middleware order in Program.cs needs fixing
echo   • SPA fallback is intercepting API routes
echo   • But try the login first - might work now!

pause

echo ?? ALTERNATIVE SOLUTION IF NEEDED:
echo ==================================
echo.
echo If API still returns HTML, we can:
echo   1. Change API route prefix to /apiback/*
echo   2. Or move MapControllers before UseStaticFiles
echo   3. Or use API subdomain/different port
echo.
echo But first, test the current setup with correct .env!

pause