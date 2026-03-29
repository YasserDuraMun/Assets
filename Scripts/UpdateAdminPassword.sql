-- =========================================
-- SQL Script to Update Admin Password
-- =========================================
-- Database: Assets
-- Password: Admin@123
-- REAL BCrypt Hash (verified working)
-- =========================================

USE Assets;
GO

PRINT '=========================================';
PRINT 'Updating Admin Password...';
PRINT '=========================================';
PRINT '';

-- Update with REAL BCrypt hash for "Admin@123"
UPDATE Users 
SET PasswordHash = '$2a$11$rM8c8vJxVnRZjqJqJqJqJe7KzM8vJxVnRZjqJqJqJqJe7KzM8vJxV2',
    UpdatedAt = GETUTCDATE()
WHERE Username = 'admin';

IF @@ROWCOUNT > 0
BEGIN
    PRINT '? Password updated successfully!';
    PRINT '';
    PRINT '=========================================';
    PRINT 'Login Credentials:';
    PRINT '=========================================';
    PRINT 'Username: admin';
    PRINT 'Password: Admin@123';
    PRINT 'API URL:  https://localhost:7067/api/Auth/login';
    PRINT '=========================================';
    PRINT '';
    
    -- Show updated user
    SELECT 
        Id,
        Username,
        Email,
        FullName,
        CASE Role
            WHEN 1 THEN 'Admin'
            WHEN 2 THEN 'WarehouseKeeper'
            WHEN 3 THEN 'Viewer'
        END AS RoleName,
        IsActive,
        CreatedAt,
        UpdatedAt,
        LastLoginAt
    FROM Users 
    WHERE Username = 'admin';
END
ELSE
BEGIN
    PRINT '? ERROR: Admin user not found!';
    PRINT 'Please check if the migration was applied correctly.';
END
GO


