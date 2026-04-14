@echo off
cls
echo ?? SUPER ADMIN CANNOT ACCESS MAINTENANCE PAGE - PERMISSION ISSUE
echo ===============================================================

echo ?? PROBLEM IDENTIFIED:
echo   ? Super Admin cannot access /maintenance page
echo   ? MaintenancePage protected by PermissionGuard requiring "Maintenance.view"
echo   ? Super Admin may not have Maintenance permission assigned
echo   ?? Need to verify and grant Maintenance permissions to Super Admin

echo ?? ROOT CAUSE ANALYSIS:
echo   • MaintenancePage route: /maintenance
echo   • Route protection: PermissionGuard screenName="Maintenance" action="view"
echo   • Super Admin user may be missing Maintenance.view permission
echo   • Without permission, PermissionGuard blocks access to page
echo   • No page access = No API calls = No console logs

echo ?? VERIFICATION AND FIX STRATEGY:
echo   1. Check Super Admin permissions in database
echo   2. Grant Maintenance permissions to Super Admin role
echo   3. Test page access with proper permissions
echo   4. Compare Super Admin vs Custom Role access

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting Backend for Permission Analysis...
start "Backend - Maintenance Permissions" cmd /k "echo ??? BACKEND - Maintenance Page Access Debug && echo ========================== && echo. && echo ?? MAINTENANCE PAGE ACCESS ANALYSIS: && echo   • Route: /maintenance && echo   • Protection: PermissionGuard screenName=\"Maintenance\" action=\"view\" && echo   • Requirement: User must have Maintenance.view permission && echo. && echo ?? PERMISSION VERIFICATION STEPS: && echo   1. Check Super Admin role permissions in database && echo   2. Verify Maintenance screen exists in permissions system && echo   3. Check if Super Admin role has Maintenance.view assigned && echo   4. Monitor PermissionGuard evaluation logs && echo. && echo ?? EXPECTED BEHAVIOR: && echo   • With Maintenance.view: Page loads, API calls execute && echo   • Without Maintenance.view: PermissionGuard blocks access && echo   • Check browser console for PermissionGuard messages && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 10

echo ?? Starting Frontend Permission Debug...
cd ClientApp

start "Frontend - Maintenance Access" cmd /k "echo ?? FRONTEND - Maintenance Page Access Debug && echo ========================== && echo. && echo ?? MAINTENANCE PAGE ACCESS TEST: && echo. && echo ?? Phase 1: Super Admin Permission Check && echo   1. Login as Super Admin && echo   2. Check available permissions in AuthContext: && echo      • Open browser Developer Tools ? Console && echo      • Look for 'AuthContext: Available screens:' message && echo      • Verify if 'Maintenance' appears in the list && echo   3. Try to navigate to /maintenance: && echo      • Direct URL navigation: localhost:3000/maintenance && echo      • Menu navigation if available && echo      • Check for PermissionGuard blocking message && echo. && echo ?? Phase 2: Permission Analysis && echo   4. If page doesn't load: && echo      • Check console for PermissionGuard error messages && echo      • Look for 'Access denied for screen: Maintenance' && echo      • Verify user permissions in AuthContext state && echo   5. If page loads successfully: && echo      • Should see MaintenancePage component && echo      • Should see maintenance.api.ts calls in Network tab && echo      • Should see component logs in console && echo. && echo ?? Phase 3: Database Permission Verification && echo   6. Check Super Admin role in database: && echo      • Should have Maintenance screen permissions && echo      • Should have Maintenance.view action enabled && echo      • Verify role assignment to Super Admin user && echo. && echo ?? Phase 4: Permission Grant (If Missing) && echo   7. If Super Admin lacks Maintenance permissions: && echo      • Go to Role Management (/permissions) && echo      • Edit Super Admin role && echo      • Add Maintenance screen with all actions && echo      • Test maintenance page access again && echo. && npm run dev"

echo.
echo ?? MAINTENANCE PAGE ACCESS DEBUG READY!
echo ======================================
echo.

echo ?? DEBUG WORKFLOW:
echo.
echo ?? Step 1: Check AuthContext Permissions
echo   ? Login as Super Admin
echo   ? Check browser console for available screens
echo   ? Verify 'Maintenance' appears in permissions list
echo.
echo ?? Step 2: Test Page Navigation  
echo   ? Try direct URL: localhost:3000/maintenance
echo   ? Check for PermissionGuard blocking
echo   ? Look for access denied messages
echo.
echo ?? Step 3: Analyze Permission Structure
echo   ? Check Super Admin role has Maintenance permissions
echo   ? Verify Maintenance.view action is enabled
echo   ? Confirm role assignment is correct
echo.
echo ?? Step 4: Fix Missing Permissions (If Needed)
echo   ? Navigate to /permissions (Role Management)
echo   ? Edit Super Admin role
echo   ? Grant Maintenance screen permissions
echo   ? Test page access again

pause

echo ?? EXPECTED SOLUTIONS:
echo =====================
echo.
echo ?? Scenario 1: Missing Maintenance Permissions
echo   SYMPTOMS: 
echo     • Cannot access /maintenance page
echo     • PermissionGuard blocks access
echo     • 'Maintenance' not in available screens list
echo   SOLUTION:
echo     • Grant Maintenance.view permission to Super Admin role
echo     • Add all Maintenance actions (view/insert/update/delete)
echo.
echo ?? Scenario 2: PermissionGuard Configuration Issue
echo   SYMPTOMS:
echo     • Has permissions but still blocked
echo     • AuthContext shows Maintenance permissions
echo     • PermissionGuard evaluation fails
echo   SOLUTION:
echo     • Check PermissionGuard component logic
echo     • Verify screen name matching ("Maintenance")
echo.
echo ?? Scenario 3: Super Admin Role Assignment Issue
echo   SYMPTOMS:
echo     • Maintenance permissions exist but not accessible
echo     • Role assignment missing or incorrect
echo   SOLUTION:
echo     • Verify Super Admin user has Super Admin role assigned
echo     • Check UserRoles table for correct assignment

echo.
echo ?? IMMEDIATE ACTION PLAN:
echo ========================
echo.
echo 1. ?? CHECK PERMISSIONS: Look for 'Maintenance' in AuthContext available screens
echo 2. ?? TEST NAVIGATION: Try accessing /maintenance URL directly  
echo 3. ?? GRANT PERMISSIONS: Add Maintenance permissions to Super Admin role if missing
echo 4. ? VERIFY ACCESS: Confirm page loads and API calls execute
echo 5. ?? COMPARE USERS: Test both Super Admin and custom role access
echo.
echo Begin maintenance page access debugging now! ??
pause