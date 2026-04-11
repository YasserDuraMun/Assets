@echo off
cls
echo ?? FINAL API CONNECTION FIX
echo ===========================

echo ?? ISSUE: Backend not running on port 5001
echo   ? ERR_CONNECTION_REFUSED = No service on port 5001
echo   ? Solution: Start backend and test connection
echo.

echo ?? STEP 1: Starting Backend on default port first...
cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Testing default backend port...
start "Backend - Default Port" cmd /k "echo ??? BACKEND - Default Port Test && echo ======================== && echo. && echo ?? Starting on default port && echo ?? Will determine actual port from output && echo ?? Watch for 'Now listening on' message && echo. && dotnet run"

echo ? Waiting for backend to start...
timeout /t 15

echo ?? Testing API on common ports...

echo Testing port 44385...
curl -k -s "https://localhost:44385/api/security-test/public" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ? Backend responding on port 44385
    set API_PORT=44385
) else (
    echo ? Port 44385 not responding
)

echo Testing port 5001...
curl -k -s "https://localhost:5001/api/security-test/public" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ? Backend responding on port 5001
    set API_PORT=5001
) else (
    echo ? Port 5001 not responding
)

echo Testing port 7000...
curl -k -s "https://localhost:7000/api/security-test/public" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ? Backend responding on port 7000
    set API_PORT=7000
) else (
    echo ? Port 7000 not responding
)

echo.
echo ?? DETECTED BACKEND STATUS:
echo ===========================

if defined API_PORT (
    echo ? Backend is running on port %API_PORT%
    echo ?? Updating frontend to use port %API_PORT%
    
    cd ClientApp
    echo VITE_API_BASE_URL=https://localhost:%API_PORT%/api > .env
    echo ? Frontend configured for port %API_PORT%
    
    echo ?? Starting frontend...
    start "Frontend - Port %API_PORT%" cmd /k "echo ?? FRONTEND - Connected to Port %API_PORT% && echo ================================== && echo. && echo ?? API URL: https://localhost:%API_PORT%/api && echo ?? Login: haya1.alzeer1992@gmail.com / password123 && echo ?? API calls should now work correctly && echo. && npm run dev"
    
) else (
    echo ? Backend not responding on any common port
    echo ?? Starting backend on port 5001 specifically...
    
    start "Backend - Port 5001" cmd /k "echo ??? BACKEND - Port 5001 Specific && echo ========================== && echo. && echo ?? Forcing start on port 5001 && echo ?? API URL: https://localhost:5001/api && echo ?? Test: https://localhost:5001/api/security-test/public && echo. && dotnet run --urls https://localhost:5001"
    
    echo ? Waiting for port 5001 backend...
    timeout /t 10
    
    cd ClientApp
    echo VITE_API_BASE_URL=https://localhost:5001/api > .env
    echo ? Frontend configured for port 5001
    
    echo ?? Starting frontend...
    start "Frontend - Port 5001" cmd /k "echo ?? FRONTEND - Port 5001 && echo ==================== && echo. && echo ?? API URL: https://localhost:5001/api && echo ?? Login: haya1.alzeer1992@gmail.com / password123 && echo ? Wait for backend to fully start && echo. && npm run dev"
)

echo.
echo ?? API CONNECTION SETUP COMPLETE!
echo =================================
echo.

if defined API_PORT (
    echo ? WORKING CONFIGURATION:
    echo   Backend: https://localhost:%API_PORT%
    echo   Frontend: http://localhost:5173
    echo   API Base: https://localhost:%API_PORT%/api
    echo.
    echo ?? TEST URLS:
    echo   Direct API: https://localhost:%API_PORT%/api/security-test/public
    echo   Frontend: http://localhost:5173
    echo.
) else (
    echo ?? STARTING CONFIGURATION:
    echo   Backend: https://localhost:5001 (starting...)
    echo   Frontend: http://localhost:5173
    echo   API Base: https://localhost:5001/api
    echo.
    echo ? Wait for backend to start, then test:
    echo   Direct API: https://localhost:5001/api/security-test/public
    echo   Frontend: http://localhost:5173
    echo.
)

echo ?? FINAL TESTING STEPS:
echo   1. Wait for both windows to fully start
echo   2. Test API URL directly in browser - should return JSON
echo   3. Go to frontend and login
echo   4. Check Network tab - API calls should work
echo   5. Permissions should load correctly now

pause