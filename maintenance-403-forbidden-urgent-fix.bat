@echo off
cls
echo ?? MAINTENANCE 403 FORBIDDEN - URGENT FIX APPLIED
echo ===============================================

echo ?? PROBLEM IDENTIFIED AND FIXED:
echo   ? POST /api/maintenance returned 403 Forbidden for custom roles
echo   ? MaintenanceController used hardcoded roles instead of permissions
echo   ? Super Admin worked, but custom role users couldn't create maintenance
echo   ? Fixed: All endpoints now use RequirePermission attributes

echo ?? MAINTENANCECONTROLLER FIXES APPLIED:
echo   ? GET /api/maintenance ? RequirePermission("Maintenance", "view")
echo   ? GET /api/maintenance/{id} ? RequirePermission("Maintenance", "view")  
echo   ? GET /api/maintenance/asset/{assetId} ? RequirePermission("Maintenance", "view")
echo   ? POST /api/maintenance ? RequirePermission("Maintenance", "insert")
echo   ? PUT /api/maintenance/{id} ? RequirePermission("Maintenance", "update")
echo   ? POST /api/maintenance/{id}/complete ? RequirePermission("Maintenance", "update")
echo   ? POST /api/maintenance/{id}/cancel ? RequirePermission("Maintenance", "delete")

echo ?? MAINTENANCE PERMISSIONS STRUCTURE:
echo   • Maintenance.view ? View maintenance records and history
echo   • Maintenance.insert ? Create new maintenance requests
echo   • Maintenance.update ? Edit maintenance and complete maintenance
echo   • Maintenance.delete ? Cancel maintenance requests

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting Backend with Maintenance Fix...
start "Backend - Maintenance Fix" cmd /k "echo ??? BACKEND - Maintenance 403 Fix Applied && echo ============================== && echo. && echo ? MAINTENANCE API PERMISSIONS FIXED: && echo   • All maintenance endpoints now use RequirePermission && echo   • No more hardcoded role restrictions && echo   • Custom roles with Maintenance permissions can access && echo. && echo ?? MAINTENANCE WORKFLOW PERMISSIONS: && echo   • Create maintenance request ? Maintenance.insert && echo   • View maintenance history ? Maintenance.view && echo   • Update maintenance details ? Maintenance.update && echo   • Complete maintenance ? Maintenance.update && echo   • Cancel maintenance ? Maintenance.delete && echo. && echo ?? EXPECTED BEHAVIOR: && echo   • Users with Maintenance permissions can now create maintenance && echo   • Permission-based access control fully operational && echo   • Maintenance workflow available to authorized custom roles && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 10

echo ?? Starting Frontend Maintenance Test...
cd ClientApp

start "Frontend - Maintenance Fix" cmd /k "echo ?? FRONTEND - Maintenance 403 Fix Test && echo ============================= && echo. && echo ?? MAINTENANCE CRUD VALIDATION: && echo. && echo ?? Phase 1: Test Maintenance Creation && echo   1. Login with custom role user having Maintenance.insert permission && echo   2. Navigate to assets page && echo   3. Select an asset and try to create maintenance request && echo   4. MaintenanceModal should submit successfully (no 403 error) && echo   5. Check browser console for success messages && echo. && echo ?? Phase 2: Test Maintenance Management && echo   6. Navigate to maintenance page (if exists) && echo   7. Should see maintenance records list && echo   8. Test viewing maintenance details && echo   9. Test updating maintenance (if has update permission) && echo   10. Test completing maintenance (if has update permission) && echo. && echo ?? Phase 3: Permission Verification && echo   11. Check Network tab: && echo       • POST /api/maintenance should return 200 OK && echo       • No more 403 Forbidden errors && echo   12. Test with different permission levels: && echo       • Maintenance.view only ? Can view, not create && echo       • Maintenance.insert ? Can create maintenance && echo       • Full permissions ? Can perform all operations && echo. && echo ?? Phase 4: Asset Integration Test && echo   13. Test maintenance creation from asset details page && echo   14. Verify maintenance appears in asset history && echo   15. Test maintenance workflow from asset management perspective && echo. && npm run dev"

echo.
echo ?? MAINTENANCE 403 FIX READY FOR TESTING!
echo ========================================
echo.

echo ?? SUCCESS INDICATORS:
echo.
echo ? Maintenance Creation:
echo   ? MaintenanceModal submits without 403 error
echo   ? POST /api/maintenance returns 200 OK with created maintenance
echo   ? Success message displays after maintenance creation
echo   ? Maintenance appears in system records
echo.
echo ? Maintenance Management:
echo   ? Can view maintenance records (with Maintenance.view)
echo   ? Can create new maintenance (with Maintenance.insert)  
echo   ? Can update maintenance details (with Maintenance.update)
echo   ? Can complete maintenance (with Maintenance.update)
echo   ? Can cancel maintenance (with Maintenance.delete)
echo.
echo ? Permission-Based Access:
echo   ? Super Admin: Full access to all maintenance operations
echo   ? Custom roles: Access based on assigned Maintenance permissions
echo   ? Users without Maintenance permissions: No access to maintenance features
echo   ? Granular permission control working correctly
echo.
echo ? Asset Integration:
echo   ? Maintenance creation works from asset pages
echo   ? Asset maintenance history displays correctly
echo   ? Maintenance workflow integrated with asset management

pause

echo ?? MAINTENANCE PERMISSION REQUIREMENTS:
echo ======================================
echo.
echo ?? For Basic Maintenance Access:
echo   • User needs: Maintenance.view permission minimum
echo   • Purpose: View maintenance records and history
echo.
echo ?? For Maintenance Creation (The Fixed Issue):
echo   • User needs: Maintenance.insert permission
echo   • Purpose: Create new maintenance requests
echo   • API call: POST /api/maintenance
echo.
echo ?? For Full Maintenance Management:
echo   • Maintenance.view ? View maintenance records
echo   • Maintenance.insert ? Create maintenance requests
echo   • Maintenance.update ? Edit maintenance, complete maintenance
echo   • Maintenance.delete ? Cancel maintenance requests
echo.
echo ?? Permission Grant Instructions:
echo   1. Login as Super Admin
echo   2. Go to "????? ??????? ??????????"
echo   3. Select user's role
echo   4. Enable Maintenance permissions as needed:
echo      ? Maintenance.view (for viewing maintenance)
echo      ? Maintenance.insert (for creating maintenance - THE FIX)
echo      ? Maintenance.update (for editing/completing maintenance)
echo      ? Maintenance.delete (for canceling maintenance)

echo.
echo ?? EXPECTED RESULTS:
echo ===================
echo.
echo ? BEFORE FIX:
echo   • MaintenanceModal creation failed with 403 Forbidden
echo   • Only Super Admin could create maintenance requests
echo   • Custom roles blocked from maintenance operations
echo.
echo ? AFTER FIX:
echo   • MaintenanceModal creates maintenance successfully
echo   • Custom roles can create maintenance with proper permissions
echo   • Permission-based maintenance management fully functional
echo   • Consistent behavior across all user types

echo.
echo ?? QUICK VALIDATION STEPS:
echo =========================
echo.
echo ?? Immediate Test:
echo   1. Login with custom role user
echo   2. Ensure user has Maintenance.insert permission in role management
echo   3. Go to assets page and select an asset  
echo   4. Open maintenance creation modal
echo   5. Fill maintenance details and submit
echo   6. Should succeed without 403 error
echo.
echo ?? If Still Getting 403:
echo   • Verify user has Maintenance.insert permission
echo   • Check permission is properly saved in role management
echo   • Try logging out and back in to refresh permissions
echo   • Test with Super Admin first to confirm API fix worked

echo.
echo Test maintenance creation with custom roles now! ????
pause