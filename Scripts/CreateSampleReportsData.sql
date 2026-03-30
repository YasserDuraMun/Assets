o
-- Create Sample Data for Reports Testing
-- This script creates sample data to test the reports functionality

USE Assets;
GO

PRINT 'Creating sample data for reports testing...'

-- Variables for date calculations
DECLARE @StartDate DATE = DATEADD(MONTH, -3, GETDATE()) -- 3 months ago
DECLARE @EndDate DATE = GETDATE() -- today

-- Create some sample assets if they don't exist
IF NOT EXISTS (SELECT 1 FROM Assets WHERE Name LIKE 'Test Asset%')
BEGIN
    PRINT 'Creating sample assets...'
    
    INSERT INTO Assets (Name, SerialNumber, CategoryId, DepartmentId, CurrentSectionId, StatusId, Cost, CreatedAt, UpdatedAt)
    SELECT 
        'Test Asset ' + CAST(ROW_NUMBER() OVER (ORDER BY c.Id) AS VARCHAR(10)),
        'TST-' + RIGHT('000' + CAST(ROW_NUMBER() OVER (ORDER BY c.Id) AS VARCHAR(3)), 3),
        c.Id,
        d.Id,
        s.Id,
        st.Id,
        CAST(RAND() * 10000 + 1000 AS DECIMAL(10,2)), -- Random cost between 1000-11000
        DATEADD(DAY, -CAST(RAND() * 90 AS INT), GETDATE()), -- Random date within last 90 days
        GETDATE()
    FROM 
        (SELECT TOP 10 Id FROM AssetCategories ORDER BY Id) c
        CROSS JOIN (SELECT TOP 3 Id FROM Departments ORDER BY Id) d
        CROSS JOIN (SELECT TOP 2 Id FROM Sections ORDER BY Id) s
        CROSS JOIN (SELECT TOP 1 Id FROM AssetStatuses ORDER BY Id) st
    WHERE c.Id IS NOT NULL AND d.Id IS NOT NULL AND s.Id IS NOT NULL AND st.Id IS NOT NULL
END

-- Create sample disposals
IF NOT EXISTS (SELECT 1 FROM AssetDisposals)
BEGIN
    PRINT 'Creating sample disposal records...'
    
    INSERT INTO AssetDisposals (AssetId, Reason, Method, DisposalDate, Notes, DisposedByEmployeeId, CreatedAt)
    SELECT TOP 5
        a.Id,
        CASE 
            WHEN ROW_NUMBER() OVER (ORDER BY a.Id) % 3 = 0 THEN 0 -- Damaged
            WHEN ROW_NUMBER() OVER (ORDER BY a.Id) % 3 = 1 THEN 1 -- Obsolete  
            ELSE 2 -- Lost
        END,
        CASE 
            WHEN ROW_NUMBER() OVER (ORDER BY a.Id) % 2 = 0 THEN 0 -- Sale
            ELSE 1 -- Destruction
        END,
        DATEADD(DAY, -CAST(RAND() * 60 AS INT), GETDATE()), -- Random date within last 60 days
        'Test disposal for reports - ' + a.Name,
        e.Id,
        GETDATE()
    FROM Assets a
    CROSS JOIN (SELECT TOP 1 Id FROM Employees ORDER BY Id) e
    WHERE a.Name LIKE 'Test Asset%'
        AND e.Id IS NOT NULL
END

-- Create sample maintenance records
IF NOT EXISTS (SELECT 1 FROM AssetMaintenances)
BEGIN
    PRINT 'Creating sample maintenance records...'
    
    INSERT INTO AssetMaintenances (AssetId, MaintenanceType, Status, Description, ScheduledDate, CompletedDate, Cost, TechnicianName, CreatedAt, UpdatedAt)
    SELECT TOP 8
        a.Id,
        CASE 
            WHEN ROW_NUMBER() OVER (ORDER BY a.Id) % 3 = 0 THEN 0 -- Preventive
            WHEN ROW_NUMBER() OVER (ORDER BY a.Id) % 3 = 1 THEN 1 -- Corrective
            ELSE 2 -- Emergency
        END,
        CASE 
            WHEN ROW_NUMBER() OVER (ORDER BY a.Id) % 4 = 0 THEN 0 -- Scheduled
            WHEN ROW_NUMBER() OVER (ORDER BY a.Id) % 4 = 1 THEN 1 -- InProgress
            WHEN ROW_NUMBER() OVER (ORDER BY a.Id) % 4 = 2 THEN 2 -- Completed
            ELSE 3 -- Cancelled
        END,
        'Test maintenance for ' + a.Name + ' - Regular checkup and repairs',
        DATEADD(DAY, -CAST(RAND() * 45 AS INT), GETDATE()), -- Scheduled date
        CASE 
            WHEN ROW_NUMBER() OVER (ORDER BY a.Id) % 4 = 2 THEN DATEADD(DAY, -CAST(RAND() * 30 AS INT), GETDATE()) -- Completed date for completed items
            ELSE NULL
        END,
        CAST(RAND() * 2000 + 100 AS DECIMAL(10,2)), -- Random cost between 100-2100
        'Technician ' + CAST(ROW_NUMBER() OVER (ORDER BY a.Id) AS VARCHAR(10)),
        GETDATE(),
        GETDATE()
    FROM Assets a
    WHERE a.Name LIKE 'Test Asset%'
END

-- Create sample asset movements (transfers)
IF NOT EXISTS (SELECT 1 FROM AssetMovements)
BEGIN
    PRINT 'Creating sample transfer records...'
    
    INSERT INTO AssetMovements (AssetId, MovementType, FromDepartmentId, FromSectionId, ToDepartmentId, ToSectionId, RequestedByEmployeeId, ApprovedByEmployeeId, RequestDate, ApprovalDate, Notes, CreatedAt, UpdatedAt)
    SELECT TOP 6
        a.Id,
        0, -- Transfer
        d1.Id, -- From Department
        s1.Id, -- From Section  
        d2.Id, -- To Department
        s2.Id, -- To Section
        e1.Id, -- Requested by
        CASE 
            WHEN ROW_NUMBER() OVER (ORDER BY a.Id) % 2 = 0 THEN e2.Id -- Approved by (some approved)
            ELSE NULL
        END,
        DATEADD(DAY, -CAST(RAND() * 40 AS INT), GETDATE()), -- Request date
        CASE 
            WHEN ROW_NUMBER() OVER (ORDER BY a.Id) % 2 = 0 THEN DATEADD(DAY, -CAST(RAND() * 30 AS INT), GETDATE()) -- Approval date for approved transfers
            ELSE NULL
        END,
        'Test transfer for reports - Moving ' + a.Name + ' between departments',
        GETDATE(),
        GETDATE()
    FROM Assets a
    CROSS JOIN (SELECT Id, ROW_NUMBER() OVER (ORDER BY Id) as rn FROM Departments) d1
    CROSS JOIN (SELECT Id, ROW_NUMBER() OVER (ORDER BY Id) as rn FROM Departments) d2  
    CROSS JOIN (SELECT Id, ROW_NUMBER() OVER (ORDER BY Id) as rn FROM Sections) s1
    CROSS JOIN (SELECT Id, ROW_NUMBER() OVER (ORDER BY Id) as rn FROM Sections) s2
    CROSS JOIN (SELECT Id, ROW_NUMBER() OVER (ORDER BY Id) as rn FROM Employees) e1
    CROSS JOIN (SELECT Id, ROW_NUMBER() OVER (ORDER BY Id) as rn FROM Employees) e2
    WHERE a.Name LIKE 'Test Asset%'
        AND d1.rn = 1 AND d2.rn = 2 -- Different departments
        AND s1.rn = 1 AND s2.rn = 2 -- Different sections  
        AND e1.rn = 1 AND e2.rn = 2 AND e1.Id != e2.Id -- Different employees
END

PRINT 'Sample data creation completed!'
PRINT ''
PRINT 'Data Summary:'
PRINT '============='

-- Show summary of created data
SELECT 'Total Assets' as DataType, COUNT(*) as Count FROM Assets WHERE Name LIKE 'Test Asset%'
UNION ALL
SELECT 'Total Disposals', COUNT(*) FROM AssetDisposals  
UNION ALL
SELECT 'Total Maintenance', COUNT(*) FROM AssetMaintenances
UNION ALL
SELECT 'Total Transfers', COUNT(*) FROM AssetMovements

PRINT ''
PRINT 'You can now test the Reports API with this sample data!'
PRINT 'Use date range from ' + CAST(@StartDate AS VARCHAR(20)) + ' to ' + CAST(@EndDate AS VARCHAR(20))

GO