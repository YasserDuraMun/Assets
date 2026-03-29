-- ===============================================
-- ?????? ?? ????? ???? ????? ?????? ????????
-- Municipality Disposal System Status Check
-- ===============================================

USE [AssetsManagement];

PRINT '=== Checking Municipality Disposal System Status ===';
PRINT '';

-- 1. ?????? ?? ???? ???? AssetDisposals
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'AssetDisposals')
BEGIN
    PRINT '? AssetDisposals table exists';
    
    -- ??? ???? ??????
    PRINT '?? Table structure:';
    SELECT 
        '  ' + COLUMN_NAME + ' (' + DATA_TYPE + 
        CASE 
            WHEN IS_NULLABLE = 'YES' THEN ', nullable'
            ELSE ', required'
        END + ')' AS [Column_Info]
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'AssetDisposals'
    ORDER BY ORDINAL_POSITION;
    
    -- ??? ???????
    DECLARE @DisposalCount INT = (SELECT COUNT(*) FROM AssetDisposals);
    PRINT CONCAT('?? Current disposal records: ', @DisposalCount);
END
ELSE
BEGIN
    PRINT '? AssetDisposals table does NOT exist!';
    PRINT '?? You need to create the table first.';
END

PRINT '';

-- 2. ?????? ?? ???? ???? Assets
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Assets')
BEGIN
    DECLARE @AssetCount INT = (SELECT COUNT(*) FROM Assets WHERE IsDeleted = 0);
    PRINT CONCAT('? Assets table exists with ', @AssetCount, ' active assets');
END
ELSE
BEGIN
    PRINT '? Assets table does NOT exist!';
END

-- 3. ?????? ?? ???? ???? Users
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users')
BEGIN
    DECLARE @UserCount INT = (SELECT COUNT(*) FROM Users);
    PRINT CONCAT('? Users table exists with ', @UserCount, ' users');
END
ELSE
BEGIN
    PRINT '? Users table does NOT exist!';
END

PRINT '';

-- 4. ?????? ?? Migration history
IF EXISTS (SELECT * FROM __EFMigrationsHistory WHERE MigrationId LIKE '%Disposal%')
BEGIN
    PRINT '? Disposal migrations found:';
    SELECT '  ' + MigrationId AS [Applied_Migrations]
    FROM __EFMigrationsHistory 
    WHERE MigrationId LIKE '%Disposal%'
    ORDER BY MigrationId;
END
ELSE
BEGIN
    PRINT '?? No disposal migrations found in history';
END

PRINT '';

-- 5. ?????? ????? ?????? ??????? (???? ???)
BEGIN TRANSACTION TestTransaction;

IF EXISTS (SELECT 1 FROM Assets WHERE IsDeleted = 0) AND EXISTS (SELECT 1 FROM Users)
BEGIN
    DECLARE @TestAssetId INT = (SELECT TOP 1 Id FROM Assets WHERE IsDeleted = 0);
    DECLARE @TestUserId INT = (SELECT TOP 1 Id FROM Users);
    
    PRINT '?? Testing disposal insertion...';
    
    BEGIN TRY
        -- ?????? ????? ??????
        INSERT INTO AssetDisposals (
            AssetId, DisposalDate, DisposalReason, 
            Notes, PerformedBy, CreatedAt
        ) VALUES (
            @TestAssetId, GETUTCDATE(), 1, 
            'Test disposal - will be rolled back', @TestUserId, GETUTCDATE()
        );
        
        PRINT '? Test insertion successful - disposal table is ready!';
    END TRY
    BEGIN CATCH
        PRINT '? Test insertion failed:';
        PRINT CONCAT('   Error: ', ERROR_MESSAGE());
    END CATCH
END

ROLLBACK TRANSACTION TestTransaction;
PRINT '?? Test transaction rolled back (no data saved)';

PRINT '';
PRINT '=== Summary ===';

-- 6. ????? ??????
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'AssetDisposals')
   AND EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Assets')
   AND EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users')
BEGIN
    PRINT '? DATABASE IS READY for disposal system!';
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
    PRINT '?? Next steps:';
    PRINT '   1. Restart your backend application';
    PRINT '   2. Test disposal API: GET /api/disposals/reasons';
    PRINT '   3. Try disposing an asset from the frontend';
END
ELSE
BEGIN
    PRINT '? DATABASE SETUP INCOMPLETE!';
    PRINT '?? Run SetupMunicipalityDisposal.sql first';
END

PRINT '';
PRINT '===============================================';