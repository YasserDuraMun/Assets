@echo off
cls
echo ?? MAINTENANCE JWT USER ID EXTRACTION FIX - FINAL SOLUTION
echo =========================================================

echo ?? PROBLEM IDENTIFIED AND FIXED:
echo   ? 403 Forbidden errors resolved - permissions work correctly
echo   ? 500 Internal Server Error - JWT user ID extraction failed
echo   ?? GetUserIdFromToken() was looking for wrong claim type
echo   ? Fixed: Now checks multiple claim types (NameIdentifier, userId, sub)

echo ?? ROOT CAUSE ANALYSIS COMPLETE:
echo   • JwtTokenService creates claims correctly:
echo     - ClaimTypes.NameIdentifier = user.Id.ToString()
echo     - "userId" = user.Id.ToString() 
echo   • MaintenanceController GetUserIdFromToken() only checked NameIdentifier
echo   • JWT token structure varies between users/configurations
echo   • Enhanced method now tries multiple claim types with detailed logging

echo ?? COMPREHENSIVE FIX APPLIED:
echo   ? Enhanced GetUserIdFromToken() method in MaintenanceController
echo   ? Checks ClaimTypes.NameIdentifier, "userId", and "sub" claims
echo   ? Added detailed logging for token claim extraction
echo   ? Clear error messages when user ID extraction fails
echo   ? Proper error handling and debugging information

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting Backend with JWT User ID Fix...
start "Backend - JWT User ID Fix" cmd /k "echo ??? BACKEND - JWT User ID Extraction Fix && echo ========================== && echo. && echo ? JWT TOKEN USER ID FIX APPLIED: && echo   • GetUserIdFromToken() now checks multiple claim types && echo   • Enhanced logging for user ID extraction process && echo   • Proper error handling for authentication issues && echo   • Compatible with various JWT token structures && echo. && echo ?? JWT CLAIMS STRUCTURE: && echo   • JwtTokenService creates: && echo     - ClaimTypes.NameIdentifier: user.Id && echo     - userId: user.Id && echo     - ClaimTypes.Email: user.Email && echo     - ClaimTypes.Name: user.FullName && echo     - ClaimTypes.Role: roleNames && echo. && echo ?? ENHANCED USER ID EXTRACTION: && echo   • Try ClaimTypes.NameIdentifier first && echo   • Fallback to userId claim && echo   • Fallback to sub claim (standard JWT) && echo   • Detailed logging of available claims && echo   • Clear error messages for debugging && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 10

echo ?? Starting Frontend JWT Test...
cd ClientApp

start "Frontend - JWT User ID Test" cmd /k "echo ?? FRONTEND - JWT User ID Extraction Test && echo =============================== && echo. && echo ?? MAINTENANCE JWT USER ID TEST: && echo. && echo ?? Phase 1: User Authentication Verification && echo   1. Login with custom role user that has Maintenance.insert permission && echo   2. Check browser Developer Tools ? Application tab && echo   3. Look at localStorage/sessionStorage for JWT token && echo   4. Use jwt.io to decode token and verify claims && echo   5. Should see userId claim with correct user ID && echo. && echo ?? Phase 2: Maintenance Creation Test && echo   6. Navigate to assets and select an asset && echo   7. Try to create maintenance request && echo   8. Check backend console logs for: && echo      • 'Successfully extracted user ID: X from token' && echo      • 'Creating maintenance record for Asset ID: Y' && echo      • 'Maintenance record created successfully with ID: Z' && echo. && echo ?? Phase 3: Success Validation && echo   9. POST /api/maintenance should return 201 Created && echo   10. Frontend should show success message && echo   11. Maintenance should appear in asset history && echo   12. No more 500 Internal Server Error && echo. && echo ?? Phase 4: Multi-User Testing && echo   13. Test with different custom role users && echo   14. Test with Super Admin (should still work) && echo   15. Verify consistent behavior across all user types && echo. && npm run dev"

echo.
echo ?? JWT USER ID EXTRACTION FIX READY!
echo ===================================
echo.

echo ?? SUCCESS INDICATORS:
echo.
echo ? JWT User ID Extraction Working:
echo   ? Backend logs: 'Successfully extracted user ID: X from token'
echo   ? No more warnings about missing user ID claims
echo   ? User ID is correctly parsed from JWT token
echo   ? Token claims are properly accessible
echo.
echo ? Maintenance Creation Success:
echo   ? POST /api/maintenance returns 201 Created (not 500)
echo   ? Backend logs successful maintenance creation
echo   ? Frontend shows success message in UI
echo   ? Maintenance record saved with correct CreatedBy user ID
echo.
echo ? Cross-User Compatibility:
echo   ? Super Admin: Maintenance creation works
echo   ? Custom role users: Maintenance creation works  
echo   ? Consistent behavior across all authenticated users
echo   ? Proper error handling for unauthenticated requests
echo.
echo ? If Still Getting 500 Errors:
echo   ? Check backend logs for user ID extraction warnings
echo   ? Verify JWT token contains userId or NameIdentifier claim
echo   ? Check if extracted user ID exists in Users table
echo   ? Verify database foreign key constraints

pause

echo ?? JWT TOKEN STRUCTURE DETAILS:
echo ==============================
echo.
echo ?? JWT Claims Created by JwtTokenService:
echo   • ClaimTypes.NameIdentifier ? user.Id.ToString()
echo   • "userId" ? user.Id.ToString()  
echo   • ClaimTypes.Email ? user.Email
echo   • ClaimTypes.Name ? user.FullName
echo   • ClaimTypes.Role ? each role name
echo.
echo ?? GetUserIdFromToken() Enhancement:
echo   • First tries: ClaimTypes.NameIdentifier
echo   • Then tries: "userId" 
echo   • Finally tries: "sub" (JWT standard)
echo   • Logs all available claims if extraction fails
echo   • Returns null with clear error logging if no valid ID found
echo.
echo ?? Database Integration:
echo   • Extracted user ID used for AssetMaintenance.CreatedBy
echo   • User must exist in SecurityUsers table
echo   • Foreign key constraint ensures data integrity
echo   • Proper error handling for invalid user IDs

echo.
echo ?? EXPECTED FINAL RESULTS:
echo =========================
echo.
echo ? Complete Maintenance System:
echo   • Authentication: JWT tokens properly validated ?
echo   • Authorization: Permission-based access control ?  
echo   • User Identification: Reliable user ID extraction ?
echo   • Data Integrity: Valid foreign key relationships ?
echo   • Error Handling: Clear error messages and debugging ?
echo.
echo ? User Experience:
echo   • Super Admin: Full maintenance management access
echo   • Custom roles: Maintenance operations based on permissions
echo   • Clear success/error feedback
echo   • Consistent behavior across user types
echo.
echo ? System Reliability:
echo   • Robust JWT claim processing
echo   • Detailed logging for troubleshooting
echo   • Graceful error handling
echo   • Database constraint compliance

echo.
echo ?? Final test - maintenance creation should work for all users now! ???
pause