@echo off
cls
echo ?? API BEHAVIOR DIFFERENCE: SUPER ADMIN vs CUSTOM ROLES
echo =====================================================

echo ?? PROBLEM CONFIRMED:
echo   ? Super Admin: All APIs work correctly
echo   ? Custom Roles: APIs fail or behave incorrectly  
echo   ?? Root cause: Different handling based on user type

echo ?? SUSPECTED CAUSES:
echo   1. JWT Token Structure Differences:
echo      • Super Admin tokens have standard claims
echo      • Custom role tokens may have different/missing claims
echo      • User ID extraction fails for custom roles
echo   2. Authorization Logic Issues:
echo      • Controllers may have hardcoded Super Admin logic
echo      • RequirePermission may not work correctly for custom roles
echo      • Permission checking inconsistent across user types
echo   3. User Database Differences:
echo      • Super Admin user record structure differs
echo      • Custom role users missing required data
echo      • Foreign key relationships broken for custom users

echo ?? COMPREHENSIVE DIAGNOSIS STRATEGY:
echo   Phase 1: JWT Token Analysis (Compare structures)
echo   Phase 2: API Response Comparison (Super Admin vs Custom Role)
echo   Phase 3: Backend Log Analysis (Identify failure points)
echo   Phase 4: Targeted Fixes (Based on findings)

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting Backend with Token Comparison Analysis...
start "Backend - Token Analysis" cmd /k "echo ??? BACKEND - Super Admin vs Custom Role API Analysis && echo ================================== && echo. && echo ?? JWT TOKEN COMPARISON ANALYSIS: && echo   • Log all JWT token structures for different user types && echo   • Compare token claims between Super Admin and custom roles && echo   • Track User ID extraction for each user type && echo   • Monitor authorization flow differences && echo. && echo ?? API BEHAVIOR COMPARISON: && echo   • Super Admin API calls: Full logging && echo   • Custom Role API calls: Full logging && echo   • Identify exact points of failure && echo   • Compare request/response patterns && echo. && echo ?? CRITICAL MONITORING POINTS: && echo   • JWT Token Claims: nameid, userId, email, roles && echo   • User ID Extraction: Success/Failure for each user type && echo   • Authorization Flow: Permission checking results && echo   • Database Operations: User record access and validation && echo. && echo ?? EXPECTED FINDINGS: && echo   • JWT token claim differences between user types && echo   • User ID extraction success for Super Admin, failure for others && echo   • Authorization logic bypasses for Super Admin && echo   • Database record structure differences && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 12

echo ?? Starting Frontend Token Comparison Test...
cd ClientApp

start "Frontend - Token Comparison" cmd /k "echo ?? FRONTEND - Super Admin vs Custom Role Comparison && echo =============================== && echo. && echo ?? COMPREHENSIVE API BEHAVIOR TEST: && echo. && echo ?? Phase 1: Super Admin Baseline Test && echo   1. Login as Super Admin && echo   2. Test multiple API endpoints: && echo      • GET /api/maintenance (should work) && echo      • POST /api/maintenance (should work) && echo      • GET /api/employees/active (should work) && echo      • GET /api/sections (should work) && echo   3. Record all successful behaviors: && echo      • JWT token structure (decode at jwt.io) && echo      • API request/response patterns && echo      • Backend log messages && echo. && echo ?? Phase 2: Custom Role Failure Test && echo   4. Logout and login as custom role user && echo   5. Test SAME API endpoints: && echo      • GET /api/maintenance (may fail) && echo      • POST /api/maintenance (may fail) && echo      • GET /api/employees/active (may fail) && echo      • GET /api/sections (may fail) && echo   6. Record all failure behaviors: && echo      • JWT token structure (compare with Super Admin) && echo      • API error responses (403, 500, etc.) && echo      • Backend error messages && echo. && echo ?? Phase 3: Token Structure Analysis && echo   7. Compare JWT tokens: && echo      • Use jwt.io to decode both tokens && echo      • Check for missing claims in custom role tokens && echo      • Verify nameid, userId, email, role claims && echo      • Look for structural differences && echo. && echo ?? Phase 4: API Pattern Analysis && echo   8. Compare API call patterns: && echo      • Same Authorization headers? && echo      • Same request payloads? && echo      • Different response codes/messages? && echo      • Timing or async differences? && echo. && npm run dev"

echo.
echo ?? API BEHAVIOR COMPARISON ANALYSIS READY!
echo =========================================
echo.

echo ?? SYSTEMATIC COMPARISON WORKFLOW:
echo.
echo ?? Step 1: Establish Super Admin Baseline
echo   ? Login as Super Admin
echo   ? Test all critical API endpoints
echo   ? Record all successful request/response patterns
echo   ? Note JWT token structure and claims
echo.
echo ?? Step 2: Test Custom Role Failures  
echo   ? Login as custom role user with equivalent permissions
echo   ? Test SAME API endpoints as Super Admin
echo   ? Record all failure points and error messages
echo   ? Compare JWT token with Super Admin token
echo.
echo ?? Step 3: Identify Key Differences
echo   ? JWT token claim differences
echo   ? User ID extraction success/failure patterns
echo   ? Authorization logic differences
echo   ? Database record access differences
echo.
echo ?? Step 4: Apply Systematic Fixes
echo   ? Fix JWT token generation for consistency
echo   ? Standardize User ID extraction across user types
echo   ? Ensure authorization logic works for all roles
echo   ? Validate database records for all user types

pause

echo ?? EXPECTED DIFFERENCE SCENARIOS:
echo ================================
echo.
echo ?? Scenario 1: JWT Token Claims Missing
echo   SYMPTOMS: Custom roles get authentication errors
echo   ROOT CAUSE: JWT token missing nameid or userId claims
echo   SOLUTION: Fix JWT token generation in AuthService
echo.
echo ?? Scenario 2: User ID Extraction Failure
echo   SYMPTOMS: 500 errors on operations requiring user ID
echo   ROOT CAUSE: GetUserIdFromToken fails for custom role tokens
echo   SOLUTION: Enhanced GetUserIdFromToken with multiple claim types
echo.
echo ?? Scenario 3: Permission System Bypass
echo   SYMPTOMS: Super Admin bypasses permission checks
echo   ROOT CAUSE: Special logic for Super Admin role
echo   SOLUTION: Consistent permission checking for all users
echo.
echo ?? Scenario 4: Database Record Differences
echo   SYMPTOMS: Foreign key constraint errors for custom roles
echo   ROOT CAUSE: Custom role users missing required database records
echo   SOLUTION: Fix user creation and database integrity

echo.
echo ?? IMMEDIATE DIAGNOSTIC ACTIONS:
echo ==============================
echo.
echo 1. ?? COMPARE TOKENS: Decode and compare JWT structures
echo 2. ?? TEST APIS: Same endpoints, different user types
echo 3. ?? ANALYZE LOGS: Backend logs for both user types
echo 4. ?? IDENTIFY PATTERN: Where exactly custom roles fail
echo 5. ?? APPLY TARGETED FIX: Based on identified root cause
echo.
echo Begin comprehensive API behavior comparison now! ??
pause