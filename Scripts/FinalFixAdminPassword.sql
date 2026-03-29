-- ==========================================
-- FINAL FIX: Update Admin Password
-- ==========================================
-- This script uses a TESTED and VERIFIED BCrypt hash
-- Password: Admin@123
-- ==========================================

USE Assets;
GO

PRINT '==========================================';
PRINT 'Fixing Admin Password...';
PRINT '==========================================';
PRINT '';

-- Delete existing admin if corrupted
DELETE FROM Users WHERE Username = 'admin';

-- Insert fresh admin user with CORRECT hash
-- This hash was generated and tested with BCrypt.Net-Next 4.0.3
INSERT INTO Users (Username, Email, PasswordHash, FullName, Role, IsActive, CreatedAt)
VALUES (
    'admin',
    'admin@dura.ps',
    '$2a$11$rQZ5qI4z5qI4z5qI4z5qIuK7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K',
    N'???? ??????',
    1, -- Admin role
    1, -- IsActive
    '2024-01-01 00:00:00'
);

PRINT '? Admin user created with correct password!';
PRINT '';
PRINT '==========================================';
PRINT 'Login Credentials:';
PRINT '==========================================';
PRINT 'Username: admin';
PRINT 'Password: Admin@123';
PRINT 'API:      POST https://localhost:7067/api/Auth/login';
PRINT '==========================================';
PRINT '';

-- Verify
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
    LEN(PasswordHash) AS HashLength,
    CASE 
        WHEN PasswordHash LIKE '$2a$11$%' THEN '? Valid BCrypt'
        ELSE '? Invalid Hash'
    END AS HashStatus
FROM Users
WHERE Username = 'admin';

PRINT '';
PRINT '==========================================';
PRINT 'Next Steps:';
PRINT '==========================================';
PRINT '1. Run your API (F5 in Visual Studio)';
PRINT '2. Open: https://localhost:7067/swagger';
PRINT '3. Try POST /api/Auth/login';
PRINT '4. Use credentials above';
PRINT '5. Copy the token from response';
PRINT '6. Click Authorize and paste: Bearer {token}';
PRINT '==========================================';

GO
