@echo off
echo Creating remaining security tables and relationships...

echo Creating UserRoles table...
sqlcmd -S "10.0.0.17" -U "sa" -P "Dur@123456" -d "Assets" -Q "IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserRoles') CREATE TABLE [dbo].[UserRoles]([UserRoleId] [int] IDENTITY(1,1) NOT NULL, [UserId] [int] NOT NULL, [RoleId] [int] NOT NULL, [AssignedAt] [datetime2](7) NOT NULL DEFAULT GETUTCDATE(), CONSTRAINT [PK_UserRoles] PRIMARY KEY CLUSTERED ([UserRoleId] ASC));"

echo Creating Permissions table...
sqlcmd -S "10.0.0.17" -U "sa" -P "Dur@123456" -d "Assets" -Q "IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Permissions') CREATE TABLE [dbo].[Permissions]([PermissionId] [int] IDENTITY(1,1) NOT NULL, [RoleID] [int] NOT NULL, [ScreenID] [int] NOT NULL, [AllowInsert] [bit] NOT NULL DEFAULT 0, [AllowUpdate] [bit] NOT NULL DEFAULT 0, [AllowDelete] [bit] NOT NULL DEFAULT 0, [AllowView] [bit] NOT NULL DEFAULT 0, CONSTRAINT [PK_Permissions] PRIMARY KEY CLUSTERED ([PermissionId] ASC));"

echo Creating Foreign Key constraints...
sqlcmd -S "10.0.0.17" -U "sa" -P "Dur@123456" -d "Assets" -Q "
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_UserRoles_SecurityUsers_UserId')
    ALTER TABLE [dbo].[UserRoles] ADD CONSTRAINT [FK_UserRoles_SecurityUsers_UserId] FOREIGN KEY([UserId]) REFERENCES [dbo].[SecurityUsers] ([Id]) ON DELETE CASCADE;
    
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_UserRoles_Roles_RoleId')
    ALTER TABLE [dbo].[UserRoles] ADD CONSTRAINT [FK_UserRoles_Roles_RoleId] FOREIGN KEY([RoleId]) REFERENCES [dbo].[Roles] ([RoleId]) ON DELETE CASCADE;
    
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Permissions_Roles_RoleID')
    ALTER TABLE [dbo].[Permissions] ADD CONSTRAINT [FK_Permissions_Roles_RoleID] FOREIGN KEY([RoleID]) REFERENCES [dbo].[Roles] ([RoleId]) ON DELETE CASCADE;
    
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Permissions_Screens_ScreenID')
    ALTER TABLE [dbo].[Permissions] ADD CONSTRAINT [FK_Permissions_Screens_ScreenID] FOREIGN KEY([ScreenID]) REFERENCES [dbo].[Screens] ([ScreenID]) ON DELETE CASCADE;
"

echo Creating unique constraints...
sqlcmd -S "10.0.0.17" -U "sa" -P "Dur@123456" -d "Assets" -Q "
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SecurityUsers_Email')
    CREATE UNIQUE NONCLUSTERED INDEX [IX_SecurityUsers_Email] ON [dbo].[SecurityUsers]([Email] ASC);
    
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Permissions_RoleID_ScreenID')
    CREATE UNIQUE NONCLUSTERED INDEX [IX_Permissions_RoleID_ScreenID] ON [dbo].[Permissions]([RoleID] ASC, [ScreenID] ASC);
" 2>nul

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ? Security tables structure created successfully!
    echo.
    echo Now creating initial data...
    echo.
) else (
    echo.
    echo ? Some errors occurred (may be normal if tables already exist)
    echo.
)

pause