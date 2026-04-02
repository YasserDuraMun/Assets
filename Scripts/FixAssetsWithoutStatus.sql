-- Fix Assets without Status
USE Assets;
GO

-- Find or create a default status (use one of the existing statuses)
-- Based on your data, let's use "جيد" (Id = 8) as the default status

DECLARE @DefaultStatusId INT = 8; -- "جيد" status

-- 1. Check how many assets need fixing
SELECT COUNT(*) as AssetsNeedingStatus
FROM Assets
WHERE IsDeleted = 0 AND StatusId IS NULL;

-- 2. Update assets without StatusId to use the default status
UPDATE Assets
SET StatusId = @DefaultStatusId
WHERE IsDeleted = 0 AND StatusId IS NULL;

-- 3. Verify the update
SELECT 
    'Total Active Assets' as Category,
    COUNT(*) as Count
FROM Assets
WHERE IsDeleted = 0
UNION ALL
SELECT 
    'Assets with StatusId' as Category,
    COUNT(*) as Count
FROM Assets
WHERE IsDeleted = 0 AND StatusId IS NOT NULL
UNION ALL
SELECT 
    'Assets without StatusId' as Category,
    COUNT(*) as Count
FROM Assets
WHERE IsDeleted = 0 AND StatusId IS NULL;

-- 4. Show distribution by status
SELECT 
    s.Name as StatusName,
    s.Code as StatusCode,
    COUNT(a.Id) as AssetCount
FROM Assets a
INNER JOIN AssetStatuses s ON a.StatusId = s.Id
WHERE a.IsDeleted = 0
GROUP BY s.Name, s.Code
ORDER BY AssetCount DESC;

PRINT 'Assets fixed successfully. All active assets now have a status.';
