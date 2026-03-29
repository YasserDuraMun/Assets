-- Manual Migration Application Script
-- Run this in SQL Server Management Studio or Visual Studio SQL Server Object Explorer

USE AssetsManagement;

-- Add Department and Section fields to AssetMovements table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'AssetMovements' AND COLUMN_NAME = 'FromDepartmentId')
BEGIN
    ALTER TABLE AssetMovements ADD FromDepartmentId int NULL;
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'AssetMovements' AND COLUMN_NAME = 'FromSectionId')
BEGIN
    ALTER TABLE AssetMovements ADD FromSectionId int NULL;
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'AssetMovements' AND COLUMN_NAME = 'ToDepartmentId')
BEGIN
    ALTER TABLE AssetMovements ADD ToDepartmentId int NULL;
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'AssetMovements' AND COLUMN_NAME = 'ToSectionId')
BEGIN
    ALTER TABLE AssetMovements ADD ToSectionId int NULL;
END

-- Add foreign key constraints (with IF NOT EXISTS checks)
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_AssetMovements_Departments_FromDepartmentId')
BEGIN
    ALTER TABLE AssetMovements ADD CONSTRAINT FK_AssetMovements_Departments_FromDepartmentId 
        FOREIGN KEY (FromDepartmentId) REFERENCES Departments(Id);
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_AssetMovements_Departments_ToDepartmentId')
BEGIN
    ALTER TABLE AssetMovements ADD CONSTRAINT FK_AssetMovements_Departments_ToDepartmentId 
        FOREIGN KEY (ToDepartmentId) REFERENCES Departments(Id);
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_AssetMovements_Sections_FromSectionId')
BEGIN
    ALTER TABLE AssetMovements ADD CONSTRAINT FK_AssetMovements_Sections_FromSectionId 
        FOREIGN KEY (FromSectionId) REFERENCES Sections(Id);
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_AssetMovements_Sections_ToSectionId')
BEGIN
    ALTER TABLE AssetMovements ADD CONSTRAINT FK_AssetMovements_Sections_ToSectionId 
        FOREIGN KEY (ToSectionId) REFERENCES Sections(Id);
END

-- Add indexes for better performance (with IF NOT EXISTS checks)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AssetMovements_FromDepartmentId')
BEGIN
    CREATE INDEX IX_AssetMovements_FromDepartmentId ON AssetMovements(FromDepartmentId);
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AssetMovements_FromSectionId')
BEGIN
    CREATE INDEX IX_AssetMovements_FromSectionId ON AssetMovements(FromSectionId);
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AssetMovements_ToDepartmentId')
BEGIN
    CREATE INDEX IX_AssetMovements_ToDepartmentId ON AssetMovements(ToDepartmentId);
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AssetMovements_ToSectionId')
BEGIN
    CREATE INDEX IX_AssetMovements_ToSectionId ON AssetMovements(ToSectionId);
END

-- Update Migration History
IF NOT EXISTS (SELECT * FROM __EFMigrationsHistory WHERE MigrationId = '20260325130000_AddDepartmentSectionToAssetMovement')
BEGIN
    INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion)
    VALUES ('20260325130000_AddDepartmentSectionToAssetMovement', '9.0.1');
END

PRINT 'Migration applied successfully!';