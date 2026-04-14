@echo off
cls
echo ?? ROLES MANAGEMENT SYSTEM COMPLETE!
echo ====================================

echo ?? NEW FEATURES ADDED:
echo   ? Complete Roles Management System
echo   ? Create, Edit, Delete, Toggle Status for Roles
echo   ? Assign Permissions to Roles (per screen + CRUD actions)
echo   ? Beautiful UI with Statistics Dashboard
echo   ? Backend API with full CRUD operations
echo   ? Security validation and error handling

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting backend with new Roles Management...
start "Backend - Roles Management" cmd /k "echo ??? BACKEND - Roles Management System && echo ===================================== && echo. && echo ?? NEW ENDPOINTS AVAILABLE: && echo   • GET /api/security/roles - Get all roles && echo   • POST /api/security/roles - Create new role && echo   • PUT /api/security/roles/{id} - Update role && echo   • DELETE /api/security/roles/{id} - Delete role && echo   • PATCH /api/security/roles/{id}/toggle-status - Toggle status && echo. && echo ??? SECURITY: && echo   • Super Admin: All operations && echo   • Admin: Create, Update, Toggle (no delete) && echo   • Manager: View only && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 10

echo ?? Starting frontend with Roles Management...
cd ClientApp

start "Frontend - Roles Management" cmd /k "echo ?? FRONTEND - Roles Management System && echo =================================== && echo. && echo ?? TESTING CHECKLIST: && echo. && echo ?? Step 1: Login as Super Admin && echo   • Navigate to '????? ???????' (Roles Management) && echo   • Should see all existing roles with statistics && echo. && echo ?? Step 2: Create New Role && echo   • Click 'Create New Role' button && echo   • Enter role name (e.g., 'HR Manager', 'IT Support') && echo   • Verify role appears in table && echo. && echo ?? Step 3: Assign Permissions && echo   • Click 'Permissions' button for new role && echo   • Toggle permissions for different screens && echo   • Save and verify permissions are applied && echo. && echo ?? Step 4: Test Role Actions && echo   • Edit role name && echo   • Toggle active/inactive status && echo   • Try to delete role (should work for custom roles) && echo. && echo ?? Step 5: Test User Assignment && echo   • Go to User Management && echo   • Assign new role to a user && echo   • Login as that user and verify permissions work && echo. && npm run dev"

echo.
echo ?? ROLES MANAGEMENT SYSTEM READY!
echo =================================
echo.

echo ?? FEATURES OVERVIEW:
echo.
echo ? Roles Management:
echo   • Create custom roles with meaningful names
echo   • Edit role names and status
echo   • Delete roles (if no users assigned)
echo   • Toggle active/inactive status
echo   • View user count per role
echo.
echo ? Permissions Management:
echo   • Assign permissions per screen (13 screens available)
echo   • Granular CRUD permissions (View, Insert, Update, Delete)
echo   • Visual permission matrix with switches
echo   • Bulk permission updates
echo.
echo ? Security Features:
echo   • System roles protection (Super Admin, Admin cannot be deleted)
echo   • User assignment validation (cannot delete roles with users)
echo   • Role hierarchy respect (only admins can manage roles)
echo   • Input validation and error handling
echo.
echo ? User Experience:
echo   • Beautiful gradient UI design
echo   • Statistics dashboard (Total roles, Active roles, Total users)
echo   • Responsive table with actions
echo   • Modal forms with validation
echo   • Success/error messages
echo.

pause

echo ?? WORKFLOW EXAMPLE:
echo ===================
echo.
echo ?? Creating 'HR Manager' Role:
echo   1. Login as Super Admin
echo   2. Go to Roles Management
echo   3. Click 'Create New Role'
echo   4. Enter 'HR Manager'
echo   5. Click 'Permissions' for new role
echo   6. Enable: Dashboard (view), Employees (all), Reports (view)
echo   7. Save permissions
echo   8. Go to User Management
echo   9. Assign HR Manager role to user
echo   10. Login as HR user - should only see allowed screens!
echo.
echo ?? Benefits:
echo   • Fine-grained access control
echo   • Easy role creation and management
echo   • Visual permission assignment
echo   • Secure role hierarchy
echo   • Audit trail for role changes

echo.
echo Ready to revolutionize your role management! ??
pause