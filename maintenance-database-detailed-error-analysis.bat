@echo off
cls
echo ?? MAINTENANCE DATABASE ERROR - DETAILED EXCEPTION ANALYSIS
echo ========================================================

echo ?? PROBLEM IDENTIFIED:
echo   ? Entity Framework Error: "An error occurred while saving the entity changes"
echo   ? Custom roles cannot create maintenance (Super Admin works)
echo   ?? Need detailed inner exception analysis to identify root cause

echo ?? ENHANCED ERROR LOGGING APPLIED:
echo   • Detailed exception message and type logging
echo   • Inner exception chain analysis
echo   • Entity Framework specific error detection
echo   • Stack trace and entity state information
echo   • Complete error hierarchy traversal

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting Backend with Detailed Exception Logging...
start "Backend - Exception Analysis" cmd /k "echo ??? BACKEND - Maintenance Database Exception Analysis && echo ========================== && echo. && echo ?? ENHANCED DATABASE ERROR DIAGNOSTICS: && echo   • Full exception message and type logging && echo   • Inner exception chain traversal && echo   • Entity Framework DbUpdateException analysis && echo   • Failed entity details and state information && echo   • Complete stack trace for debugging && echo. && echo ?? WATCH FOR DETAILED ERROR INFORMATION: && echo   • [MAINTENANCE] FATAL ERROR creating maintenance record && echo   • Main Exception: [detailed message] && echo   • Inner Exception: [specific database error] && echo   • Exception Type: [EntityFramework/Database specific] && echo   • Failed Entity: [AssetMaintenance details] && echo   • Stack Trace: [complete call stack] && echo. && echo ?? EXPECTED DETAILED ERROR TYPES: && echo   • Foreign Key Constraint: Reference to non-existent entity && echo   • Validation Error: Required field or data type mismatch && echo   • Duplicate Key: Unique constraint violation && echo   • Database Connection: Connection or timeout issues && echo   • Entity Configuration: Mapping or relationship errors && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 10

echo ?? Starting Frontend Detailed Error Test...
cd ClientApp

start "Frontend - Error Analysis" cmd /k "echo ?? FRONTEND - Maintenance Database Error Analysis && echo ========================== && echo. && echo ?? DETAILED DATABASE ERROR TEST: && echo. && echo ?? Phase 1: Reproduce Database Error && echo   1. Login as custom role user (haya1.alzeer1992@gmail.com) && echo   2. Navigate to assets and select asset ID 17 (????) && echo   3. Create maintenance with minimal data: && echo      • Type: Preventive (1) && echo      • Date: Today && echo      • Description: 'Database error test' && echo   4. Submit and IMMEDIATELY check backend console && echo. && echo ?? Phase 2: Analyze Detailed Error Information && echo   5. Look for specific error patterns in backend: && echo      • [MAINTENANCE] Main Exception: [message] && echo      • [MAINTENANCE] Inner Exception: [specific error] && echo      • [MAINTENANCE] Exception Type: [framework type] && echo      • [MAINTENANCE] Failed Entity: [entity details] && echo. && echo ?? Phase 3: Identify Error Category && echo   6. Based on error details, classify as: && echo      • Foreign Key Constraint: CreatedBy or AssetId reference issue && echo      • Validation Error: Required field or format problem && echo      • Database Schema: Entity mapping or configuration issue && echo      • Connection Error: Database access or timeout problem && echo. && npm run dev"

echo.
echo ?? DETAILED DATABASE ERROR ANALYSIS READY!
echo ==========================================
echo.

echo ?? CRITICAL ERROR ANALYSIS CHECKPOINTS:
echo.
echo ?? Exception Message Analysis:
echo   ? Main Exception: What is the primary error message?
echo   ? Inner Exception: What is the specific database error?
echo   ? Exception Type: Is it DbUpdateException, SqlException, etc.?
echo   ? Entity Details: Which entity (AssetMaintenance) and what state?
echo.
echo ?? Foreign Key Constraint Check:
echo   ? CreatedBy Field: Does User ID 3 exist in SecurityUsers table?
echo   ? AssetId Field: Does Asset ID 17 exist in Assets table?
echo   ? Navigation Properties: Are relationships properly configured?
echo.
echo ?? Data Validation Check:
echo   ? Required Fields: Are all mandatory fields populated?
echo   ? Data Types: Are field values in correct format?
echo   ? Enum Values: Are MaintenanceType and Status valid?
echo   ? Date Formats: Is MaintenanceDate properly formatted?

pause

echo ?? COMMON DATABASE ERROR SCENARIOS:
echo ==================================
echo.
echo ?? Scenario 1: Foreign Key Constraint Violation
echo   ERROR: "The INSERT statement conflicted with the FOREIGN KEY constraint"
echo   CAUSE: CreatedBy=3 but User ID 3 doesn't exist in SecurityUsers
echo   SOLUTION: Verify user exists or fix user ID extraction
echo.
echo ?? Scenario 2: Required Field Validation
echo   ERROR: "Cannot insert the value NULL into column 'Description'"
echo   CAUSE: Required fields missing in CreateMaintenanceDto
echo   SOLUTION: Ensure all mandatory fields are populated
echo.
echo ?? Scenario 3: Data Type Validation
echo   ERROR: "Conversion failed when converting date/time"
echo   CAUSE: Invalid date format or value
echo   SOLUTION: Fix date formatting in frontend or DTO
echo.
echo ?? Scenario 4: Unique Constraint Violation
echo   ERROR: "Violation of UNIQUE KEY constraint"
echo   CAUSE: Duplicate entry for unique field
echo   SOLUTION: Check for duplicate records or modify logic
echo.
echo ?? Scenario 5: Entity Configuration Error
echo   ERROR: "Invalid column name" or "Invalid object name"
echo   CAUSE: Entity mapping or database schema mismatch
echo   SOLUTION: Check AssetMaintenance entity configuration

echo.
echo ?? IMMEDIATE DIAGNOSTIC ACTIONS:
echo ==============================
echo.
echo 1. ?? RUN TEST: Create maintenance with custom role user
echo 2. ?? ANALYZE LOGS: Check detailed exception information in backend
echo 3. ?? IDENTIFY CAUSE: Foreign key, validation, or configuration issue
echo 4. ?? APPLY FIX: Targeted solution based on specific error type
echo 5. ? VALIDATE: Confirm maintenance creation works for all users
echo.
echo Critical: Focus on the Inner Exception details for exact problem! ??
pause