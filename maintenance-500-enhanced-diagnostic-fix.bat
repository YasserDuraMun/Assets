@echo off
cls
echo ?? URGENT: MAINTENANCE 500 ERROR - ENHANCED DIAGNOSTIC FIX
echo ======================================================

echo ?? CRITICAL ISSUE:
echo   ? POST /api/maintenance still returns 500 Internal Server Error
echo   ? MaintenanceModal.tsx fails at handleSubmit
echo   ?? Applied comprehensive diagnostic logging to identify exact failure point

echo ?? ENHANCED DIAGNOSTIC APPROACH:
echo   • Triple-layered user ID extraction methods
echo   • Comprehensive error logging at each step
echo   • Detailed request data logging
echo   • Exception handling for each authentication method
echo   • Real-time failure point identification

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting Backend with MAXIMUM Diagnostic Logging...
start "Backend - Maintenance 500 Fix" cmd /k "echo ??? BACKEND - Maintenance 500 Error Enhanced Diagnostic && echo ============================= && echo. && echo ?? ENHANCED MAINTENANCE CREATION DIAGNOSTICS: && echo   • Method 1: CurrentUserService.UserId extraction && echo   • Method 2: GetUserIdFromToken fallback && echo   • Method 3: Direct JWT token claims parsing && echo   • Comprehensive logging at each authentication step && echo   • Detailed exception handling and error reporting && echo. && echo ?? WATCH FOR THESE CRITICAL LOG PATTERNS: && echo   • [MAINTENANCE] Starting maintenance creation for Asset ID: X && echo   • Method 1 SUCCESS/FAILED: CurrentUserService.UserId = Y && echo   • Method 2 SUCCESS/FAILED: GetUserIdFromToken = Z && echo   • Method 3 SUCCESS/FAILED: Direct parsing = W && echo   • Final User ID: A, User Email: B && echo   • Calling MaintenanceService.CreateAsync... && echo   • SUCCESS: Created maintenance record with ID: C && echo   • FATAL ERROR: [detailed error message] && echo. && echo ?? EXPECTED DIAGNOSTIC FLOW: && echo   1. Request received with asset data && echo   2. Try CurrentUserService.UserId && echo   3. If failed, try GetUserIdFromToken && echo   4. If failed, try direct token parsing && echo   5. If all failed, return 401 Unauthorized && echo   6. If success, call MaintenanceService.CreateAsync && echo   7. Return success response or detailed error && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 10

echo ?? Starting Frontend 500 Error Diagnostic Test...
cd ClientApp

start "Frontend - 500 Diagnostic" cmd /k "echo ?? FRONTEND - Maintenance 500 Error Diagnostic Test && echo ========================== && echo. && echo ?? COMPREHENSIVE 500 ERROR DIAGNOSIS: && echo. && echo ?? Phase 1: Controlled Test Execution && echo   1. Login as custom role user with Maintenance.insert permission && echo   2. Navigate to assets page && echo   3. Select any asset for maintenance creation && echo   4. Open MaintenanceModal && echo   5. Fill form with minimal required data: && echo      • Maintenance Type: Select from dropdown && echo      • Maintenance Date: Today's date && echo      • Description: 'Diagnostic test maintenance' && echo   6. Submit form and IMMEDIATELY check backend console && echo. && echo ?? Phase 2: Real-Time Log Analysis && echo   7. Watch backend console for diagnostic logs: && echo      • Look for [MAINTENANCE] prefixed messages && echo      • Identify which authentication method succeeds/fails && echo      • Check for user ID extraction success/failure && echo      • Note exact error location and message && echo   8. Frontend Network Tab analysis: && echo      • Verify POST /api/maintenance request structure && echo      • Check Authorization header contains JWT token && echo      • Examine response details for server error info && echo. && echo ?? Phase 3: Systematic Issue Identification && echo   9. Based on backend logs, identify failure point: && echo      • Authentication failure: Methods 1, 2, 3 all fail && echo      • User ID extraction: Specific method fails && echo      • MaintenanceService failure: Database or validation error && echo      • Other: Unexpected exception in controller logic && echo. && npm run dev"

echo.
echo ?? ENHANCED MAINTENANCE 500 DIAGNOSTIC READY!
echo ============================================
echo.

echo ?? CRITICAL DIAGNOSTIC CHECKPOINTS:
echo.
echo ?? Authentication Method Analysis:
echo   ? Method 1 (CurrentUserService): SUCCESS/FAILED
echo   ? Method 2 (GetUserIdFromToken): SUCCESS/FAILED  
echo   ? Method 3 (Direct Token Parse): SUCCESS/FAILED
echo   ? Final User ID extracted: YES/NO
echo.
echo ?? Request Processing Analysis:
echo   ? Request data received correctly: Asset ID, Type, Date, Description
echo   ? MaintenanceService.CreateAsync called: YES/NO
echo   ? Database operation successful: YES/NO
echo   ? Response generation successful: YES/NO
echo.
echo ?? Error Location Identification:
echo   ? Authentication layer error
echo   ? Service layer error (MaintenanceService)
echo   ? Database layer error (Entity Framework)
echo   ? Controller response error
echo.

pause

echo ?? EXPECTED DIAGNOSTIC OUTCOMES:
echo ==============================
echo.
echo ?? Scenario A: Authentication Failure
echo   SYMPTOMS: All 3 methods fail to extract user ID
echo   LOGS: "ALL METHODS FAILED: Cannot extract user ID"
echo   SOLUTION: Fix JWT token structure or claims processing
echo.
echo ?? Scenario B: Service Layer Failure
echo   SYMPTOMS: User ID extracted successfully, but MaintenanceService.CreateAsync fails
echo   LOGS: "Final User ID: X" followed by service exception
echo   SOLUTION: Fix MaintenanceService or database constraints
echo.
echo ?? Scenario C: Database Constraint Failure
echo   SYMPTOMS: Foreign key constraint or validation error
echo   LOGS: Service exception with database error details
echo   SOLUTION: Fix database relationships or validation rules
echo.
echo ?? Scenario D: Unexpected Exception
echo   SYMPTOMS: Exception in controller logic before service call
echo   LOGS: "FATAL ERROR" with full stack trace
echo   SOLUTION: Fix controller logic or DTO validation

echo.
echo ?? IMMEDIATE NEXT STEPS:
echo =======================
echo.
echo 1. ?? RUN TEST: Execute maintenance creation with diagnostic logging
echo 2. ?? ANALYZE LOGS: Identify exact failure point from backend console
echo 3. ?? CLASSIFY ISSUE: Authentication, Service, Database, or Controller
echo 4. ?? APPLY FIX: Targeted solution based on identified failure type
echo 5. ? VALIDATE: Confirm fix resolves 500 error
echo.
echo CRITICAL: Monitor backend console closely during test! ??
pause