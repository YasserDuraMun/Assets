@echo off
echo Creating Security Tables without conflicting with existing data...

sqlcmd -S "10.0.0.17" -U "sa" -P "Dur@123456" -d "Assets" -Q "
-- Create Security Tables
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SecurityUsers')
BEGIN
    CREATE TABLE [dbo].[SecurityUsers](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [FullName] [nvarchar](100) NOT NULL,
        [Email] [nvarchar](100) NOT NULL,
        [PasswordHash] [nvarchar](500) NOT NULL,
        [IsActive] [bit] NOT NULL,
        [CreatedAt] [datetime2](7) NOT NULL,
        [UpdatedAt] [datetime2](7) NULL,
        CONSTRAINT [PK_SecurityUsers] PRIMARY KEY CLUSTERED ([Id] ASC)
    );
    CREATE UNIQUE NONCLUSTERED INDEX [IX_SecurityUsers_Email] ON [dbo].[SecurityUsers]([Email] ASC);
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Roles')
BEGIN
    CREATE TABLE [dbo].[Roles](
        [RoleId] [int] IDENTITY(1,1) NOT NULL,
        [RoleName] [nvarchar](100) NOT NULL,
        [IsActive] [bit] NOT NULL,
        CONSTRAINT [PK_Roles] PRIMARY KEY CLUSTERED ([RoleId] ASC)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Screens')
BEGIN
    CREATE TABLE [dbo].[Screens](
        [ScreenID] [int] IDENTITY(1,1) NOT NULL,
        [ScreenName] [nvarchar](100) NOT NULL,
        [SType] [nvarchar](50) NULL,
        [Hint] [nvarchar](200) NULL,
        [MenuOptionGroupName] [nvarchar](100) NULL,
        [MenuOptionID] [int] NULL,
        [MenuOptionName] [nvarchar](100) NULL,
        CONSTRAINT [PK_Screens] PRIMARY KEY CLUSTERED ([ScreenID] ASC)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserRoles')
BEGIN
    CREATE TABLE [dbo].[UserRoles](
        [UserRoleId] [int] IDENTITY(1,1) NOT NULL,
        [UserId] [int] NOT NULL,
        [RoleId] [int] NOT NULL,
        [AssignedAt] [datetime2](7) NOT NULL,
        CONSTRAINT [PK_UserRoles] PRIMARY KEY CLUSTERED ([UserRoleId] ASC),
        CONSTRAINT [FK_UserRoles_SecurityUsers_UserId] FOREIGN KEY([UserId]) REFERENCES [dbo].[SecurityUsers] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_UserRoles_Roles_RoleId] FOREIGN KEY([RoleId]) REFERENCES [dbo].[Roles] ([RoleId]) ON DELETE CASCADE
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Permissions')
BEGIN
    CREATE TABLE [dbo].[Permissions](
        [PermissionId] [int] IDENTITY(1,1) NOT NULL,
        [RoleID] [int] NOT NULL,
        [ScreenID] [int] NOT NULL,
        [AllowInsert] [bit] NOT NULL,
        [AllowUpdate] [bit] NOT NULL,
        [AllowDelete] [bit] NOT NULL,
        [AllowView] [bit] NOT NULL,
        CONSTRAINT [PK_Permissions] PRIMARY KEY CLUSTERED ([PermissionId] ASC),
        CONSTRAINT [FK_Permissions_Roles_RoleID] FOREIGN KEY([RoleID]) REFERENCES [dbo].[Roles] ([RoleId]) ON DELETE CASCADE,
        CONSTRAINT [FK_Permissions_Screens_ScreenID] FOREIGN KEY([ScreenID]) REFERENCES [dbo].[Screens] ([ScreenID]) ON DELETE CASCADE
    );
    CREATE UNIQUE NONCLUSTERED INDEX [IX_Permissions_RoleID_ScreenID] ON [dbo].[Permissions]([RoleID] ASC, [ScreenID] ASC);
END

PRINT 'Security tables created successfully!';
"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ? Security tables created successfully!
    echo.
) else (
    echo.
    echo ? Error creating security tables
    echo.
)

pause