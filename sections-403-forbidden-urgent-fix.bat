@echo off
cls
echo ?? URGENT: 403 FORBIDDEN ERROR ON /API/SECTIONS FIX
echo =================================================

echo ?? PROBLEM DETECTED:
echo   ? GET /api/sections returns 403 Forbidden
echo   ? User has valid JWT token but lacks permission
echo   ? Sections endpoints require Departments.view permission
echo   ? User may not have required Departments permissions

echo ?? IMMEDIATE SOLUTION STRATEGY:
echo   ?? Check user's actual permissions in database
echo   ?? Verify SectionsController authorization attributes
echo   ?? Test with Super Admin first to confirm API works
echo   ?? Grant Departments permissions to user if needed

echo ?? ROOT CAUSE ANALYSIS:
echo   • Sections now require Departments.view permission
echo   • User must have Departments permissions to manage sections
echo   • This is correct behavior (sections belong to departments)
echo   • Solution: Grant user Departments permissions

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting Backend with Sections Debug...
start "Backend - Sections 403 Fix" cmd /k "echo ??? BACKEND - Sections 403 Forbidden Debug && echo ============================= && echo. && echo ?? SECTIONS API 403 ERROR INVESTIGATION: && echo. && echo ?? Checking SectionsController: && echo   • GET /api/sections requires Departments.view && echo   • POST /api/sections requires Departments.insert && echo   • PUT /api/sections/{id} requires Departments.update && echo   • DELETE /api/sections/{id} requires Departments.delete && echo. && echo ?? Expected Authorization Flow: && echo   1. User makes request to /api/sections && echo   2. RequirePermission attribute checks Departments.view && echo   3. If user has permission ? 200 OK && echo   4. If user lacks permission ? 403 Forbidden && echo. && echo ?? Debug Steps: && echo   • Check console logs for permission checks && echo   • Verify user role and permissions in database && echo   • Test with Super Admin account first && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 10

echo ?? Starting Frontend Debug Session...
cd ClientApp

start "Frontend - Sections 403 Debug" cmd /k "echo ?? FRONTEND - Sections 403 Forbidden Debug && echo ============================== && echo. && echo ?? SECTIONS ACCESS TROUBLESHOOTING: && echo. && echo ?? Phase 1: Verify Current User Permissions && echo   1. Open browser Developer Tools ? Console && echo   2. Check AuthContext permissions state: && echo      • Look for permissions array in console logs && echo      • Verify if Departments.view exists && echo      • Check user roles and permissions loading && echo. && echo ?? Phase 2: Test API Access Directly && echo   3. Network Tab Analysis: && echo      • Check /api/security/current-user-permissions response && echo      • Verify Departments permissions in the response && echo      • Look for Departments.view in permissions array && echo. && echo ?? Phase 3: Super Admin Test && echo   4. Login as Super Admin: && echo      • Email: (super admin email) && echo      • Should have access to all sections && echo      • If Super Admin works ? permission issue && echo      • If Super Admin fails ? API/Controller issue && echo. && echo ?? Phase 4: Permission Grant Test && echo   5. Grant Departments Permissions: && echo      • Login as Super Admin && echo      • Go to Role Permissions management && echo      • Grant Departments.view to user's role && echo      • Test sections access again && echo. && npm run dev"

echo.
echo ?? SECTIONS 403 ERROR DEBUG READY!
echo =================================
echo.

echo ?? IMMEDIATE ACTION PLAN:
echo.
echo ? Step 1: Verify API Endpoint Status
echo   ? Test with Postman/curl to isolate frontend issues
echo   ? Check if endpoint responds correctly with proper token
echo   ? Verify RequirePermission attribute is applied correctly
echo.
echo ? Step 2: Check User Permissions
echo   ? Login to system and check user's role
echo   ? Verify user has Departments.view permission
echo   ? Check permissions API response includes Departments
echo.
echo ? Step 3: Super Admin Verification
echo   ? Test sections API with Super Admin account
echo   ? Super Admin should have unrestricted access
echo   ? If Super Admin fails ? API issue
echo   ? If Super Admin works ? user permission issue
echo.
echo ? Step 4: Grant Required Permissions
echo   ? Super Admin logs in
echo   ? Navigate to Roles ^& Permissions management
echo   ? Grant Departments permissions to user's role:
echo      • Departments.view (required for sections viewing)
echo      • Departments.insert (required for creating sections)
echo      • Departments.update (required for editing sections)
echo      • Departments.delete (required for deleting sections)

pause

echo ?? DETAILED TROUBLESHOOTING GUIDE:
echo ==================================
echo.
echo ?? Why Sections Require Departments Permissions:
echo   • Sections are organizational units under Departments
echo   • Hierarchical relationship: Department ? Sections
echo   • Security model: Sections inherit Department permissions
echo   • This is correct and intended behavior
echo.
echo ?? Quick Permission Check:
echo   1. Login as the user getting 403 error
echo   2. Open browser console and look for:
echo      'AuthContext: Available screens: [list of permissions]'
echo   3. Check if 'Departments' appears in the list
echo   4. If NOT present ? User needs Departments permissions
echo   5. If present ? Check specific action permissions
echo.
echo ?? Emergency Workaround (Temporary):
echo   If you need immediate access:
echo   1. Login as Super Admin
echo   2. Go to role management
echo   3. Create temporary role with Departments permissions
echo   4. Assign to user
echo   5. Test sections access
echo.
echo ?? Permanent Solution:
echo   1. Review organizational permission structure
echo   2. Ensure users managing sections have Departments permissions
echo   3. Update role definitions to include necessary permissions
echo   4. Train users on hierarchical permission model

echo.
echo ?? EXPECTED RESOLUTION:
echo ======================
echo.
echo ? After Granting Departments Permissions:
echo   • /api/sections returns 200 OK with data
echo   • Sections list loads correctly in frontend
echo   • User can perform sections CRUD operations
echo   • No more 403 Forbidden errors
echo.
echo ? System Behavior Validation:
echo   • Super Admin: Full sections access
echo   • Users with Departments.view: Can view sections
echo   • Users with Departments.insert: Can create sections
echo   • Users with Departments.update: Can edit sections
echo   • Users with Departments.delete: Can delete sections
echo   • Users without Departments permissions: 403 Forbidden

echo.
echo ?? CRITICAL NEXT STEPS:
echo ======================
echo.
echo 1. ?? IMMEDIATE: Check user permissions in console logs
echo 2. ??? VERIFY: Test with Super Admin account
echo 3. ? QUICK FIX: Grant Departments permissions to user role
echo 4. ? VALIDATE: Confirm sections access works after permission grant
echo.
echo Start debugging now - check console for permission logs! ??
pause