-- =============================================================
-- ????? ????? ????? ?????? ????????
-- Municipality Asset Disposal Model Simplification
-- =============================================================

USE [AssetsManagement];
GO

PRINT 'Starting Municipality Asset Disposal Simplification...';

-- 1. ????? ???? AssetDisposals ??? ?? ??? ???????
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'AssetDisposals')
BEGIN
    PRINT 'Creating AssetDisposals table...';
    
    CREATE TABLE [AssetDisposals] (
        [Id] int IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [AssetId] int NOT NULL,
        [DisposalDate] datetime2 NOT NULL,
        [DisposalReason] int NOT NULL,
        [Notes] nvarchar(500) NULL,
        [PerformedBy] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
        
        -- Foreign Keys
        CONSTRAINT [FK_AssetDisposals_Assets_AssetId] 
            FOREIGN KEY ([AssetId]) REFERENCES [Assets] ([Id]),
        CONSTRAINT [FK_AssetDisposals_Users_PerformedBy] 
            FOREIGN KEY ([PerformedBy]) REFERENCES [Users] ([Id])
    );
    
    -- Indexes
    CREATE NONCLUSTERED INDEX [IX_AssetDisposals_AssetId] ON [AssetDisposals] ([AssetId]);
    CREATE NONCLUSTERED INDEX [IX_AssetDisposals_PerformedBy] ON [AssetDisposals] ([PerformedBy]);
    CREATE NONCLUSTERED INDEX [IX_AssetDisposals_DisposalDate] ON [AssetDisposals] ([DisposalDate]);
    CREATE NONCLUSTERED INDEX [IX_AssetDisposals_DisposalReason] ON [AssetDisposals] ([DisposalReason]);
    
    PRINT 'AssetDisposals table created successfully.';
END
ELSE
BEGIN
    PRINT 'AssetDisposals table already exists. Checking structure...';
    
    -- 2. ????? ??????? ??? ???????? ????????
    IF COL_LENGTH('AssetDisposals', 'DetailedReason') IS NOT NULL
    BEGIN
        PRINT 'Removing DetailedReason column (merged into Notes)...';
        ALTER TABLE AssetDisposals DROP COLUMN DetailedReason;
    END

    IF COL_LENGTH('AssetDisposals', 'DisposalMethod') IS NOT NULL
    BEGIN
        PRINT 'Removing DisposalMethod column (not needed for municipality)...';
        ALTER TABLE AssetDisposals DROP COLUMN DisposalMethod;
    END

    IF COL_LENGTH('AssetDisposals', 'DisposalDocumentPath') IS NOT NULL
    BEGIN
        PRINT 'Removing DisposalDocumentPath column (simplified approach)...';
        ALTER TABLE AssetDisposals DROP COLUMN DisposalDocumentPath;
    END

    IF COL_LENGTH('AssetDisposals', 'HasDocument') IS NOT NULL
    BEGIN
        PRINT 'Removing HasDocument column (simplified approach)...';
        ALTER TABLE AssetDisposals DROP COLUMN HasDocument;
    END

    -- 3. ?????? ?? ???? ??????? ????????
    IF COL_LENGTH('AssetDisposals', 'Notes') IS NULL
    BEGIN
        PRINT 'Adding Notes column...';
        ALTER TABLE AssetDisposals ADD Notes NVARCHAR(500) NULL;
    END
    ELSE
    BEGIN
        PRINT 'Updating Notes column constraints...';
        ALTER TABLE AssetDisposals ALTER COLUMN Notes NVARCHAR(500) NULL;
    END
END

-- 4. ????? ???????? ???????? (??? ???? ??????)
IF EXISTS (SELECT 1 FROM AssetDisposals)
BEGIN
    PRINT 'Cleaning existing disposal data...';
    
    -- ????? ????? ??????? ??????? ?? ??????? ???????
    UPDATE AssetDisposals 
    SET DisposalReason = 99 -- Other
    WHERE DisposalReason NOT IN (1,2,3,4,5,6,7,99);
    
    PRINT CONCAT('Updated ', @@ROWCOUNT, ' disposal records.');
END

-- 5. ????? ?????? ??????? ???????? (???????)
IF NOT EXISTS (SELECT 1 FROM AssetDisposals) AND EXISTS (SELECT 1 FROM Assets WHERE IsDeleted = 0)
BEGIN
    PRINT 'No disposal records found. You can now test the disposal feature!';
END

-- 6. ??? ?????? ???????
PRINT 'Final AssetDisposals table structure:';
SELECT 
    COLUMN_NAME as [Column],
    DATA_TYPE as [Type],
    IS_NULLABLE as [Nullable],
    ISNULL(CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR(10)), 'N/A') as [MaxLength]
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'AssetDisposals'
ORDER BY ORDINAL_POSITION;

-- 7. ??? ??? ???????
DECLARE @DisposalCount INT = (SELECT COUNT(*) FROM AssetDisposals);
PRINT CONCAT('Total disposal records: ', @DisposalCount);

PRINT '';
PRINT '=============================================================';
PRINT '? Municipality Asset Disposal Model Setup Complete!';
PRINT '';
PRINT 'Disposal Reasons for Municipality:';
PRINT '  1 = Damaged (????)';
PRINT '  2 = Obsolete (????)'; 
PRINT '  3 = Lost (?????)';
PRINT '  4 = Stolen (?????)';
PRINT '  5 = EndOfLife (?????? ?????)';
PRINT '  6 = Maintenance (????? ?????)';
PRINT '  7 = Replacement (?? ????????)';
PRINT ' 99 = Other (????)';
PRINT '';
PRINT 'Now restart your backend application and test the disposal feature!';
PRINT '=============================================================';
GO