@echo off
cls
echo ?? TARGETED FIX: USER ID 3 JWT TOKEN AUTHENTICATION
echo ================================================

echo ?? DATABASE ANALYSIS COMPLETE:
echo   ? User ID 1 (Super Admin): haya zeer - admin@assets.ps
echo   ? User ID 3 (Custom Role): salem - haya1.alzeer1992@gmail.com  
echo   ? Both users exist in SecurityUsers table
echo   ?? Issue: JWT token claims processing differs between users

echo ?? TARGETED SOLUTION APPROACH:
echo   • Focus on User ID 3 (salem - haya1.alzeer1992@gmail.com)
echo   • Compare JWT token structure between User ID 1 and User ID 3
echo   • Fix CurrentUserService.UserId extraction for custom role users
echo   • Ensure consistent authentication across all user types

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting Backend with User ID 3 Specific Diagnostics...
start "Backend - User ID 3 Fix" cmd /k "echo ??? BACKEND - User ID 3 JWT Authentication Fix && echo ========================== && echo. && echo ?? SPECIFIC USER AUTHENTICATION TARGET: && echo   • Super Admin (ID: 1): haya zeer - admin@assets.ps && echo   • Custom Role (ID: 3): salem - haya1.alzeer1992@gmail.com && echo   • Problem: User ID 3 cannot create maintenance (500 error) && echo   • Solution: Fix JWT claims processing for User ID 3 && echo. && echo ?? ENHANCED DIAGNOSTICS FOR USER ID 3: && echo   • JWT token structure analysis for both users && echo   • CurrentUserService.UserId extraction comparison && echo   • GetUserIdFromToken method validation && echo   • MaintenanceController user authentication flow && echo. && echo ?? WATCH FOR USER-SPECIFIC LOGS: && echo   • Login events for both users && echo   • JWT token generation differences && echo   • User ID extraction success/failure patterns && echo   • Maintenance creation attempts with detailed user info && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 10

echo ?? Starting Frontend User ID 3 Specific Test...
cd ClientApp

start "Frontend - User ID 3 Test" cmd /k "echo ?? FRONTEND - User ID 3 Authentication Test && echo ======================== && echo. && echo ?? TARGETED USER ID 3 MAINTENANCE TEST: && echo. && echo ?? Phase 1: User ID 3 Login and Token Analysis && echo   1. Login as: salem (haya1.alzeer1992@gmail.com) && echo   2. Password: password123 (or user's actual password) && echo   3. After login, check JWT token: && echo      • Open Developer Tools ? Application ? localStorage && echo      • Copy JWT token and decode at jwt.io && echo      • Verify token contains: nameid=3, userId=3, email=haya1.alzeer1992@gmail.com && echo. && echo ?? Phase 2: Maintenance Creation Test && echo   4. Navigate to assets page && echo   5. Select any asset for maintenance && echo   6. Fill maintenance form: && echo      • Type: Preventive Maintenance && echo      • Date: Today && echo      • Description: 'User ID 3 test maintenance' && echo   7. Submit and monitor backend console for User ID 3 specific logs && echo. && echo ?? Phase 3: Comparative Analysis && echo   8. If User ID 3 fails, logout and login as Super Admin && echo   9. Test same maintenance creation process && echo   10. Compare JWT tokens and authentication flows && echo. && npm run dev"

echo.
echo ?? USER ID 3 TARGETED AUTHENTICATION FIX READY!
echo ==============================================
echo.

echo ?? USER ID 3 SPECIFIC SUCCESS INDICATORS:
echo.
echo ? Authentication Success:
echo   ? User ID 3 (salem) logs in successfully
echo   ? JWT token contains correct claims: nameid=3, userId=3
echo   ? CurrentUserService.UserId returns 3 (not null)
echo   ? Backend logs show "Final User ID: 3" for maintenance creation
echo.
echo ? Maintenance Creation Success:
echo   ? POST /api/maintenance returns 201 Created (not 500)
echo   ? Backend logs: "SUCCESS: Created maintenance record with ID: X"
echo   ? Frontend shows: "?? ????? ??? ??????? ?????"
echo   ? Maintenance appears in maintenance list
echo.
echo ? If User ID 3 Still Fails:
echo   ? Check JWT token structure at jwt.io
echo   ? Verify claims contain nameid or userId with value "3"
echo   ? Check CurrentUserService extraction logic
echo   ? Compare with successful Super Admin token

pause

echo ?? USER ID 3 SPECIFIC SOLUTIONS:
echo ===============================
echo.
echo ?? If JWT Token Missing Claims:
echo   ISSUE: User ID 3 token missing nameid or userId claims
echo   SOLUTION: Fix JwtTokenService.GenerateToken for all users
echo   ACTION: Ensure consistent claims for User ID 1 and User ID 3
echo.
echo ?? If CurrentUserService.UserId Null:
echo   ISSUE: CurrentUserService cannot extract User ID 3 from token
echo   SOLUTION: Enhanced claim checking in CurrentUserService
echo   ACTION: Check multiple claim types (nameid, userId, sub)
echo.
echo ?? If Database Foreign Key Issue:
echo   ISSUE: User ID 3 not found during maintenance creation
echo   SOLUTION: Verify User ID 3 exists in SecurityUsers table
echo   ACTION: Database validation and relationship checks

echo.
echo ?? IMMEDIATE VALIDATION FOR USER ID 3:
echo ====================================
echo.
echo 1. ?? LOGIN: Use salem account (haya1.alzeer1992@gmail.com)
echo 2. ?? TOKEN: Decode JWT at jwt.io to verify User ID 3 claims
echo 3. ?? TEST: Create maintenance and check backend logs for User ID 3
echo 4. ? VERIFY: Successful maintenance creation or identify exact failure point
echo.
echo Test User ID 3 maintenance creation now! ??
pause