-- Remove Capacity Column from Warehouses Table
-- Script: RemoveCapacityFromWarehouses.sql

USE [AssetsDb]; -- Replace with your actual database name

-- Check if the Capacity column exists before dropping it
IF EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Warehouses' 
    AND COLUMN_NAME = 'Capacity'
)
BEGIN
    PRINT 'Removing Capacity column from Warehouses table...';
    ALTER TABLE Warehouses DROP COLUMN Capacity;
    PRINT 'Capacity column removed successfully.';
END
ELSE
BEGIN
    PRINT 'Capacity column does not exist in Warehouses table.';
END

-- Update Migration History
IF NOT EXISTS (
    SELECT * FROM __EFMigrationsHistory 
    WHERE MigrationId = '20260327100000_RemoveCapacityFromWarehouse'
)
BEGIN
    INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion)
    VALUES ('20260327100000_RemoveCapacityFromWarehouse', '9.0.0');
    PRINT 'Migration history updated.';
END

PRINT 'Warehouse capacity removal completed successfully!';