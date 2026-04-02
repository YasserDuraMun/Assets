-- Script to check and fix corrupted Arabic data across all tables
-- Run this script in SQL Server Management Studio or Azure Data Studio

USE Assets;
GO

PRINT '========================================';
PRINT 'Checking for corrupted Arabic data (???)';
PRINT '========================================';
PRINT '';

-- 1. Check Users table
PRINT '1. Users with corrupted names:';
SELECT Id, Username, FullName, Email
FROM Users
WHERE FullName LIKE '%?%';
PRINT '';

-- 2. Check Employees table
PRINT '2. Employees with corrupted names:';
SELECT Id, EmployeeNumber, FullName, JobTitle, DepartmentId
FROM Employees
WHERE FullName LIKE '%?%' OR JobTitle LIKE '%?%';
PRINT '';

-- 3. Check Departments table
PRINT '3. Departments with corrupted names:';
SELECT Id, Name
FROM Departments
WHERE Name LIKE '%?%';
PRINT '';

-- 4. Check Sections table
PRINT '4. Sections with corrupted names:';
SELECT Id, Name, DepartmentId
FROM Sections
WHERE Name LIKE '%?%';
PRINT '';

-- 5. Check Warehouses table
PRINT '5. Warehouses with corrupted names:';
SELECT Id, Name, Location
FROM Warehouses
WHERE Name LIKE '%?%' OR Location LIKE '%?%';
PRINT '';

-- 6. Check Assets table
PRINT '6. Assets with corrupted names:';
SELECT Id, SerialNumber, Name, Description
FROM Assets
WHERE Name LIKE '%?%' OR Description LIKE '%?%';
PRINT '';

-- 7. Check AssetCategories table
PRINT '7. AssetCategories with corrupted names:';
SELECT Id, Name, Code, Description
FROM AssetCategories
WHERE Name LIKE '%?%' OR Description LIKE '%?%';
PRINT '';

-- 8. Check AssetSubCategories table
PRINT '8. AssetSubCategories with corrupted names:';
SELECT Id, Name, Description, CategoryId
FROM AssetSubCategories
WHERE Name LIKE '%?%' OR Description LIKE '%?%';
PRINT '';

-- 9. Check AssetStatuses table
PRINT '9. AssetStatuses with corrupted names:';
SELECT Id, Name, Code, Description
FROM AssetStatuses
WHERE Name LIKE '%?%' OR Description LIKE '%?%';
PRINT '';

-- 10. Check Suppliers table
PRINT '10. Suppliers with corrupted names:';
SELECT Id, Name, ContactPerson, Address
FROM Suppliers
WHERE Name LIKE '%?%' OR ContactPerson LIKE '%?%' OR Address LIKE '%?%';
PRINT '';

PRINT '========================================';
PRINT 'Fix Instructions:';
PRINT '========================================';
PRINT 'Use UPDATE statements with N prefix to fix corrupted data:';
PRINT '';
PRINT 'Example for Users:';
PRINT 'UPDATE Users SET FullName = N''أحمد محمد'' WHERE Id = 1;';
PRINT '';
PRINT 'Example for Departments:';
PRINT 'UPDATE Departments SET Name = N''قسم تقنية المعلومات'' WHERE Id = 1;';
PRINT '';
PRINT 'Example for Employees:';
PRINT 'UPDATE Employees SET FullName = N''فاطمة علي'', JobTitle = N''مهندسة برمجيات'' WHERE Id = 1;';
PRINT '';
PRINT 'IMPORTANT: Always use N prefix before Arabic text to ensure Unicode encoding!';
PRINT '';

-- Optional: Quick fix for AssetStatuses (common data)
PRINT '========================================';
PRINT 'Quick fix for AssetStatuses (if needed):';
PRINT '========================================';
/*
UPDATE AssetStatuses SET Name = N'جديد' WHERE Code = 'NEW';
UPDATE AssetStatuses SET Name = N'جيد' WHERE Code = 'GOOD';
UPDATE AssetStatuses SET Name = N'يحتاج صيانة' WHERE Code = 'NEEDS_MAINTENANCE';
UPDATE AssetStatuses SET Name = N'تالف' WHERE Code = 'DAMAGED';
UPDATE AssetStatuses SET Name = N'للاستبعاد' WHERE Code = 'FOR_DISPOSAL';
UPDATE AssetStatuses SET Name = N'مستبعد' WHERE Code = 'DISPOSED';
*/
