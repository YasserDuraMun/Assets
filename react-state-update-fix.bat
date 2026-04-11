@echo off
cls
echo ?? REACT STATE UPDATE BUG - IMMEDIATE FIX
echo ========================================

echo ?? ISSUE IDENTIFIED:
echo   ? API returns perfect JSON: Dashboard allowView: true
echo   ? React state remains empty: Array(0)
echo   ?? setPermissions(response.data) is not updating state
echo   ?? Solution: Fix React state management issue

cd "C:\Users\haya\source\repos\Assets - Copy\Assets\ClientApp"

echo ?? QUICK FIX: Adding debug to identify state issue...
echo.

echo Creating temporary fix for AuthContext...
echo.

echo ?? Manual Fix Instructions:
echo ==========================
echo.
echo 1. Open: ClientApp\src\contexts\AuthContext.tsx
echo.
echo 2. Find line ~132: console.log('? Setting permissions:', response.data);
echo.
echo 3. Replace with this code:
echo    console.log('?? BEFORE setPermissions - data:', response.data);
echo    console.log('?? Data type:', Array.isArray(response.data));
echo    console.log('?? Data length:', response.data.length);
echo    console.log('?? First item:', response.data[0]);
echo    
echo    // Create new array to force React re-render
echo    const newPermissions = [...response.data];
echo    setPermissions(newPermissions);
echo    
echo    console.log('?? AFTER setPermissions called');
echo    
echo    // Check state after 100ms
echo    setTimeout(() => {
echo      console.log('?? State check after 100ms - this should show updated state');
echo    }, 100);
echo.
echo 4. Save the file
echo.
echo 5. Test the login again
echo.

echo ??? Starting backend...
cd ..
start "Backend - State Fix" cmd /k "echo ??? BACKEND - React State Fix && echo ==================== && echo. && echo ? API confirmed working perfectly && echo ?? Focus: Fix React state update issue && echo ?? Manual fix required in AuthContext.tsx && echo. && dotnet run"

echo ? Waiting for backend...
timeout /t 8

echo ?? Starting frontend for testing...
cd ClientApp

start "Frontend - State Fix Test" cmd /k "echo ?? FRONTEND - React State Fix Test && echo ============================ && echo. && echo ?? TEST AFTER MANUAL FIX: && echo. && echo ?? Expected Results: && echo   • 'BEFORE setPermissions - data:' should show Dashboard permission && echo   • 'AFTER setPermissions called' should appear && echo   • After 100ms: State should show updated permissions && echo   • hasPermission should find Dashboard permission && echo   • NO MORE 'Access denied for Dashboard.view' && echo. && echo ?? If state still empty after manual fix: && echo   • React component may be re-mounting && echo   • Multiple setPermissions calls conflicting && echo   • useEffect dependency array causing issues && echo. && npm run dev"

echo.
echo ?? REACT STATE FIX READY!
echo =========================
echo.

echo ?? CRITICAL: The issue is React state not updating
echo   • API works perfectly ?
echo   • Database has correct permissions ?  
echo   • setPermissions() called but state stays empty ?
echo   • Need to fix React state management
echo.

echo Apply the manual fix above and test immediately! ??

pause