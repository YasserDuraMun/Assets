-- Script to check and fix User FullName with corrupted Arabic text
-- Run this script in SQL Server Management Studio or Azure Data Studio

USE Assets;  -- Replace with your database name if different
GO

-- 1. Check current Users table and identify corrupted names
SELECT Id, Username, FullName, Email
FROM Users
WHERE FullName LIKE '%?%' OR FullName = '' OR FullName IS NULL
ORDER BY Id;

-- 2. Sample update statements - Replace with actual Arabic names
-- Example: Update users with corrupted names to proper Arabic names

-- UPDATE Users SET FullName = N'أحمد محمد' WHERE Id = 1;
-- UPDATE Users SET FullName = N'فاطمة علي' WHERE Id = 2;
-- UPDATE Users SET FullName = N'محمد حسن' WHERE Id = 3;

-- IMPORTANT: Use N prefix before Arabic text to ensure Unicode encoding
-- Example format:
-- UPDATE Users SET FullName = N'الاسم بالعربي' WHERE Username = 'username';

-- 3. Verify the update
-- SELECT Id, Username, FullName FROM Users ORDER BY Id;

PRINT 'Script completed. Please update the FullName values with actual Arabic names using N prefix.';
