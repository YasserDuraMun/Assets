-- Add Arabic Sample Data for Dashboard Testing
USE Assets;

-- Update Category names to Arabic
UPDATE Categories SET Name = N'????? ???????' WHERE Name LIKE '%Computer%' OR Name LIKE '%IT%';
UPDATE Categories SET Name = N'???? ?????' WHERE Name LIKE '%Furniture%' OR Name LIKE '%Office%';
UPDATE Categories SET Name = N'??????' WHERE Name LIKE '%Vehicle%' OR Name LIKE '%Car%';
UPDATE Categories SET Name = N'????? ????????' WHERE Name LIKE '%Electric%' OR Name LIKE '%Equipment%';

-- Update Asset Status names to Arabic
UPDATE AssetStatuses SET Name = N'???' WHERE Name = 'Active';
UPDATE AssetStatuses SET Name = N'??? ???' WHERE Name = 'Inactive';
UPDATE AssetStatuses SET Name = N'??? ???????' WHERE Name = 'Under Maintenance';
UPDATE AssetStatuses SET Name = N'????' WHERE Name = 'Disposed';

-- Add sample Arabic asset names if none exist
IF NOT EXISTS (SELECT 1 FROM Assets WHERE Name LIKE N'%????%')
BEGIN
    -- Add sample Arabic assets
    INSERT INTO Assets (Name, SerialNumber, CategoryId, StatusId, CurrentLocationType, CreatedAt)
    SELECT 
        N'???? ??????? ????? - ' + CAST(ROW_NUMBER() OVER(ORDER BY Id) as NVARCHAR(10)),
        'AR-PC-' + RIGHT('000' + CAST(ROW_NUMBER() OVER(ORDER BY Id) as NVARCHAR(10)), 4),
        (SELECT TOP 1 Id FROM Categories WHERE Name LIKE N'%???????%'),
        (SELECT TOP 1 Id FROM AssetStatuses WHERE Name = N'???'),
        1, -- Warehouse
        GETDATE()
    FROM Categories
    WHERE Id <= 3;
END

-- Verify Arabic text
SELECT 'Categories' as TableName, Id, Name FROM Categories WHERE Name LIKE N'%?%'
UNION ALL
SELECT 'AssetStatuses' as TableName, Id, Name FROM AssetStatuses WHERE Name LIKE N'%?%'
UNION ALL  
SELECT 'Assets' as TableName, Id, Name FROM Assets WHERE Name LIKE N'%?%';

PRINT N'?? ????? ???????? ??????? ?????';