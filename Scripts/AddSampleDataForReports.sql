-- Add Sample Data for Reports Testing
USE Assets;

-- Check if we have assets
IF (SELECT COUNT(*) FROM Assets WHERE IsDeleted = 0) < 5
BEGIN
    PRINT 'Adding sample assets for reports testing...';
    
    -- Ensure we have categories
    IF NOT EXISTS (SELECT 1 FROM Categories WHERE Name = 'Computers')
    BEGIN
        INSERT INTO Categories (Name, Description, IsActive, CreatedAt)
        VALUES 
            ('Computers', 'Computer equipment and hardware', 1, GETDATE()),
            ('Furniture', 'Office furniture and equipment', 1, GETDATE()),
            ('Vehicles', 'Company vehicles and transportation', 1, GETDATE());
    END;
    
    -- Ensure we have asset statuses
    IF NOT EXISTS (SELECT 1 FROM AssetStatuses WHERE Name = 'Active')
    BEGIN
        INSERT INTO AssetStatuses (Name, Description, IsActive, Color, CreatedAt)
        VALUES 
            ('Active', 'Asset is in active use', 1, '#52c41a', GETDATE()),
            ('Inactive', 'Asset is not currently in use', 1, '#faad14', GETDATE()),
            ('Under Maintenance', 'Asset is being maintained', 1, '#1890ff', GETDATE()),
            ('Disposed', 'Asset has been disposed', 1, '#f5222d', GETDATE());
    END;
    
    -- Add sample assets
    DECLARE @ComputerCatId INT = (SELECT TOP 1 Id FROM Categories WHERE Name = 'Computers');
    DECLARE @FurnitureCatId INT = (SELECT TOP 1 Id FROM Categories WHERE Name = 'Furniture');
    DECLARE @VehicleCatId INT = (SELECT TOP 1 Id FROM Categories WHERE Name = 'Vehicles');
    
    DECLARE @ActiveStatusId INT = (SELECT TOP 1 Id FROM AssetStatuses WHERE Name = 'Active');
    DECLARE @InactiveStatusId INT = (SELECT TOP 1 Id FROM AssetStatuses WHERE Name = 'Inactive');
    
    IF @ComputerCatId IS NOT NULL AND @ActiveStatusId IS NOT NULL
    BEGIN
        INSERT INTO Assets (Name, SerialNumber, CategoryId, StatusId, PurchasePrice, PurchaseDate, CurrentLocationType, IsDeleted, CreatedAt)
        VALUES 
            ('Dell Laptop L001', 'DL-001-2024', @ComputerCatId, @ActiveStatusId, 3500.00, DATEADD(day, -90, GETDATE()), 1, 0, DATEADD(day, -90, GETDATE())),
            ('HP Desktop D001', 'HP-D001-2024', @ComputerCatId, @ActiveStatusId, 2800.00, DATEADD(day, -80, GETDATE()), 1, 0, DATEADD(day, -80, GETDATE())),
            ('MacBook Pro M001', 'MBP-M001-2024', @ComputerCatId, @ActiveStatusId, 8500.00, DATEADD(day, -70, GETDATE()), 1, 0, DATEADD(day, -70, GETDATE())),
            ('Lenovo ThinkPad T001', 'LT-T001-2024', @ComputerCatId, @InactiveStatusId, 4200.00, DATEADD(day, -60, GETDATE()), 1, 0, DATEADD(day, -60, GETDATE())),
            ('Surface Pro S001', 'SP-S001-2024', @ComputerCatId, @ActiveStatusId, 5500.00, DATEADD(day, -50, GETDATE()), 1, 0, DATEADD(day, -50, GETDATE()));
    END;
    
    IF @FurnitureCatId IS NOT NULL AND @ActiveStatusId IS NOT NULL
    BEGIN
        INSERT INTO Assets (Name, SerialNumber, CategoryId, StatusId, PurchasePrice, PurchaseDate, CurrentLocationType, IsDeleted, CreatedAt)
        VALUES 
            ('Executive Desk ED001', 'ED-001-2024', @FurnitureCatId, @ActiveStatusId, 1200.00, DATEADD(day, -40, GETDATE()), 1, 0, DATEADD(day, -40, GETDATE())),
            ('Office Chair OC001', 'OC-001-2024', @FurnitureCatId, @ActiveStatusId, 650.00, DATEADD(day, -35, GETDATE()), 1, 0, DATEADD(day, -35, GETDATE())),
            ('Meeting Table MT001', 'MT-001-2024', @FurnitureCatId, @ActiveStatusId, 2100.00, DATEADD(day, -30, GETDATE()), 1, 0, DATEADD(day, -30, GETDATE()));
    END;
    
    IF @VehicleCatId IS NOT NULL AND @ActiveStatusId IS NOT NULL
    BEGIN
        INSERT INTO Assets (Name, SerialNumber, CategoryId, StatusId, PurchasePrice, PurchaseDate, CurrentLocationType, IsDeleted, CreatedAt)
        VALUES 
            ('Toyota Camry TC001', 'TC-001-2024', @VehicleCatId, @ActiveStatusId, 95000.00, DATEADD(day, -25, GETDATE()), 1, 0, DATEADD(day, -25, GETDATE())),
            ('Honda Accord HA001', 'HA-001-2024', @VehicleCatId, @ActiveStatusId, 87000.00, DATEADD(day, -20, GETDATE()), 1, 0, DATEADD(day, -20, GETDATE()));
    END;
    
    PRINT 'Sample assets added successfully!';
END
ELSE
BEGIN
    PRINT 'Sufficient assets already exist in database.';
END;

-- Verify the data
SELECT 'Asset Count Check' as CheckType, COUNT(*) as Count FROM Assets WHERE IsDeleted = 0;
SELECT 'Categories Count' as CheckType, COUNT(*) as Count FROM Categories WHERE IsActive = 1;
SELECT 'Status Count' as CheckType, COUNT(*) as Count FROM AssetStatuses WHERE IsActive = 1;

-- Show sample of assets by category
SELECT 
    c.Name as Category,
    COUNT(*) as AssetCount,
    SUM(a.PurchasePrice) as TotalValue
FROM Assets a
INNER JOIN Categories c ON a.CategoryId = c.Id
WHERE a.IsDeleted = 0
GROUP BY c.Name;

PRINT 'Sample data setup complete. Reports should now show data.';