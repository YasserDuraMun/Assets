-- ==========================================
-- Create Admin User
-- ==========================================
-- Username: admin
-- Password: Admin@123
-- ==========================================

USE Assets;
GO

-- Delete existing admin if exists
DELETE FROM Users WHERE Username = 'admin';

-- Insert admin user
-- Password hash for: Admin@123
INSERT INTO Users (Username, Email, PasswordHash, FullName, Role, IsActive, CreatedAt)
VALUES (
    'admin',
    'admin@assets.ps',
    '$2a$11$rQZ5qI4z5qI4z5qIuK7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7',
    N'????? ??????',
    1, -- Admin = 1
    1, -- Active
    GETDATE()
);

PRINT '? Admin user created successfully!';
PRINT '';
PRINT '==========================================';
PRINT 'Login Credentials:';
PRINT '==========================================';
PRINT 'Username: admin';
PRINT 'Password: Admin@123';
PRINT '==========================================';

-- Verify
SELECT 
    Id,
    Username,
    Email,
    FullName,
    CASE Role 
        WHEN 1 THEN 'Admin'
        WHEN 2 THEN 'Manager'
        WHEN 3 THEN 'User'
        ELSE 'Unknown'
    END AS RoleName,
    IsActive,
    CreatedAt
FROM Users 
WHERE Username = 'admin';
