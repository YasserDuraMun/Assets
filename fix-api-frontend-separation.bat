@echo off
cls
echo ?? FIXING API/FRONTEND CONFLICT - SEPARATED PORTS
echo ================================================

echo ?? PROBLEM IDENTIFIED:
echo   ? Backend serves both API and React frontend on same port
echo   ? SPA fallback routing interferes with API calls
echo   ? API calls get HTML responses instead of JSON
echo   ? Solution: Run API on different port from frontend
echo.

echo ?? STARTING SEPARATED SERVICES:
echo.

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Step 1: Starting API-only backend on port 5001...
start "API Backend - Port 5001" cmd /k "echo ??? API BACKEND - Port 5001 && echo ===================== && echo. && echo ?? API only - no static files && echo ?? API URL: https://localhost:5001/api && echo ?? Swagger: https://localhost:5001/swagger && echo. && dotnet run --urls https://localhost:5001"

echo ? Waiting for API backend to start...
timeout /t 10

echo ?? Step 2: Starting frontend on port 5173...
cd ClientApp

echo ?? Updating .env to use new API port...
echo VITE_API_BASE_URL=https://localhost:5001/api > .env
echo ? Frontend will now connect to API on port 5001

start "Frontend - Port 5173" cmd /k "echo ?? FRONTEND - Port 5173 && echo ===================== && echo. && echo ?? Frontend URL: http://localhost:5173 && echo ?? API URL: https://localhost:5001/api && echo ?? Login: haya1.alzeer1992@gmail.com / password123 && echo. && npm run dev"

echo.
echo ?? SERVICES SEPARATED SUCCESSFULLY!
echo ==================================
echo.
echo ?? URLs:
echo   Frontend: http://localhost:5173
echo   API: https://localhost:5001/api
echo   Swagger: https://localhost:5001/swagger
echo.

echo ?? Test Instructions:
echo   1. Go to: http://localhost:5173
echo   2. Open DevTools ? Network tab
echo   3. Login and watch API calls
echo   4. Should see calls to https://localhost:5001/api
echo   5. Responses should be JSON, not HTML
echo.

echo ?? Quick API Test:
echo   Open: https://localhost:5001/api/security-test/public
echo   Should return JSON: {"message": "...", "success": true}
echo.

pause

echo ?? PERMANENT SOLUTION OPTIONS:
echo ===============================
echo.
echo ?? Option 1: Keep Separated (Recommended for Development)
echo   • Frontend: http://localhost:5173
echo   • API: https://localhost:5001
echo   • Clear separation, easy debugging
echo.
echo ?? Option 2: Fix Routing in Combined Setup
echo   • Ensure API routes are mapped before SPA fallback
echo   • Add explicit API prefix handling
echo   • More complex but single port
echo.
echo ?? Option 3: Use Different API Base Path
echo   • Change API routes to /apiback/* instead of /api/*
echo   • Update frontend to call new path
echo   • Avoid conflicts with SPA routing
echo.

echo The separated setup should resolve the API connectivity issue! ??

pause