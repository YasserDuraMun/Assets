-- Check if AssetDisposal table exists and has correct structure
USE [AssetsManagement];

-- Check table structure
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'AssetDisposals'
ORDER BY ORDINAL_POSITION;

-- Check if any disposal records exist
SELECT COUNT(*) AS DisposalCount FROM AssetDisposals;

-- Check available disposal reasons (enum values should be 1-8)
SELECT 'DisposalReason enum values: 1=Damaged, 2=Obsolete, 3=Lost, 4=Stolen, 5=EndOfLife, 6=Maintenance, 7=Replacement, 99=Other';