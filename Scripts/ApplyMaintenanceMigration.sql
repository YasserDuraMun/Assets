-- Manual Application of Maintenance Migration
-- ????? ???? ?? Migration ???????

USE [AssetsManagement];
GO

PRINT '?? Applying Maintenance System Migration...';

-- Add foreign key to Assets if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_AssetMaintenances_Assets_AssetId')
BEGIN
    PRINT '  - Adding foreign key to Assets...';
    ALTER TABLE [AssetMaintenances]
    ADD CONSTRAINT [FK_AssetMaintenances_Assets_AssetId]
    FOREIGN KEY ([AssetId]) REFERENCES [Assets] ([Id]);
END
ELSE
BEGIN
    PRINT '  ? Foreign key to Assets already exists';
END

-- Add foreign key to Users if it doesn't exist  
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_AssetMaintenances_Users_CreatedBy')
BEGIN
    PRINT '  - Adding foreign key to Users...';
    ALTER TABLE [AssetMaintenances]
    ADD CONSTRAINT [FK_AssetMaintenances_Users_CreatedBy]
    FOREIGN KEY ([CreatedBy]) REFERENCES [Users] ([Id]);
END
ELSE
BEGIN
    PRINT '  ? Foreign key to Users already exists';
END

-- Add indexes for better performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AssetMaintenances_AssetId')
BEGIN
    PRINT '  - Adding AssetId index...';
    CREATE NONCLUSTERED INDEX [IX_AssetMaintenances_AssetId] ON [AssetMaintenances] ([AssetId]);
END
ELSE
BEGIN
    PRINT '  ? AssetId index already exists';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AssetMaintenances_MaintenanceDate')
BEGIN
    PRINT '  - Adding MaintenanceDate index...';
    CREATE NONCLUSTERED INDEX [IX_AssetMaintenances_MaintenanceDate] ON [AssetMaintenances] ([MaintenanceDate]);
END
ELSE
BEGIN
    PRINT '  ? MaintenanceDate index already exists';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AssetMaintenances_Status')
BEGIN
    PRINT '  - Adding Status index...';
    CREATE NONCLUSTERED INDEX [IX_AssetMaintenances_Status] ON [AssetMaintenances] ([Status]);
END
ELSE
BEGIN
    PRINT '  ? Status index already exists';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AssetMaintenances_NextMaintenanceDate')
BEGIN
    PRINT '  - Adding NextMaintenanceDate index...';
    CREATE NONCLUSTERED INDEX [IX_AssetMaintenances_NextMaintenanceDate] ON [AssetMaintenances] ([NextMaintenanceDate]);
END
ELSE
BEGIN
    PRINT '  ? NextMaintenanceDate index already exists';
END

-- Update column constraints if needed
PRINT '  - Updating column constraints...';

-- Currency column
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[AssetMaintenances]') AND name = 'Currency')
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[AssetMaintenances]') AND name = 'Currency' AND max_length = 6)
    BEGIN
        ALTER TABLE [AssetMaintenances] ALTER COLUMN [Currency] NVARCHAR(3) NULL;
        PRINT '    ? Currency column updated';
    END
END

-- Description column
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[AssetMaintenances]') AND name = 'Description')
BEGIN
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[AssetMaintenances]') AND name = 'Description' AND is_nullable = 1)
    BEGIN
        -- Make Description NOT NULL if it's currently nullable
        UPDATE [AssetMaintenances] SET [Description] = '?????' WHERE [Description] IS NULL OR [Description] = '';
        ALTER TABLE [AssetMaintenances] ALTER COLUMN [Description] NVARCHAR(500) NOT NULL;
        PRINT '    ? Description column updated';
    END
END

-- PerformedBy column
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[AssetMaintenances]') AND name = 'PerformedBy')
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[AssetMaintenances]') AND name = 'PerformedBy' AND max_length = 400)
    BEGIN
        ALTER TABLE [AssetMaintenances] ALTER COLUMN [PerformedBy] NVARCHAR(200) NULL;
        PRINT '    ? PerformedBy column updated';
    END
END

-- TechnicianName column
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[AssetMaintenances]') AND name = 'TechnicianName')
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[AssetMaintenances]') AND name = 'TechnicianName' AND max_length = 400)
    BEGIN
        ALTER TABLE [AssetMaintenances] ALTER COLUMN [TechnicianName] NVARCHAR(200) NULL;
        PRINT '    ? TechnicianName column updated';
    END
END

-- CompanyName column
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[AssetMaintenances]') AND name = 'CompanyName')
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[AssetMaintenances]') AND name = 'CompanyName' AND max_length = 400)
    BEGIN
        ALTER TABLE [AssetMaintenances] ALTER COLUMN [CompanyName] NVARCHAR(200) NULL;
        PRINT '    ? CompanyName column updated';
    END
END

-- Notes column
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[AssetMaintenances]') AND name = 'Notes')
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('[AssetMaintenances]') AND name = 'Notes' AND max_length = 2000)
    BEGIN
        ALTER TABLE [AssetMaintenances] ALTER COLUMN [Notes] NVARCHAR(1000) NULL;
        PRINT '    ? Notes column updated';
    END
END

-- Add migration history record
IF NOT EXISTS (SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20260326120000_UpdateAssetMaintenanceConfiguration')
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES ('20260326120000_UpdateAssetMaintenanceConfiguration', '9.0.0');
    PRINT '? Migration history updated';
END

-- Verify table structure
PRINT '';
PRINT '?? Final AssetMaintenances table structure:';
SELECT 
    COLUMN_NAME as [Column],
    DATA_TYPE as [Type],
    IS_NULLABLE as [Nullable],
    ISNULL(CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR(10)), 'N/A') as [MaxLength]
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'AssetMaintenances'
ORDER BY ORDINAL_POSITION;

-- Check record count
DECLARE @RecordCount INT = (SELECT COUNT(*) FROM AssetMaintenances);
PRINT CONCAT('?? Current maintenance records: ', @RecordCount);

-- Check foreign keys
PRINT '';
PRINT '?? Foreign Key Constraints:';
SELECT 
    '  ' + fk.name + ' -> ' + OBJECT_NAME(fk.referenced_object_id) AS [Constraint_Info]
FROM sys.foreign_keys fk
WHERE fk.parent_object_id = OBJECT_ID('AssetMaintenances');

-- Check indexes
PRINT '';
PRINT '?? Indexes:';
SELECT 
    '  ' + i.name + ' (' + STRING_AGG(c.name, ', ') + ')' AS [Index_Info]
FROM sys.indexes i
INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE i.object_id = OBJECT_ID('AssetMaintenances') 
  AND i.index_id > 0  -- Exclude heap
GROUP BY i.name, i.index_id
ORDER BY i.index_id;

PRINT '';
PRINT '=============================================================';
PRINT '? Maintenance System Migration Applied Successfully!';
PRINT '';
PRINT '?? Available Maintenance Types:';
PRINT '   1 = Preventive (????? ??????)';
PRINT '   2 = Corrective (????? ???????)';
PRINT '   3 = Emergency (????? ?????)';
PRINT '';
PRINT '?? Available Maintenance Statuses:';
PRINT '   1 = Scheduled (??????)';
PRINT '   2 = InProgress (??? ???????)';
PRINT '   3 = Completed (??????)';
PRINT '   4 = Cancelled (?????)';
PRINT '';
PRINT '?? Next Steps:';
PRINT '   1. Restart your backend application (F5)';
PRINT '   2. Test API: GET /api/maintenance/test';
PRINT '   3. Test API: GET /api/maintenance/types';
PRINT '   4. Start building the frontend!';
PRINT '';
PRINT '??? Backend Maintenance System is Ready for Municipality Use!';
PRINT '=============================================================';

GO