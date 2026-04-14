@echo off
cls
echo ?? SUPER ADMIN vs CUSTOM ROLES - MAINTENANCE API COMPARISON
echo =========================================================

echo ?? PROBLEM ANALYSIS:
echo   ? Super Admin: Maintenance creation works perfectly
echo   ? Custom Roles: Maintenance creation fails (500 error)
echo   ?? Need to identify WHY Super Admin works but custom roles don't

echo ?? POSSIBLE DIFFERENCES:
echo   1. JWT Token Structure:
echo      • Super Admin may have different token claims structure
echo      • Custom roles may have missing or incorrect claims
echo   2. User ID Extraction:
echo      • Super Admin user ID extraction successful
echo      • Custom roles user ID extraction may fail
echo   3. Database User Records:
echo      • Super Admin exists in SecurityUsers table
echo      • Custom role users may have database issues
echo   4. Authorization Logic:
echo      • Different code paths for Super Admin vs custom roles

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting Backend with Detailed Comparison Logging...
start "Backend - Admin vs Custom Roles" cmd /k "echo ??? BACKEND - Super Admin vs Custom Roles Analysis && echo ====================================== && echo. && echo ?? COMPARATIVE ANALYSIS ENABLED: && echo   • JWT token structure comparison && echo   • User ID extraction step-by-step comparison && echo   • Database user existence verification && echo   • Authorization flow comparison && echo   • Detailed error tracking for each user type && echo. && echo ?? COMPARISON CHECKPOINTS: && echo   1. JWT Token Analysis: && echo      • Super Admin token claims structure && echo      • Custom role token claims structure && echo      • Identify differences in claim types/values && echo   2. User Authentication Flow: && echo      • Super Admin: GetUserIdFromToken() result && echo      • Custom Role: GetUserIdFromToken() result && echo      • Compare extracted user IDs and validation && echo   3. Database User Verification: && echo      • Super Admin user record in SecurityUsers && echo      • Custom role user records in SecurityUsers && echo      • Check for any missing or invalid data && echo   4. MaintenanceController Execution: && echo      • Super Admin: Full execution path logging && echo      • Custom Role: Full execution path logging && echo      • Identify where custom roles fail && echo. && echo ?? EXPECTED COMPARISON OUTPUT: && echo   • 'Super Admin JWT: [claims details]' && echo   • 'Custom Role JWT: [claims details]' && echo   • 'Super Admin User ID: X, Database Record: [details]' && echo   • 'Custom Role User ID: Y, Database Record: [details]' && echo   • 'Super Admin Maintenance Creation: SUCCESS' && echo   • 'Custom Role Maintenance Creation: FAILURE at step Z' && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 12

echo ?? Starting Frontend Comparative Test...
cd ClientApp

start "Frontend - Admin vs Roles Test" cmd /k "echo ?? FRONTEND - Super Admin vs Custom Roles Test && echo ================================= && echo. && echo ?? COMPARATIVE MAINTENANCE TEST SEQUENCE: && echo. && echo ?? Phase 1: Super Admin Test (Baseline) && echo   1. Login as Super Admin && echo   2. Navigate to assets and select an asset && echo   3. Create maintenance request && echo   4. Record successful behavior: && echo      • Network request payload && echo      • Response status and data && echo      • Backend log messages && echo      • JWT token structure (decode with jwt.io) && echo. && echo ?? Phase 2: Custom Role Test (Problem Case) && echo   5. Logout and login as custom role user with Maintenance.insert && echo   6. Navigate to same asset && echo   7. Try to create maintenance request && echo   8. Record failure behavior: && echo      • Network request payload (compare with Super Admin) && echo      • Error response details && echo      • Backend error messages && echo      • JWT token structure (compare with Super Admin) && echo. && echo ?? Phase 3: Detailed Comparison && echo   9. Compare JWT tokens: && echo      • Decode both tokens at jwt.io && echo      • Check for differences in claims: && echo        - NameIdentifier claim && echo        - userId claim && echo        - sub claim && echo        - Role claims && echo        - Email claims && echo   10. Compare request payloads: && echo       • Ensure identical maintenance data && echo       • Verify same asset ID && echo       • Check authorization headers && echo. && echo ?? Phase 4: Backend Log Analysis && echo   11. Compare backend logs between users: && echo       • Super Admin: JWT validation result && echo       • Custom Role: JWT validation result && echo       • Super Admin: User ID extraction && echo       • Custom Role: User ID extraction && echo       • Super Admin: Database operations && echo       • Custom Role: Database operations && echo. && npm run dev"

echo.
echo ?? SUPER ADMIN vs CUSTOM ROLES COMPARISON READY!
echo ================================================
echo.

echo ?? ANALYSIS WORKFLOW:
echo.
echo ?? Step 1: Establish Super Admin Baseline
echo   ? Test maintenance creation with Super Admin
echo   ? Record all successful request/response data
echo   ? Note JWT token structure and claims
echo   ? Document backend log flow
echo.
echo ?? Step 2: Test Custom Role Failure
echo   ? Test maintenance creation with custom role user
echo   ? Record failure details and error messages
echo   ? Compare JWT token with Super Admin token
echo   ? Identify exact failure point in backend logs
echo.
echo ?? Step 3: Identify Key Differences
echo   ? JWT token claim differences
echo   ? User ID extraction differences  
echo   ? Database record differences
echo   ? Authorization flow differences
echo.
echo ?? Step 4: Apply Targeted Fix
echo   ? Based on identified differences
echo   ? Test fix with custom role users
echo   ? Ensure Super Admin still works
echo   ? Validate complete solution

pause

echo ?? COMMON DIFFERENCE SCENARIOS:
echo ==============================
echo.
echo ?? Scenario 1: JWT Token Claim Differences
echo   ISSUE: Super Admin token has different claim structure
echo   SYMPTOMS: GetUserIdFromToken() works for admin, fails for custom roles
echo   SOLUTION: Ensure consistent JWT token generation for all user types
echo.
echo ?? Scenario 2: User Database Record Issues
echo   ISSUE: Custom role users missing or invalid in SecurityUsers table
echo   SYMPTOMS: Foreign key constraint violation on CreatedBy field
echo   SOLUTION: Verify/fix user records in database
echo.
echo ?? Scenario 3: Role-Based Code Path Differences
echo   ISSUE: Different authorization logic for Super Admin vs custom roles
echo   SYMPTOMS: Super Admin bypasses certain checks that custom roles hit
echo   SOLUTION: Ensure consistent authorization logic for all user types
echo.
echo ?? Scenario 4: Permission System Inconsistency
echo   ISSUE: Super Admin uses different permission checking mechanism
echo   SYMPTOMS: RequirePermission works differently for Super Admin
echo   SOLUTION: Standardize permission checking across all user types

echo.
echo ?? IMMEDIATE DIAGNOSTIC STEPS:
echo =============================
echo.
echo 1. ?? START COMPARISON: Run both backend and frontend
echo 2. ?? TEST SUPER ADMIN: Establish working baseline
echo 3. ?? TEST CUSTOM ROLE: Identify exact failure point
echo 4. ?? COMPARE DATA: JWT tokens, payloads, backend logs
echo 5. ?? APPLY FIX: Based on identified root cause
echo.
echo Begin Super Admin vs Custom Roles comparison now! ??
pause