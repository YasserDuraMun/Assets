@echo off
cls
echo ?? MAINTENANCE CONTROLLER COMPLETE AUTHORIZATION FIX
echo ==================================================

echo ?? FINAL COMPREHENSIVE FIX APPLIED:
echo   ? All remaining hardcoded roles in MaintenanceController removed
echo   ? ALL endpoints now use RequirePermission attributes
echo   ? Enhanced GetUserIdFromToken method for all user operations
echo   ? Proper authentication checks for CREATE/UPDATE/DELETE operations

echo ?? COMPLETE MAINTENANCE ENDPOINTS FIXED:
echo   ? GET /api/maintenance ? RequirePermission("Maintenance", "view")
echo   ? GET /api/maintenance/{id} ? RequirePermission("Maintenance", "view")
echo   ? GET /api/maintenance/asset/{assetId} ? RequirePermission("Maintenance", "view")
echo   ? GET /api/maintenance/types ? RequirePermission("Maintenance", "view") ? FIXED TODAY
echo   ? GET /api/maintenance/statuses ? RequirePermission("Maintenance", "view") ? FIXED TODAY
echo   ? GET /api/maintenance/upcoming ? RequirePermission("Maintenance", "view") ? FIXED TODAY
echo   ? GET /api/maintenance/overdue ? RequirePermission("Maintenance", "view") ? FIXED TODAY
echo   ? GET /api/maintenance/stats ? RequirePermission("Maintenance", "view") ? FIXED TODAY
echo   ? GET /api/maintenance/stats/asset/{id} ? RequirePermission("Maintenance", "view") ? FIXED TODAY
echo   ? GET /api/maintenance/report/monthly ? RequirePermission("Maintenance", "view") ? FIXED TODAY
echo   ? POST /api/maintenance ? RequirePermission("Maintenance", "insert")
echo   ? POST /api/maintenance/schedule-preventive ? RequirePermission("Maintenance", "insert") ? FIXED TODAY
echo   ? PUT /api/maintenance/{id} ? RequirePermission("Maintenance", "update")
echo   ? POST /api/maintenance/{id}/complete ? RequirePermission("Maintenance", "update")
echo   ? POST /api/maintenance/{id}/cancel ? RequirePermission("Maintenance", "delete")
echo   ? DELETE /api/maintenance/{id} ? RequirePermission("Maintenance", "delete") ? FIXED TODAY

echo ?? MAINTENANCE PERMISSION STRUCTURE:
echo   • Maintenance.view ? Access to all GET endpoints (types, statuses, reports, etc.)
echo   • Maintenance.insert ? Create new maintenance requests and schedule preventive
echo   • Maintenance.update ? Edit maintenance records and mark as complete
echo   • Maintenance.delete ? Cancel maintenance requests and permanent deletion

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting Backend with Complete Maintenance Fix...
start "Backend - Complete Maintenance" cmd /k "echo ??? BACKEND - Complete Maintenance Authorization && echo ============================= && echo. && echo ? MAINTENANCE CONTROLLER 100%% FIXED: && echo   • NO MORE hardcoded roles anywhere && echo   • ALL endpoints use RequirePermission attributes && echo   • Enhanced JWT user ID extraction && echo   • Proper authentication validation && echo. && echo ?? MAINTENANCE TYPES FIX: && echo   • GET /api/maintenance/types now requires Maintenance.view && echo   • MaintenanceModal should load types successfully && echo   • Custom roles with Maintenance permissions can access && echo. && echo ?? USER ID EXTRACTION ENHANCED: && echo   • GetUserIdFromToken checks multiple claim types && echo   • Detailed logging for debugging && echo   • Proper error handling for authentication && echo   • No more fallback to userId = 1 && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 10

echo ?? Starting Frontend Complete Maintenance Test...
cd ClientApp

start "Frontend - Complete Maintenance" cmd /k "echo ?? FRONTEND - Complete Maintenance System Test && echo ============================ && echo. && echo ?? COMPREHENSIVE MAINTENANCE VALIDATION: && echo. && echo ?? Phase 1: Maintenance Types Loading Test && echo   1. Login with user having Maintenance.view permission && echo   2. Navigate to assets and try to create maintenance && echo   3. MaintenanceModal should open successfully && echo   4. Maintenance types dropdown should populate (no 403 error) && echo   5. Maintenance statuses should load correctly && echo. && echo ?? Phase 2: Complete Maintenance Workflow Test && echo   6. Test maintenance creation: && echo      • Fill maintenance form completely && echo      • Select maintenance type from dropdown && echo      • Set maintenance date and description && echo      • Submit form ? Should create successfully && echo   7. Test maintenance management: && echo      • View maintenance records && echo      • Update maintenance details && echo      • Complete maintenance tasks && echo      • Generate maintenance reports && echo. && echo ?? Phase 3: Advanced Maintenance Features && echo   8. Test preventive maintenance scheduling && echo   9. Test overdue maintenance alerts && echo   10. Test upcoming maintenance notifications && echo   11. Test maintenance statistics and reports && echo. && echo ?? Phase 4: Permission-Based Access Validation && echo   12. Test with different permission levels: && echo       • Maintenance.view only ? Can view, not create/edit && echo       • Maintenance.insert ? Can create maintenance && echo       • Maintenance.update ? Can edit and complete && echo       • Maintenance.delete ? Can cancel/delete && echo       • Full permissions ? Complete maintenance management && echo. && npm run dev"

echo.
echo ?? COMPLETE MAINTENANCE SYSTEM FIX READY!
echo ========================================
echo.

echo ?? SUCCESS INDICATORS:
echo.
echo ? Maintenance Types Loading:
echo   ? GET /api/maintenance/types returns 200 OK (not 403)
echo   ? MaintenanceModal loads types dropdown successfully
echo   ? No authentication errors in maintenance form
echo   ? Maintenance statuses load correctly
echo.
echo ? Maintenance CRUD Operations:
echo   ? Can create maintenance requests successfully
echo   ? Can view maintenance history and records
echo   ? Can update maintenance details and status
echo   ? Can complete and cancel maintenance tasks
echo   ? Can generate maintenance reports
echo.
echo ? Advanced Maintenance Features:
echo   ? Preventive maintenance scheduling works
echo   ? Overdue maintenance alerts display
echo   ? Upcoming maintenance notifications
echo   ? Maintenance statistics and analytics
echo   ? Monthly and custom reports generation
echo.
echo ? Permission-Based Maintenance Access:
echo   ? Super Admin: Full maintenance management access
echo   ? Custom roles: Access based on Maintenance permissions
echo   ? View-only users: Can see maintenance data but not modify
echo   ? Unauthorized users: No access to maintenance features
echo.
echo ? If Still Getting 403 Errors:
echo   ? Verify user has required Maintenance permission
echo   ? Check specific operation permission (view/insert/update/delete)
echo   ? Ensure role has been assigned Maintenance screen permissions
echo   ? Test with Super Admin first to confirm API works

pause

echo ?? MAINTENANCE PERMISSION GRANT GUIDE:
echo =====================================
echo.
echo ?? For Basic Maintenance Access (Viewing):
echo   1. Login as Super Admin
echo   2. Go to "????? ??????? ??????????"
echo   3. Select user's role
echo   4. Enable: Maintenance.view ? Required for types, statuses, reports
echo.
echo ?? For Maintenance Management (Full CRUD):
echo   5. Enable all Maintenance permissions:
echo      ? Maintenance.view ? View maintenance data, types, statuses
echo      ? Maintenance.insert ? Create maintenance requests
echo      ? Maintenance.update ? Edit maintenance, mark complete
echo      ? Maintenance.delete ? Cancel/delete maintenance
echo.
echo ?? Maintenance Permission Hierarchy:
echo   • view ? Required for all maintenance screens and dropdowns
echo   • insert ? Allows creating new maintenance requests
echo   • update ? Allows editing and completing maintenance
echo   • delete ? Allows canceling and removing maintenance

echo.
echo ?? EXPECTED FINAL RESULTS:
echo =========================
echo.
echo ? Complete Maintenance System:
echo   • Authentication: JWT-based with reliable user ID extraction ?
echo   • Authorization: Granular permission-based access control ?
echo   • Maintenance Types: Load successfully for authorized users ?
echo   • CRUD Operations: Full create/read/update/delete functionality ?
echo   • Advanced Features: Preventive scheduling, reports, analytics ?
echo   • User Experience: Smooth workflow for maintenance management ?
echo.
echo ? System Reliability:
echo   • No more 403 Forbidden errors on maintenance endpoints
echo   • Consistent permission checking across all operations
echo   • Robust JWT token handling and user authentication
echo   • Clear error messages and proper debugging information
echo   • Scalable permission model for future enhancements

echo.
echo ?? Final validation - complete maintenance system should work now! ???
pause