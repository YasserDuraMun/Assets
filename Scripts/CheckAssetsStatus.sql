-- Check Assets and their Status
USE Assets;
GO

-- 1. Check total assets
SELECT 
    'Total Assets' as Category,
    COUNT(*) as Count
FROM Assets
WHERE IsDeleted = 0;

-- 2. Check assets with StatusId
SELECT 
    'Assets with StatusId' as Category,
    COUNT(*) as Count
FROM Assets
WHERE IsDeleted = 0 AND StatusId IS NOT NULL;

-- 3. Check assets without StatusId
SELECT 
    'Assets without StatusId' as Category,
    COUNT(*) as Count
FROM Assets
WHERE IsDeleted = 0 AND StatusId IS NULL;

-- 4. Check assets by status
SELECT 
    s.Name as StatusName,
    COUNT(a.Id) as AssetCount
FROM Assets a
INNER JOIN AssetStatuses s ON a.StatusId = s.Id
WHERE a.IsDeleted = 0
GROUP BY s.Name
ORDER BY AssetCount DESC;

-- 5. Check assets details with status
SELECT TOP 10
    a.Id,
    a.Name as AssetName,
    a.StatusId,
    s.Name as StatusName,
    a.IsDeleted
FROM Assets a
LEFT JOIN AssetStatuses s ON a.StatusId = s.Id
WHERE a.IsDeleted = 0
ORDER BY a.Id;

PRINT 'Check completed. If assets without StatusId > 0, you need to assign status to those assets.';
