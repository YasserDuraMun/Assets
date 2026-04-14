@echo off
cls
echo ?? MAINTENANCE 500 INTERNAL SERVER ERROR - COMPREHENSIVE DEBUG
echo =============================================================

echo ?? PROBLEM ANALYSIS:
echo   ? 403 Forbidden errors RESOLVED - Authorization working
echo   ? NEW ISSUE: 500 Internal Server Error on POST /api/maintenance
echo   ?? Server-side error in MaintenanceController or Service layer
echo   ?? Need to identify root cause: JWT, Database, or Validation

echo ?? POSSIBLE ROOT CAUSES:
echo   1. JWT User ID Extraction Issues:
echo      • GetUserIdFromToken() returns null
echo      • Invalid JWT token claims
echo      • User ID not found in SecurityUsers table
echo   2. Database Foreign Key Constraint Violations:
echo      • CreatedBy references non-existent user
echo      • AssetId references non-existent asset
echo      • Invalid entity relationships
echo   3. Data Validation Issues:
echo      • Required fields missing in CreateMaintenanceDto
echo      • Invalid enum values (MaintenanceType, MaintenanceStatus)
echo      • Date/time format issues

echo ?? COMPREHENSIVE DEBUG STRATEGY:
echo   • Enhanced backend logging for detailed error tracking
echo   • JWT token validation and user ID verification
echo   • Database constraint and entity relationship checks
echo   • Frontend data payload validation

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting Backend with Enhanced Debugging...
start "Backend - 500 Error Debug" cmd /k "echo ??? BACKEND - Maintenance 500 Error Debug && echo ========================== && echo. && echo ?? ENHANCED DEBUGGING ENABLED: && echo   • JWT token validation detailed logging && echo   • User ID extraction step-by-step tracking && echo   • Database operation error capture && echo   • Entity Framework constraint validation && echo   • CreateMaintenanceDto payload inspection && echo. && echo ?? DEBUG CHECKPOINTS: && echo   1. JWT Token Validation: && echo      • Check token exists and is valid && echo      • Verify user ID claims (NameIdentifier, userId, sub) && echo      • Confirm extracted user ID exists in database && echo   2. CreateMaintenanceDto Validation: && echo      • Verify all required fields are present && echo      • Check AssetId exists in Assets table && echo      • Validate MaintenanceType and Status enums && echo   3. Database Operation Tracking: && echo      • Log entity creation and relationship setup && echo      • Capture SaveChanges() errors with full details && echo      • Check foreign key constraint violations && echo. && echo ?? EXPECTED LOG OUTPUT: && echo   • 'JWT Token validation: SUCCESS/FAILURE' && echo   • 'User ID extracted: X, User exists: YES/NO' && echo   • 'CreateMaintenanceDto validation: PASSED/FAILED' && echo   • 'Asset exists for ID: X - YES/NO' && echo   • 'Database save operation: SUCCESS/FAILED' && echo   • 'Full error details if any step fails' && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 12

echo ?? Starting Frontend with Debug Payload Logging...
cd ClientApp

start "Frontend - Maintenance Debug" cmd /k "echo ?? FRONTEND - Maintenance Creation Debug && echo ========================== && echo. && echo ?? MAINTENANCE 500 ERROR DEBUG TEST: && echo. && echo ?? Phase 1: Payload Validation && echo   1. Login with custom role user having Maintenance.insert && echo   2. Navigate to assets page and select an asset && echo   3. Open MaintenanceModal for maintenance creation && echo   4. Fill ALL required fields carefully: && echo      • Asset ID (auto-populated) && echo      • Maintenance Type (select from dropdown) && echo      • Maintenance Date (valid future/current date) && echo      • Description (required text field) && echo      • Cost (optional, but if provided must be valid number) && echo. && echo ?? Phase 2: Network Request Inspection && echo   5. Open Developer Tools ? Network Tab && echo   6. Submit maintenance form && echo   7. Check POST /api/maintenance request: && echo      • Request payload structure && echo      • All required fields included && echo      • Valid data types and formats && echo      • JWT token in Authorization header && echo. && echo ?? Phase 3: Error Analysis && echo   8. If 500 error occurs: && echo      • Check backend console for detailed error logs && echo      • Look for specific error messages: && echo        - 'JWT validation failed' && echo        - 'User ID extraction failed' && echo        - 'Foreign key constraint violation' && echo        - 'Invalid asset ID' && echo        - 'CreateMaintenanceDto validation failed' && echo. && echo ?? Phase 4: Systematic Testing && echo   9. Test with different scenarios: && echo      • Different assets (verify asset IDs exist) && echo      • Different maintenance types && echo      • Different dates (past, present, future) && echo      • With and without optional fields (cost, notes) && echo. && npm run dev"

echo.
echo ?? MAINTENANCE 500 ERROR COMPREHENSIVE DEBUG READY!
echo ==================================================
echo.

echo ?? DEBUG WORKFLOW:
echo.
echo ?? Step 1: Backend Error Identification
echo   ? Check backend console logs for detailed error messages
echo   ? Identify which component is failing (JWT, Validation, Database)
echo   ? Look for specific exception details and stack traces
echo.
echo ?? Step 2: JWT Token Validation
echo   ? Verify JWT token is being sent with request
echo   ? Check token contains valid user ID claims
echo   ? Confirm extracted user ID exists in SecurityUsers table
echo.
echo ?? Step 3: Request Payload Analysis
echo   ? Inspect POST request data in Network tab
echo   ? Verify all required CreateMaintenanceDto fields are populated
echo   ? Check data types and formats are correct
echo.
echo ?? Step 4: Database Constraint Checking
echo   ? Verify AssetId exists in Assets table
echo   ? Confirm CreatedBy user ID exists in SecurityUsers table
echo   ? Check for any foreign key constraint violations
echo.
echo ?? Step 5: Validation Rule Verification
echo   ? Ensure MaintenanceType enum value is valid
echo   ? Check MaintenanceDate format and validity
echo   ? Verify required field constraints are met

pause

echo ?? COMMON 500 ERROR SCENARIOS:
echo ==============================
echo.
echo ?? Scenario 1: JWT User ID Extraction Failure
echo   SYMPTOMS: Backend logs show "User not authenticated" or null user ID
echo   SOLUTION: Fix JWT token claims or GetUserIdFromToken() method
echo   CHECK: Token contains NameIdentifier, userId, or sub claims
echo.
echo ?? Scenario 2: Foreign Key Constraint Violation
echo   SYMPTOMS: "FOREIGN KEY constraint failed" in database logs
echo   SOLUTION: Ensure CreatedBy and AssetId reference existing records
echo   CHECK: User exists in SecurityUsers, Asset exists in Assets table
echo.
echo ?? Scenario 3: Data Validation Failure
echo   SYMPTOMS: "Validation failed" or "Invalid model state"
echo   SOLUTION: Fix CreateMaintenanceDto validation or frontend data
echo   CHECK: All required fields populated, correct data types
echo.
echo ?? Scenario 4: Entity Framework Configuration Issue
echo   SYMPTOMS: "Entity type not found" or mapping errors
echo   SOLUTION: Check AssetMaintenance entity configuration
echo   CHECK: DbContext includes AssetMaintenances DbSet
echo.
echo ?? Scenario 5: Service Layer Exception
echo   SYMPTOMS: Custom exceptions from MaintenanceService
echo   SOLUTION: Fix business logic or data validation in service
echo   CHECK: Asset exists, maintenance date validity, business rules

echo.
echo ?? IMMEDIATE ACTION PLAN:
echo ========================
echo.
echo 1. ?? START DEBUGGING: Run the batch file and monitor both consoles
echo 2. ?? IDENTIFY ERROR: Look for specific error messages in backend logs
echo 3. ?? APPLY TARGETED FIX: Based on identified root cause
echo 4. ? VALIDATE SOLUTION: Test maintenance creation with fixed issue
echo 5. ?? DOCUMENT RESOLUTION: Record solution for future reference
echo.
echo Begin comprehensive 500 error debugging now! ??
pause