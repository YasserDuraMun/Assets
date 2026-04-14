@echo off
cls
echo ?? MAINTENANCE DATABASE ERROR FIX - USER ID AUTHENTICATION
echo ========================================================

echo ?? PROGRESS MADE:
echo   ? 403 Forbidden error RESOLVED - Permissions now work!
echo   ? Maintenance authorization working correctly
echo   ? NEW ISSUE: Database error on SaveChanges (User ID validation)

echo ?? ROOT CAUSE IDENTIFIED:
echo   • GetUserIdFromToken() returns null for custom role users
echo   • Fallback to userId = 1 fails (User ID 1 may not exist)
echo   • Entity Framework tries to save with invalid CreatedBy foreign key
echo   • Database constraint violation on AssetMaintenance.CreatedBy

echo ?? IMMEDIATE FIX APPLIED:
echo   ? Remove fallback to userId = 1
echo   ? Proper user authentication check in CreateMaintenance
echo   ? Return 401 Unauthorized if no valid user ID found
echo   ? Enhanced logging to track user ID extraction

echo ?? EXPECTED BEHAVIOR NOW:
echo   • If user token is valid ? Extract correct user ID ? Create maintenance successfully
echo   • If user token is invalid ? Return 401 Unauthorized (clear error message)
echo   • No more database foreign key constraint violations

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting Backend with User ID Fix...
start "Backend - User ID Fix" cmd /k "echo ??? BACKEND - Maintenance User ID Authentication Fix && echo ================================== && echo. && echo ? USER ID VALIDATION FIX APPLIED: && echo   • CreateMaintenance now validates user ID from token && echo   • No more fallback to non-existent userId = 1 && echo   • Proper authentication error handling && echo   • Enhanced logging for user ID extraction && echo. && echo ?? DEBUG LOGGING ENABLED: && echo   • Will show user ID extraction process && echo   • Will log successful maintenance creation && echo   • Will identify authentication issues clearly && echo. && echo ?? EXPECTED FLOW: && echo   1. User makes POST /api/maintenance request && echo   2. Extract user ID from JWT token && echo   3. If valid user ID ? Create maintenance with real user ID && echo   4. If invalid/missing ? Return 401 Unauthorized && echo   5. Database saves with valid foreign key relationship && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 10

echo ?? Starting Frontend User ID Test...
cd ClientApp

start "Frontend - User ID Fix Test" cmd /k "echo ?? FRONTEND - Maintenance User ID Fix Test && echo ============================== && echo. && echo ?? MAINTENANCE USER AUTHENTICATION TEST: && echo. && echo ?? Phase 1: Token and User ID Validation && echo   1. Login with custom role user that has Maintenance.insert permission && echo   2. Check browser Developer Tools ? Network tab && echo   3. Verify JWT token is being sent with requests && echo   4. Check token contains valid user ID claim && echo. && echo ?? Phase 2: Maintenance Creation Test && echo   5. Navigate to assets and select an asset && echo   6. Try to create maintenance request && echo   7. Check backend console logs for: && echo      • 'Creating maintenance record for Asset ID: X' && echo      • 'Using User ID: Y for maintenance' && echo      • 'Maintenance record created successfully with ID: Z' && echo. && echo ?? Phase 3: Error Handling Verification && echo   8. If still getting errors, check: && echo      • Backend logs for user ID extraction issues && echo      • Network tab for 401 vs 500 errors && echo      • JWT token validity and claims && echo. && echo ?? Phase 4: Success Validation && echo   9. Successful creation should show: && echo      • Backend: 'Maintenance record created successfully' && echo      • Frontend: Success message in UI && echo      • Network: 201 Created response && echo      • Database: New maintenance record with correct CreatedBy && echo. && npm run dev"

echo.
echo ?? MAINTENANCE USER ID FIX READY!
echo ===============================
echo.

echo ?? SUCCESS INDICATORS:
echo.
echo ? Authentication Working:
echo   ? Backend logs show valid user ID extracted from token
echo   ? User ID is not null and not defaulting to 1
echo   ? Token contains proper NameIdentifier claim
echo.
echo ? Maintenance Creation Success:
echo   ? POST /api/maintenance returns 201 Created
echo   ? Backend logs: 'Maintenance record created successfully'
echo   ? Frontend shows success message
echo   ? No database foreign key constraint errors
echo.
echo ? Error Handling:
echo   ? Invalid/missing tokens return 401 Unauthorized
echo   ? Clear error messages for authentication issues
echo   ? No more fallback to invalid user IDs
echo.
echo ? If Still Getting Errors:
echo   ? Check if JWT token contains NameIdentifier claim
echo   ? Verify user exists in database with correct ID
echo   ? Check token is not expired or corrupted
echo   ? Verify login process sets correct user claims

pause

echo ?? DEBUGGING STEPS IF ISSUE PERSISTS:
echo ====================================
echo.
echo ?? Step 1: Verify JWT Token Contents
echo   • Open browser Developer Tools ? Application tab
echo   • Check localStorage or sessionStorage for JWT token
echo   • Use jwt.io to decode token and verify claims
echo   • Look for "nameid" or "sub" claim with user ID
echo.
echo ?? Step 2: Check User Authentication Flow
echo   • Verify login process creates correct JWT token
echo   • Check AuthController sets proper user ID claim
echo   • Ensure JWT configuration includes NameIdentifier
echo.
echo ?? Step 3: Database Validation
echo   • Check Users table for the logged-in user
echo   • Verify user ID exists and is correct
echo   • Check AssetMaintenance foreign key constraints
echo.
echo ?? Step 4: Alternative Solutions
echo   • If user ID extraction fails, may need to fix JWT claims
echo   • If user doesn't exist, may need to create/update user
echo   • If foreign key constraint, may need to adjust database

echo.
echo ?? EXPECTED RESOLUTION:
echo ======================
echo.
echo ? After Fix:
echo   • Maintenance creation works with custom role users
echo   • Proper user ID extracted from JWT token
echo   • Database saves with valid CreatedBy foreign key
echo   • No more "entity changes" save errors
echo.
echo ? System Behavior:
echo   • Authentication: JWT tokens properly validated
echo   • Authorization: Permissions work correctly
echo   • Data Integrity: Foreign key relationships maintained
echo   • User Experience: Clear error messages and success feedback

echo.
echo ?? Test maintenance creation now! ??
pause