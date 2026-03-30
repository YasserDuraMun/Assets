-- Check Database Collation for Arabic Support
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    COLLATION_NAME,
    CHARACTER_SET_NAME
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'Assets'
  AND DATA_TYPE = 'nvarchar'
  AND TABLE_NAME IN ('Categories', 'AssetStatuses', 'Assets')
ORDER BY TABLE_NAME, COLUMN_NAME;

-- Check specific tables for Arabic text
SELECT TOP 5 Id, Name FROM Categories;
SELECT TOP 5 Id, Name FROM AssetStatuses;
SELECT TOP 3 Id, Name FROM Assets;