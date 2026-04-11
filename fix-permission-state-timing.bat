@echo off
cls
echo ?? CRITICAL FIX: API WORKS BUT FRONTEND ACCESS DENIED
echo ===================================================

echo ?? PROBLEM CONFIRMED:
echo   ? API returns correct data with Dashboard allowView: true
echo   ? PermissionGuard still shows "Access denied for Dashboard.view"
echo   ? Issue: Frontend state management or timing problem
echo.

echo ?? ROOT CAUSE ANALYSIS:
echo   • API response: {"success": true, "data": [{"screenName": "Dashboard", "allowView": true}]}
echo   • PermissionGuard: "Access denied for Dashboard.view"
echo   • Problem: permissions not saved to state correctly
echo   • Or: hasPermission function logic issue
echo.

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ?? Step 1: Adding debug logs to AuthContext...
cd ClientApp

echo Creating enhanced AuthContext with better state debugging...
powershell -Command "& {
    $content = Get-Content 'src/contexts/AuthContext.tsx' -Raw;
    
    # Fix permissions state management
    $content = $content -replace 
    'console\.log\(''? Setting permissions:'', response\.data\);[\s\S]*?console\.log\(''? Permissions state updated successfully''\);',
    'console.log(''? Raw API data:'', response.data);
    console.log(''? API data type:'', Array.isArray(response.data));
    console.log(''? API data length:'', response.data.length);
    
    // Ensure data is in correct format
    const permissionsData = Array.isArray(response.data) ? response.data : [];
    
    console.log(''? Setting permissions with data:'', permissionsData);
    setPermissions(permissionsData);
    
    // Immediate state verification
    console.log(''?? Permissions set, verifying state update...'');
    
    // Log each permission for debugging
    permissionsData.forEach((perm, index) => {
      console.log(\`?? Permission \${index + 1}: \${perm.screenName} - View=\${perm.allowView}, Insert=\${perm.allowInsert}, Update=\${perm.allowUpdate}, Delete=\${perm.allowDelete}\`);
    });
    
    console.log(''? Permissions state updated successfully'');
    console.log(''?? Total permissions loaded:'', permissionsData.length);';
    
    Set-Content 'src/contexts/AuthContext.tsx' \$content -Encoding UTF8
}"

echo ? AuthContext enhanced with better state debugging

echo ??? Starting backend...
cd ..
start "Backend - State Fix" cmd /k "echo ??? BACKEND - Permission State Fix && echo ========================== && echo. && echo ? API returns correct data && echo ?? Frontend state management enhanced && echo ?? Better debugging for state updates && echo. && dotnet run"

echo ? Waiting for backend...
timeout /t 10

echo ?? Starting frontend with enhanced debugging...
cd ClientApp

start "Frontend - State Debug" cmd /k "echo ?? FRONTEND - Permission State Debug && echo ============================== && echo. && echo ?? CRITICAL TEST SEQUENCE: && echo. && echo ?? Step 1: Login and check console logs && echo   • Should see 'Raw API data' && echo   • Should see 'API data type: true' && echo   • Should see 'API data length: 1' && echo   • Should see 'Setting permissions with data' && echo. && echo ?? Step 2: Check hasPermission logs && echo   • Should see 'Permissions count: 1' && echo   • Should see 'Looking for permission: Dashboard' && echo   • Should see 'Found permission: {object}' && echo   • Should see 'hasPermission result: Dashboard.view = true' && echo. && echo ? If still Access Denied: && echo   • Check timing - permissions loaded after guard check && echo   • Check state update - permissions not saved correctly && echo. && npm run dev"

echo.
echo ?? PERMISSION STATE DEBUG READY!
echo ================================
echo.

echo ?? DETAILED DEBUGGING CHECKLIST:
echo.
echo ?? Step 1: Login as Viewer user
echo   • Email: haya1.alzeer1992@gmail.com
echo   • Password: password123
echo   • Open browser DevTools ? Console
echo.
echo ?? Step 2: Check API Response Logs
echo   ? Expected: "Raw API data: [{screenName: 'Dashboard', allowView: true}]"
echo   ? Expected: "API data type: true"
echo   ? Expected: "API data length: 1"
echo   ? Expected: "Setting permissions with data: [array]"
echo   ? Expected: "Total permissions loaded: 1"
echo.
echo ?? Step 3: Check hasPermission Function Logs
echo   ? Expected: "Permissions count: 1" (not 0!)
echo   ? Expected: "Looking for permission: Dashboard"
echo   ? Expected: "Found permission: {screenName: Dashboard, allowView: true}"
echo   ? Expected: "hasPermission result: Dashboard.view = true"
echo.
echo ?? Step 4: Check PermissionGuard Result
echo   ? Expected: NO "Access denied for Dashboard.view"
echo   ? Expected: Dashboard component loads successfully
echo.

pause

echo ?? TROUBLESHOOTING GUIDE:
echo =========================
echo.
echo ?? If API logs show correct data but hasPermission shows count: 0:
echo   • Timing issue: permissions checked before state update
echo   • State update issue: setPermissions not working
echo   • Component re-render issue: state not triggering updates
echo.
echo ?? If hasPermission shows count: 1 but still Access Denied:
echo   • Screen name mismatch: "Dashboard" vs something else
echo   • Permission property issue: allowView not true
echo   • Logic error in hasPermission function
echo.
echo ?? If everything looks correct but still fails:
echo   • Race condition: PermissionGuard checks before permissions load
echo   • Need to add loading state or delay permission checks
echo   • May need useEffect dependency updates
echo.

echo Run the test and check console logs step by step! ??

pause