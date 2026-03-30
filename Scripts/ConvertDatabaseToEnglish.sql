-- Convert Database Data to English for Reports
USE Assets;
GO

PRINT 'Converting Categories to English...';

-- Update Categories to English
UPDATE Categories 
SET Name = CASE 
    WHEN Name LIKE '%?????%' OR Name LIKE '%???????%' OR Name LIKE '%Computer%' OR Name LIKE '%IT%' THEN 'Computers & IT'
    WHEN Name LIKE '%????%' OR Name LIKE '%Furniture%' OR Name LIKE '%Office%' THEN 'Office Furniture'
    WHEN Name LIKE '%??????%' OR Name LIKE '%?????%' OR Name LIKE '%Vehicle%' OR Name LIKE '%Car%' THEN 'Vehicles'
    WHEN Name LIKE '%????%' OR Name LIKE '%Electric%' OR Name LIKE '%Equipment%' THEN 'Electrical Equipment'
    WHEN Name LIKE '%?????%' OR Name LIKE '%?????%' OR Name LIKE '%Tools%' THEN 'Tools & Equipment'
    WHEN Name LIKE '%?????%' OR Name LIKE '%????%' OR Name LIKE '%Building%' THEN 'Buildings & Infrastructure'
    ELSE 
        CASE 
            -- If it contains Arabic characters, convert to generic English
            WHEN Name COLLATE Arabic_CI_AS LIKE '%[?-?]%' THEN 'General Equipment'
            ELSE Name -- Keep existing English names
        END
END
WHERE IsActive = 1;

PRINT 'Converting Asset Statuses to English...';

-- Update Asset Statuses to English
UPDATE AssetStatuses 
SET Name = CASE 
    WHEN Name LIKE '%???%' OR Name = 'Active' THEN 'Active'
    WHEN Name LIKE '%??? ???%' OR Name LIKE '%inactive%' THEN 'Inactive'
    WHEN Name LIKE '%?????%' OR Name LIKE '%maintenance%' THEN 'Under Maintenance'
    WHEN Name LIKE '%????%' OR Name LIKE '%????%' OR Name LIKE '%disposed%' THEN 'Disposed'
    WHEN Name LIKE '%?????%' OR Name LIKE '%reserved%' THEN 'Reserved'
    WHEN Name LIKE '%?????%' OR Name LIKE '%lost%' THEN 'Lost'
    ELSE 
        CASE 
            -- If it contains Arabic characters, convert to generic English
            WHEN Name COLLATE Arabic_CI_AS LIKE '%[?-?]%' THEN 'Unknown Status'
            ELSE Name -- Keep existing English names
        END
END
WHERE IsActive = 1;

-- Update Departments to English (if they exist)
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Departments')
BEGIN
    PRINT 'Converting Departments to English...';
    
    UPDATE Departments 
    SET Name = CASE 
        WHEN Name LIKE '%?????%' OR Name LIKE '%IT%' OR Name LIKE '%???????%' THEN 'IT Department'
        WHEN Name LIKE '%?????%' OR Name LIKE '%Finance%' OR Name LIKE '%??????%' THEN 'Finance Department'
        WHEN Name LIKE '%?????%' OR Name LIKE '%HR%' OR Name LIKE '%?????%' THEN 'Human Resources'
        WHEN Name LIKE '%?????%' OR Name LIKE '%Admin%' OR Name LIKE '%??????%' THEN 'Administration'
        WHEN Name LIKE '%?????%' OR Name LIKE '%Engineering%' THEN 'Engineering Department'
        WHEN Name LIKE '%?????%' OR Name LIKE '%Services%' THEN 'Services Department'
        WHEN Name LIKE '%?????%' OR Name LIKE '%Maintenance%' THEN 'Maintenance Department'
        ELSE 
            CASE 
                -- If it contains Arabic characters, convert to generic English
                WHEN Name COLLATE Arabic_CI_AS LIKE '%[?-?]%' THEN 'General Department'
                ELSE Name -- Keep existing English names
            END
    END
    WHERE IsActive = 1;
END;

-- Update Employees names to English format (if they contain Arabic)
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Employees')
BEGIN
    PRINT 'Converting Employee names to English format...';
    
    UPDATE Employees 
    SET FullName = CASE 
        WHEN FullName LIKE '%????%' THEN 'Ahmed Ali'
        WHEN FullName LIKE '%????%' THEN 'Mohammed Hassan'
        WHEN FullName LIKE '%?????%' THEN 'Fatima Ahmed'
        WHEN FullName LIKE '%???%' THEN 'Ali Mohammed'
        WHEN FullName LIKE '%????%' THEN 'Sara Abdullah'
        WHEN FullName LIKE '%????%' THEN 'Khalid Omar'
        WHEN FullName LIKE '%???%' THEN 'Noor Salim'
        ELSE 
            CASE 
                -- If it contains Arabic characters, convert to generic English
                WHEN FullName COLLATE Arabic_CI_AS LIKE '%[?-?]%' THEN 'Employee ' + CAST(Id as VARCHAR(10))
                ELSE FullName -- Keep existing English names
            END
    END
    WHERE IsActive = 1;
END;

-- Update Warehouses to English (if they exist)
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Warehouses')
BEGIN
    PRINT 'Converting Warehouses to English...';
    
    UPDATE Warehouses 
    SET Name = CASE 
        WHEN Name LIKE '%??????%' OR Name LIKE '%????%' THEN 'Main Warehouse'
        WHEN Name LIKE '%?????%' THEN 'Central Warehouse'
        WHEN Name LIKE '%????%' THEN 'Branch Warehouse'
        WHEN Name LIKE '%IT%' OR Name LIKE '%?????%' THEN 'IT Storage'
        ELSE 
            CASE 
                -- If it contains Arabic characters, convert to generic English
                WHEN Name COLLATE Arabic_CI_AS LIKE '%[?-?]%' THEN 'Warehouse ' + CAST(Id as VARCHAR(10))
                ELSE Name -- Keep existing English names
            END
    END
    WHERE IsActive = 1;
END;

-- Add some sample English assets if none exist
IF NOT EXISTS (SELECT 1 FROM Assets WHERE Name NOT LIKE '%[?-?]%' COLLATE Arabic_CI_AS)
BEGIN
    PRINT 'Adding sample English assets...';
    
    DECLARE @ComputersCatId INT = (SELECT TOP 1 Id FROM Categories WHERE Name = 'Computers & IT');
    DECLARE @FurnitureCatId INT = (SELECT TOP 1 Id FROM Categories WHERE Name = 'Office Furniture');
    DECLARE @VehiclesCatId INT = (SELECT TOP 1 Id FROM Categories WHERE Name = 'Vehicles');
    DECLARE @ActiveStatusId INT = (SELECT TOP 1 Id FROM AssetStatuses WHERE Name = 'Active');
    
    IF @ComputersCatId IS NOT NULL AND @ActiveStatusId IS NOT NULL
    BEGIN
        INSERT INTO Assets (Name, SerialNumber, CategoryId, StatusId, PurchasePrice, PurchaseDate, CurrentLocationType, IsDeleted, CreatedAt)
        VALUES 
            ('Dell OptiPlex 7090', 'DELL-PC-001-2026', @ComputersCatId, @ActiveStatusId, 3200.00, DATEADD(day, -45, GETDATE()), 1, 0, DATEADD(day, -45, GETDATE())),
            ('HP LaserJet Pro', 'HP-PR-002-2026', @ComputersCatId, @ActiveStatusId, 1800.00, DATEADD(day, -30, GETDATE()), 1, 0, DATEADD(day, -30, GETDATE())),
            ('Lenovo ThinkCentre M90q', 'LEN-PC-003-2026', @ComputersCatId, @ActiveStatusId, 2850.00, DATEADD(day, -20, GETDATE()), 1, 0, DATEADD(day, -20, GETDATE()));
    END;
    
    IF @FurnitureCatId IS NOT NULL AND @ActiveStatusId IS NOT NULL
    BEGIN
        INSERT INTO Assets (Name, SerialNumber, CategoryId, StatusId, PurchasePrice, PurchaseDate, CurrentLocationType, IsDeleted, CreatedAt)
        VALUES 
            ('Executive Office Desk', 'FUR-DSK-001-2026', @FurnitureCatId, @ActiveStatusId, 1500.00, DATEADD(day, -35, GETDATE()), 1, 0, DATEADD(day, -35, GETDATE())),
            ('Ergonomic Office Chair', 'FUR-CHR-002-2026', @FurnitureCatId, @ActiveStatusId, 850.00, DATEADD(day, -25, GETDATE()), 1, 0, DATEADD(day, -25, GETDATE())),
            ('Conference Table 12-Seat', 'FUR-TBL-003-2026', @FurnitureCatId, @ActiveStatusId, 2800.00, DATEADD(day, -15, GETDATE()), 1, 0, DATEADD(day, -15, GETDATE()));
    END;
END;

-- Verify the changes
PRINT '';
PRINT '=== VERIFICATION RESULTS ===';
PRINT 'Categories (English):';
SELECT Id, Name, Description FROM Categories WHERE IsActive = 1;

PRINT '';
PRINT 'Asset Statuses (English):';
SELECT Id, Name, Description FROM AssetStatuses WHERE IsActive = 1;

PRINT '';
PRINT 'Sample Assets (English):';
SELECT TOP 5 
    a.Id, 
    a.Name, 
    a.SerialNumber,
    c.Name as Category,
    s.Name as Status,
    a.PurchasePrice
FROM Assets a
INNER JOIN Categories c ON a.CategoryId = c.Id
INNER JOIN AssetStatuses s ON a.StatusId = s.Id
WHERE a.IsDeleted = 0
ORDER BY a.CreatedAt DESC;

PRINT '';
PRINT 'Database conversion to English completed successfully!';
PRINT 'Reports should now display in English.';