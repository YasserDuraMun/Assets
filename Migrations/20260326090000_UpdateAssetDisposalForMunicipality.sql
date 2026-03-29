-- ===============================================
-- Migration: UpdateAssetDisposalForMunicipality
-- ????? ??????? ???? ????? ?????? ????????
-- ===============================================

USE [AssetsManagement];
GO

PRINT '?? Applying UpdateAssetDisposalForMunicipality Migration...';
PRINT '';

-- 1. Create AssetDisposals table if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'AssetDisposals')
BEGIN
    PRINT '?? Creating AssetDisposals table...';
    
    CREATE TABLE [AssetDisposals] (
        [Id] int IDENTITY(1,1) NOT NULL,
        [AssetId] int NOT NULL,
        [DisposalDate] datetime2 NOT NULL,
        [DisposalReason] int NOT NULL,
        [Notes] nvarchar(500) NULL,
        [PerformedBy] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_AssetDisposals] PRIMARY KEY ([Id])
    );
    
    -- Create indexes
    CREATE NONCLUSTERED INDEX [IX_AssetDisposals_AssetId] ON [AssetDisposals] ([AssetId]);
    CREATE NONCLUSTERED INDEX [IX_AssetDisposals_PerformedBy] ON [AssetDisposals] ([PerformedBy]);
    CREATE NONCLUSTERED INDEX [IX_AssetDisposals_DisposalDate] ON [AssetDisposals] ([DisposalDate]);
    CREATE NONCLUSTERED INDEX [IX_AssetDisposals_DisposalReason] ON [AssetDisposals] ([DisposalReason]);
    
    PRINT '? AssetDisposals table created successfully.';
END
ELSE
BEGIN
    PRINT '? AssetDisposals table already exists.';
    
    -- Clean up existing table structure if needed
    PRINT '?? Cleaning up table structure...';
    
    -- Remove unnecessary columns from complex version
    IF COL_LENGTH('AssetDisposals', 'DetailedReason') IS NOT NULL
    BEGIN
        PRINT '  - Removing DetailedReason column (merged into Notes)...';
        ALTER TABLE AssetDisposals DROP COLUMN DetailedReason;
    END

    IF COL_LENGTH('AssetDisposals', 'DisposalMethod') IS NOT NULL
    BEGIN
        PRINT '  - Removing DisposalMethod column (not needed for municipality)...';
        ALTER TABLE AssetDisposals DROP COLUMN DisposalMethod;
    END

    IF COL_LENGTH('AssetDisposals', 'DisposalDocumentPath') IS NOT NULL
    BEGIN
        PRINT '  - Removing DisposalDocumentPath column (simplified approach)...';
        ALTER TABLE AssetDisposals DROP COLUMN DisposalDocumentPath;
    END

    IF COL_LENGTH('AssetDisposals', 'HasDocument') IS NOT NULL
    BEGIN
        PRINT '  - Removing HasDocument column (simplified approach)...';
        ALTER TABLE AssetDisposals DROP COLUMN HasDocument;
    END

    -- Ensure Notes column has correct constraints
    IF COL_LENGTH('AssetDisposals', 'Notes') IS NOT NULL
    BEGIN
        PRINT '  - Updating Notes column constraints...';
        ALTER TABLE AssetDisposals ALTER COLUMN Notes NVARCHAR(500) NULL;
    END
    ELSE
    BEGIN
        PRINT '  - Adding Notes column...';
        ALTER TABLE AssetDisposals ADD Notes NVARCHAR(500) NULL;
    END
    
    PRINT '? Table structure cleaned up.';
END

PRINT '';

-- 2. Add foreign key constraints if missing
PRINT '?? Ensuring foreign key constraints...';

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_AssetDisposals_Assets_AssetId')
BEGIN
    PRINT '  - Adding foreign key to Assets table...';
    ALTER TABLE [AssetDisposals]
    ADD CONSTRAINT [FK_AssetDisposals_Assets_AssetId]
    FOREIGN KEY ([AssetId]) REFERENCES [Assets] ([Id]) ON DELETE NO ACTION;
    PRINT '? Foreign key to Assets added.';
END
ELSE
BEGIN
    PRINT '? Foreign key to Assets already exists.';
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_AssetDisposals_Users_PerformedBy')
BEGIN
    PRINT '  - Adding foreign key to Users table...';
    ALTER TABLE [AssetDisposals]
    ADD CONSTRAINT [FK_AssetDisposals_Users_PerformedBy]
    FOREIGN KEY ([PerformedBy]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION;
    PRINT '? Foreign key to Users added.';
END
ELSE
BEGIN
    PRINT '? Foreign key to Users already exists.';
END

PRINT '';

-- 3. Clean up existing data
IF EXISTS (SELECT 1 FROM AssetDisposals)
BEGIN
    PRINT '?? Cleaning up existing disposal data...';
    
    DECLARE @UpdatedRows INT;
    UPDATE AssetDisposals 
    SET DisposalReason = 99 
    WHERE DisposalReason NOT IN (1,2,3,4,5,6,7,99);
    
    SET @UpdatedRows = @@ROWCOUNT;
    
    IF @UpdatedRows > 0
    BEGIN
        PRINT CONCAT('? Updated ', @UpdatedRows, ' disposal records with invalid reasons.');
    END
    ELSE
    BEGIN
        PRINT '? All existing disposal records have valid reasons.';
    END
END

-- 4. Update migration history
PRINT '?? Updating migration history...';

IF NOT EXISTS (SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20260326090000_UpdateAssetDisposalForMunicipality')
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES ('20260326090000_UpdateAssetDisposalForMunicipality', '9.0.0');
    PRINT '? Migration history updated.';
END
ELSE
BEGIN
    PRINT '? Migration already recorded in history.';
END

PRINT '';

-- 5. Verify final structure
PRINT '?? Final table verification...';

SELECT 
    COLUMN_NAME as [Column],
    DATA_TYPE as [Type],
    IS_NULLABLE as [Nullable],
    ISNULL(CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR(10)), 'N/A') as [MaxLength]
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'AssetDisposals'
ORDER BY ORDINAL_POSITION;

DECLARE @RecordCount INT = (SELECT COUNT(*) FROM AssetDisposals);
PRINT CONCAT('?? Current disposal records: ', @RecordCount);

PRINT '';
PRINT '==============================================';
PRINT '? UpdateAssetDisposalForMunicipality Migration Applied Successfully!';
PRINT '';
PRINT '?? Available Disposal Reasons:';
PRINT '   1 = Damaged (????)';
PRINT '   2 = Obsolete (????)';
PRINT '   3 = Lost (?????)';
PRINT '   4 = Stolen (?????)';
PRINT '   5 = EndOfLife (?????? ?????)';
PRINT '   6 = Maintenance (????? ?????)';
PRINT '   7 = Replacement (?? ????????)';
PRINT '  99 = Other (????)';
PRINT '';
PRINT '?? Next Steps:';
PRINT '   1. Restart your backend application (F5)';
PRINT '   2. Test API: GET /api/disposals/reasons';
PRINT '   3. Try disposing an asset from frontend';
PRINT '';
PRINT '??? Municipality Asset Disposal System is Ready!';
PRINT '==============================================';

GO