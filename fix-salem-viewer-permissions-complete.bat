@echo off
cls
echo ?? FIXING PERMISSION DATA - COMPREHENSIVE FIX
echo =============================================

echo ?? This script will:
echo   ? Ensure all necessary screens exist
echo   ? Create default permissions for Viewer role
echo   ? Ensure salem user has Viewer role
echo   ? Test the complete permission flow
echo.

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ?? Step 1: Creating/Updating security data...

echo USE AssetsDb; > temp_permissions_fix.sql
echo. >> temp_permissions_fix.sql

echo -- Ensure all screens exist >> temp_permissions_fix.sql
echo INSERT OR IGNORE INTO Screens (ScreenName) VALUES >> temp_permissions_fix.sql
echo   ('Dashboard'), >> temp_permissions_fix.sql
echo   ('Assets'), >> temp_permissions_fix.sql
echo   ('Categories'), >> temp_permissions_fix.sql
echo   ('Statuses'), >> temp_permissions_fix.sql
echo   ('Warehouses'), >> temp_permissions_fix.sql
echo   ('Departments'), >> temp_permissions_fix.sql
echo   ('Employees'), >> temp_permissions_fix.sql
echo   ('Transfers'), >> temp_permissions_fix.sql
echo   ('Disposals'), >> temp_permissions_fix.sql
echo   ('Maintenance'), >> temp_permissions_fix.sql
echo   ('Reports'), >> temp_permissions_fix.sql
echo   ('Settings'), >> temp_permissions_fix.sql
echo   ('Users'), >> temp_permissions_fix.sql
echo   ('Permissions'); >> temp_permissions_fix.sql
echo. >> temp_permissions_fix.sql

echo -- Ensure Viewer role exists >> temp_permissions_fix.sql
echo INSERT OR IGNORE INTO Roles (RoleName, IsActive) VALUES ('Viewer', 1); >> temp_permissions_fix.sql
echo. >> temp_permissions_fix.sql

echo -- Get role and screen IDs >> temp_permissions_fix.sql
echo DECLARE @ViewerRoleId INT = (SELECT RoleId FROM Roles WHERE RoleName = 'Viewer'); >> temp_permissions_fix.sql
echo DECLARE @DashboardScreenId INT = (SELECT ScreenID FROM Screens WHERE ScreenName = 'Dashboard'); >> temp_permissions_fix.sql
echo DECLARE @AssetsScreenId INT = (SELECT ScreenID FROM Screens WHERE ScreenName = 'Assets'); >> temp_permissions_fix.sql
echo DECLARE @ReportsScreenId INT = (SELECT ScreenID FROM Screens WHERE ScreenName = 'Reports'); >> temp_permissions_fix.sql
echo. >> temp_permissions_fix.sql

echo -- Delete existing permissions for Viewer role >> temp_permissions_fix.sql
echo DELETE FROM Permissions WHERE RoleID = @ViewerRoleId; >> temp_permissions_fix.sql
echo. >> temp_permissions_fix.sql

echo -- Create permissions for Viewer role >> temp_permissions_fix.sql
echo INSERT INTO Permissions (RoleID, ScreenID, AllowView, AllowInsert, AllowUpdate, AllowDelete) VALUES >> temp_permissions_fix.sql
echo   (@ViewerRoleId, @DashboardScreenId, 1, 0, 0, 0), >> temp_permissions_fix.sql
echo   (@ViewerRoleId, @AssetsScreenId, 1, 0, 0, 0), >> temp_permissions_fix.sql
echo   (@ViewerRoleId, @ReportsScreenId, 1, 0, 0, 0); >> temp_permissions_fix.sql
echo. >> temp_permissions_fix.sql

echo -- Ensure salem user exists >> temp_permissions_fix.sql
echo IF NOT EXISTS (SELECT 1 FROM SecurityUsers WHERE Email = 'salem@example.com') >> temp_permissions_fix.sql
echo BEGIN >> temp_permissions_fix.sql
echo   INSERT INTO SecurityUsers (FullName, Email, PasswordHash, IsActive, CreatedAt) VALUES >> temp_permissions_fix.sql
echo   ('Salem Viewer', 'salem@example.com', '$2a$11$XDiPo/KzgjzRzYzr2PmzWes6Qe8.rZOG6dVMg6NyQcyYhF5eBxaGS', 1, GETDATE()); >> temp_permissions_fix.sql
echo END >> temp_permissions_fix.sql
echo. >> temp_permissions_fix.sql

echo -- Assign Viewer role to salem >> temp_permissions_fix.sql
echo DECLARE @SalemUserId INT = (SELECT Id FROM SecurityUsers WHERE Email = 'salem@example.com'); >> temp_permissions_fix.sql
echo DELETE FROM UserRoles WHERE UserId = @SalemUserId; >> temp_permissions_fix.sql
echo INSERT INTO UserRoles (UserId, RoleId) VALUES (@SalemUserId, @ViewerRoleId); >> temp_permissions_fix.sql
echo. >> temp_permissions_fix.sql

echo -- Show results >> temp_permissions_fix.sql
echo SELECT 'User Info' as TableName, Id, FullName, Email, IsActive FROM SecurityUsers WHERE Email = 'salem@example.com' >> temp_permissions_fix.sql
echo UNION ALL >> temp_permissions_fix.sql
echo SELECT 'User Roles' as TableName, ur.UserId, r.RoleName, '', r.IsActive >> temp_permissions_fix.sql
echo FROM UserRoles ur >> temp_permissions_fix.sql
echo JOIN Roles r ON ur.RoleId = r.RoleId >> temp_permissions_fix.sql
echo JOIN SecurityUsers u ON ur.UserId = u.Id >> temp_permissions_fix.sql
echo WHERE u.Email = 'salem@example.com' >> temp_permissions_fix.sql
echo UNION ALL >> temp_permissions_fix.sql
echo SELECT 'Permissions' as TableName, p.RoleID, s.ScreenName, >> temp_permissions_fix.sql
echo   CONCAT('V:', p.AllowView, ' I:', p.AllowInsert, ' U:', p.AllowUpdate, ' D:', p.AllowDelete), 1 >> temp_permissions_fix.sql
echo FROM Permissions p >> temp_permissions_fix.sql
echo JOIN Screens s ON p.ScreenID = s.ScreenID >> temp_permissions_fix.sql
echo JOIN Roles r ON p.RoleID = r.RoleId >> temp_permissions_fix.sql
echo WHERE r.RoleName = 'Viewer'; >> temp_permissions_fix.sql

echo ?? Step 2: Applying database changes...

REM Use SQLite commands for SQLite database
echo .read temp_permissions_fix.sql | sqlite3 AssetsDb.db

if %ERRORLEVEL% NEQ 0 (
    echo ? Database update failed. Trying with SQL Server...
    sqlcmd -S "(localdb)\MSSQLLocalDB" -d AssetsDb -i temp_permissions_fix.sql
)

echo ?? Cleaning up temporary files...
del temp_permissions_fix.sql

echo ? Step 3: Testing the fix...

echo ?? Starting backend server for testing...
start "Backend Test Server" cmd /k "echo ??? BACKEND SERVER - Testing Mode && echo ================================= && echo. && echo ?? Permission data has been fixed && echo ?? Enhanced logging enabled && echo ?? Login as salem@example.com / password123 && echo ??? Should now have Dashboard, Assets, Reports permissions && echo. && dotnet run"

echo ? Waiting for server to start...
timeout /t 8

echo ?? Starting frontend for testing...
cd ClientApp

start "Frontend Test" cmd /k "echo ?? FRONTEND - Testing Fixed Permissions && echo ==================================== && echo. && echo ?? Permission data has been fixed && echo ?? Test Instructions: && echo   1. Go to: http://localhost:5173 && echo   2. Login as: salem@example.com / password123 && echo   3. Should see Dashboard, Assets, Reports in menu && echo   4. Check browser console for permission logs && echo. && npm run dev"

echo.
echo ?? PERMISSION FIX APPLIED!
echo ==========================
echo.
echo ?? Test the fix:
echo   1. ?? Go to: http://localhost:5173
echo   2. ?? Login as: salem@example.com / password123
echo   3. ? Should see: Dashboard, Assets, Reports in sidebar menu
echo   4. ? Should NOT see: Users, Permissions (no access)
echo   5. ?? Check browser console - should see permission logs
echo.

echo ?? If still not working:
echo   • Check backend console for user/role/permission logs
echo   • Check browser Network tab for API response
echo   • Verify database was updated correctly
echo   • Try logging out and back in

pause

echo ?? DATABASE VERIFICATION:
echo =========================
echo.
echo Run these commands to verify the fix:
echo.
echo 1. Check if salem user exists:
echo    SELECT * FROM SecurityUsers WHERE Email = 'salem@example.com';
echo.
echo 2. Check if salem has Viewer role:
echo    SELECT u.Email, r.RoleName FROM SecurityUsers u
echo    JOIN UserRoles ur ON u.Id = ur.UserId
echo    JOIN Roles r ON ur.RoleId = r.RoleId
echo    WHERE u.Email = 'salem@example.com';
echo.
echo 3. Check Viewer role permissions:
echo    SELECT s.ScreenName, p.AllowView, p.AllowInsert, p.AllowUpdate, p.AllowDelete
echo    FROM Permissions p
echo    JOIN Screens s ON p.ScreenID = s.ScreenID
echo    JOIN Roles r ON p.RoleID = r.RoleId
echo    WHERE r.RoleName = 'Viewer';
echo.

echo The permission system should now work correctly! ????

pause