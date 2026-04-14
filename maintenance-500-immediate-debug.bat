@echo off
cls
echo ?? MAINTENANCE 500 ERROR - IMMEDIATE BACKEND LOG ANALYSIS
echo ======================================================

echo ?? CRITICAL 500 ERROR ANALYSIS:
echo   ? MaintenanceModal.tsx shows 500 Internal Server Error
echo   ? POST /api/maintenance fails for custom roles
echo   ? Super Admin works (different JWT token structure)
echo   ?? Need immediate backend log analysis to identify root cause

echo ?? MOST LIKELY CAUSES:
echo   1. JWT User ID Extraction Failure:
echo      • GetUserIdFromToken() returns null for custom roles
echo      • User authentication check fails
echo      • Returns 401 but appears as 500 in frontend
echo   2. Database Foreign Key Constraint:
echo      • CreatedBy references non-existent user
echo      • AssetId validation fails
echo      • Entity Framework constraint violation
echo   3. Data Validation Issues:
echo      • CreateMaintenanceDto contains invalid data
echo      • Required fields missing or malformed
echo      • Enum values out of range

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting Backend with MAXIMUM Debug Logging...
start "Backend - 500 Error Analysis" cmd /k "echo ??? BACKEND - Maintenance 500 Error Real-Time Analysis && echo ================================== && echo. && echo ?? 500 ERROR IMMEDIATE DIAGNOSIS: && echo   • Every MaintenanceController method call logged && echo   • JWT token validation detailed logging && echo   • User ID extraction step-by-step tracking && echo   • Database operation error capture && echo   • Full exception details with stack traces && echo. && echo ?? WATCH FOR THESE CRITICAL LOG MESSAGES: && echo   • 'Creating maintenance record for Asset ID: X' && echo   • 'Successfully extracted user ID: Y from token' && echo   • 'User ID extraction failed' && echo   • 'User not authenticated' && echo   • 'Database save operation failed' && echo   • 'Foreign key constraint violation' && echo   • 'CreateMaintenanceDto validation failed' && echo. && echo ?? EXPECTED ERROR PATTERNS: && echo   1. Authentication Error: && echo      • 'No user ID found in token' && echo      • 'GetUserIdFromToken returned null' && echo   2. Database Error: && echo      • 'FOREIGN KEY constraint failed' && echo      • 'Cannot insert explicit value for identity column' && echo   3. Validation Error: && echo      • 'The field X is required' && echo      • 'Invalid enum value' && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 10

echo ?? Starting Frontend 500 Error Test...
cd ClientApp

start "Frontend - 500 Debug" cmd /k "echo ?? FRONTEND - Maintenance 500 Error Debug && echo ========================= && echo. && echo ?? IMMEDIATE 500 ERROR REPRODUCTION: && echo. && echo ?? Phase 1: Reproduce Error with Custom Role && echo   1. Login as custom role user with Maintenance.insert permission && echo   2. Navigate to assets page && echo   3. Select ANY asset && echo   4. Open MaintenanceModal (should work) && echo   5. Fill maintenance form with basic data: && echo      • Maintenance Type: Select any option && echo      • Maintenance Date: Today's date && echo      • Description: 'Test maintenance' && echo      • Leave optional fields empty initially && echo   6. Submit form ? EXPECT 500 ERROR && echo   7. IMMEDIATELY check backend console for error details && echo. && echo ?? Phase 2: Error Analysis && echo   8. In browser Developer Tools: && echo      • Network Tab: Check POST /api/maintenance request && echo      • Verify request payload structure && echo      • Check Authorization header has JWT token && echo      • Look for response error details && echo   9. In backend console: && echo      • Look for the exact error message && echo      • Identify which step failed (JWT/DB/Validation) && echo      • Copy full error details for analysis && echo. && echo ?? Phase 3: Super Admin Comparison && echo   10. Logout and login as Super Admin && echo   11. Try same maintenance creation process && echo   12. Should work successfully && echo   13. Compare backend logs between users && echo. && npm run dev"

echo.
echo ?? 500 ERROR IMMEDIATE ANALYSIS READY!
echo ====================================
echo.

echo ?? CRITICAL DEBUG STEPS:
echo.
echo ?? Step 1: IMMEDIATE ERROR REPRODUCTION
echo   ? Login as custom role user
echo   ? Try to create maintenance (expect 500 error)
echo   ? IMMEDIATELY check backend console
echo   ? Identify exact error message and location
echo.
echo ?? Step 2: ERROR CLASSIFICATION
echo   ? JWT/Authentication Error: "User not authenticated" or similar
echo   ? Database Error: "FOREIGN KEY constraint" or "Cannot insert"
echo   ? Validation Error: "Required field" or "Invalid value"
echo   ? Other: Unexpected exception details
echo.
echo ?? Step 3: TARGETED FIX APPLICATION
echo   ? Based on error type identified
echo   ? Apply specific fix for that issue
echo   ? Test fix immediately
echo   ? Validate with both Super Admin and custom roles

pause

echo ?? ERROR-SPECIFIC QUICK FIXES:
echo ==============================
echo.
echo ?? IF JWT/Authentication Error:
echo   SYMPTOMS: "User not authenticated", "GetUserIdFromToken returned null"
echo   QUICK CHECK: 
echo     • Verify JWT token in browser localStorage
echo     • Decode token at jwt.io to check claims structure
echo     • Compare Super Admin vs Custom Role token claims
echo   LIKELY FIX: JWT claims missing NameIdentifier for custom roles
echo.
echo ?? IF Database Error:
echo   SYMPTOMS: "FOREIGN KEY constraint failed", "Cannot insert"
echo   QUICK CHECK:
echo     • Check if extracted user ID exists in SecurityUsers table
echo     • Verify AssetId exists in Assets table
echo   LIKELY FIX: User ID extraction succeeds but references invalid user
echo.
echo ?? IF Validation Error:
echo   SYMPTOMS: "Required field missing", "Invalid enum value"
echo   QUICK CHECK:
echo     • Check POST request payload in Network tab
echo     • Verify all required CreateMaintenanceDto fields
echo   LIKELY FIX: Frontend sending invalid or missing data

echo.
echo ?? IMMEDIATE ACTION PLAN:
echo ========================
echo.
echo 1. ?? RUN BACKENDS: Start both backend windows for real-time logging
echo 2. ?? REPRODUCE ERROR: Login as custom role and create maintenance
echo 3. ?? CHECK LOGS: Immediately look at backend console for error details
echo 4. ?? IDENTIFY TYPE: Classify error as JWT/Database/Validation
echo 5. ? APPLY FIX: Use error-specific solution based on type
echo.
echo CRITICAL: Watch backend console closely during maintenance creation! ??
pause