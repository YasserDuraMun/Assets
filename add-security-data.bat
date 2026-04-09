@echo off
echo Adding initial security data (Roles, Screens, Admin User)...

echo Adding Roles...
sqlcmd -S "10.0.0.17" -U "sa" -P "Dur@123456" -d "Assets" -Q "
-- Insert Roles if they don't exist
IF NOT EXISTS (SELECT * FROM Roles WHERE RoleName = 'Super Admin')
    INSERT INTO Roles (RoleName, IsActive) VALUES ('Super Admin', 1);

IF NOT EXISTS (SELECT * FROM Roles WHERE RoleName = 'Admin')
    INSERT INTO Roles (RoleName, IsActive) VALUES ('Admin', 1);

IF NOT EXISTS (SELECT * FROM Roles WHERE RoleName = 'Manager')
    INSERT INTO Roles (RoleName, IsActive) VALUES ('Manager', 1);

IF NOT EXISTS (SELECT * FROM Roles WHERE RoleName = 'Employee')
    INSERT INTO Roles (RoleName, IsActive) VALUES ('Employee', 1);

IF NOT EXISTS (SELECT * FROM Roles WHERE RoleName = 'Viewer')
    INSERT INTO Roles (RoleName, IsActive) VALUES ('Viewer', 1);

SELECT 'Roles created:' as Message, COUNT(*) as Count FROM Roles;
"

echo Adding Screens...
sqlcmd -S "10.0.0.17" -U "sa" -P "Dur@123456" -d "Assets" -Q "
-- Insert Screens if they don't exist
IF NOT EXISTS (SELECT * FROM Screens WHERE ScreenName = 'Dashboard')
    INSERT INTO Screens (ScreenName, SType, Hint) VALUES ('Dashboard', 'Main', N'?????? ????????');

IF NOT EXISTS (SELECT * FROM Screens WHERE ScreenName = 'Assets')
    INSERT INTO Screens (ScreenName, SType, Hint) VALUES ('Assets', 'Management', N'????? ??????');

IF NOT EXISTS (SELECT * FROM Screens WHERE ScreenName = 'Users')
    INSERT INTO Screens (ScreenName, SType, Hint) VALUES ('Users', 'Security', N'????? ??????????');

IF NOT EXISTS (SELECT * FROM Screens WHERE ScreenName = 'Roles')
    INSERT INTO Screens (ScreenName, SType, Hint) VALUES ('Roles', 'Security', N'????? ???????');

IF NOT EXISTS (SELECT * FROM Screens WHERE ScreenName = 'Permissions')
    INSERT INTO Screens (ScreenName, SType, Hint) VALUES ('Permissions', 'Security', N'????? ?????????');

IF NOT EXISTS (SELECT * FROM Screens WHERE ScreenName = 'Reports')
    INSERT INTO Screens (ScreenName, SType, Hint) VALUES ('Reports', 'Reports', N'????????');

SELECT 'Screens created:' as Message, COUNT(*) as Count FROM Screens;
"

echo Adding Admin User...
sqlcmd -S "10.0.0.17" -U "sa" -P "Dur@123456" -d "Assets" -Q "
-- Create Admin User (Password: Admin@123)
-- BCrypt hash for 'Admin@123'
DECLARE @AdminUserId INT;

IF NOT EXISTS (SELECT * FROM SecurityUsers WHERE Email = 'admin@assets.ps')
BEGIN
    INSERT INTO SecurityUsers (FullName, Email, PasswordHash, IsActive, CreatedAt) 
    VALUES (N'?????? ?????', 'admin@assets.ps', '$2a$11$6EzRdHPuVokAae3VWLOL2uMH6.KSQs3zJynGEIkvMNcWWbr/vP4N6', 1, GETUTCDATE());
    
    SET @AdminUserId = SCOPE_IDENTITY();
    PRINT 'Admin user created with ID: ' + CAST(@AdminUserId AS VARCHAR(10));
    
    -- Assign Super Admin role
    DECLARE @SuperAdminRoleId INT = (SELECT RoleId FROM Roles WHERE RoleName = 'Super Admin');
    
    IF @SuperAdminRoleId IS NOT NULL
    BEGIN
        INSERT INTO UserRoles (UserId, RoleId, AssignedAt) 
        VALUES (@AdminUserId, @SuperAdminRoleId, GETUTCDATE());
        
        PRINT 'Super Admin role assigned to admin user';
    END
END
ELSE
BEGIN
    PRINT 'Admin user already exists';
END

SELECT 'Admin User:' as Type, FullName, Email, IsActive FROM SecurityUsers WHERE Email = 'admin@assets.ps';
"

echo Adding Super Admin Permissions...
sqlcmd -S "10.0.0.17" -U "sa" -P "Dur@123456" -d "Assets" -Q "
-- Give Super Admin all permissions
DECLARE @SuperAdminRoleId INT = (SELECT RoleId FROM Roles WHERE RoleName = 'Super Admin');

-- Delete existing permissions for Super Admin to avoid duplicates
DELETE FROM Permissions WHERE RoleID = @SuperAdminRoleId;

-- Add full permissions for all screens
INSERT INTO Permissions (RoleID, ScreenID, AllowView, AllowInsert, AllowUpdate, AllowDelete)
SELECT @SuperAdminRoleId, ScreenID, 1, 1, 1, 1
FROM Screens;

SELECT 'Permissions created for Super Admin:' as Message, COUNT(*) as Count 
FROM Permissions WHERE RoleID = @SuperAdminRoleId;
"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ? Initial security data created successfully!
    echo.
    echo Default Admin User:
    echo Email: admin@assets.ps
    echo Password: Admin@123
    echo Role: Super Admin
    echo.
    echo You can now test the system!
    echo.
) else (
    echo.
    echo ? Error creating initial data
    echo.
)

pause