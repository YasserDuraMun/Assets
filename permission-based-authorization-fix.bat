@echo off
cls
echo ?? FIXING 403 FORBIDDEN ERRORS - PERMISSION BASED AUTHORIZATION
echo ================================================================

echo ?? PROBLEM IDENTIFIED:
echo   ? Controllers use hardcoded roles: [Authorize(Roles = "Super Admin,Admin,Manager,Employee,Viewer")]  
echo   ? New custom roles not in hardcoded list ? 403 Forbidden
echo   ? Dashboard, Assets, Reports APIs reject custom role users

echo ?? ROOT CAUSE:
echo   • DashboardController.cs: Hardcoded role authorization
echo   • AssetsController.cs: Hardcoded role authorization  
echo   • ReportsController.cs: Hardcoded role authorization
echo   • Other Controllers: Same issue

echo ?? SOLUTION APPLIED:
echo   ? Created RequirePermissionAttribute.cs - Permission-based authorization
echo   ? Updated DashboardController.cs - Uses permissions instead of roles
echo   ? Ready to update other Controllers with same fix

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo.
echo ?? NEXT STEPS REQUIRED:
echo ========================
echo.
echo ?? Manual Controller Updates Needed:
echo   1. AssetsController.cs - Replace [Authorize(Roles = "...")] with [RequirePermission("Assets", "view/insert/update/delete")]
echo   2. ReportsController.cs - Replace with [RequirePermission("Reports", "view")]
echo   3. TransfersController.cs - Replace with [RequirePermission("Transfers", "view/insert/update/delete")]
echo   4. Any other Controllers with hardcoded roles
echo.
echo ?? Example Replacement Pattern:
echo   BEFORE: [Authorize(Roles = "Super Admin,Admin,Manager,Employee,Viewer")]
echo   AFTER:  [RequirePermission("ScreenName", "action")]
echo.
echo   Where:
echo   • ScreenName: Dashboard, Assets, Reports, Transfers, etc.
echo   • action: view, insert, update, delete

echo ??? Starting Fixed Backend...
start "Backend - Permission Fix" cmd /k "echo ??? BACKEND - Permission-Based Authorization Fix && echo ========================================= && echo. && echo ?? APPLIED FIXES: && echo   • RequirePermissionAttribute.cs created && echo   • DashboardController.cs updated && echo   • Permission-based authorization active && echo. && echo ?? Expected Results: && echo   • Custom role users can access Dashboard && echo   • No more 403 errors for authorized users && echo   • Permission system works correctly && echo. && echo ?? Manual Steps Still Needed: && echo   • Update other Controllers manually && echo   • Replace hardcoded roles with RequirePermission && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 10

echo ?? Starting Frontend Test...
cd ClientApp

start "Frontend - Permission Test" cmd /k "echo ?? FRONTEND - Testing Permission Fix && echo =============================== && echo. && echo ?? TESTING SEQUENCE: && echo. && echo ?? Phase 1: Test Custom Role User && echo   1. Login with custom role user && echo   2. Navigate to Dashboard && echo   3. Should load data (no more 403 errors) && echo   4. Check browser Network tab for API calls && echo   5. All dashboard APIs should return 200 OK && echo. && echo ?? Phase 2: Verify Other Screens && echo   6. Try accessing other screens with permissions && echo   7. APIs should work based on actual permissions && echo   8. No hardcoded role restrictions && echo. && echo ?? Phase 3: Check Console Logs && echo   9. Backend should show permission checks && echo   10. RequirePermissionAttribute logging && echo   11. HasPermissionAsync calls && echo. && npm run dev"

echo.
echo ?? PERMISSION-BASED AUTHORIZATION FIX READY!
echo ==========================================
echo.

echo ?? SUCCESS INDICATORS:
echo.
echo ? Dashboard Fixed:
echo   ? Custom role users can access Dashboard
echo   ? /api/dashboard/statistics returns 200 OK  
echo   ? /api/dashboard/assets-by-status returns 200 OK
echo   ? /api/dashboard/assets-by-category returns 200 OK
echo   ? Dashboard displays data correctly
echo.
echo ? Permission System Working:
echo   ? RequirePermissionAttribute checks permissions
echo   ? Super Admin still has full access
echo   ? Custom roles work based on assigned permissions
echo   ? No more hardcoded role limitations
echo.
echo ?? Controllers Still Needing Updates:
echo   ? AssetsController.cs - Manual update required
echo   ? ReportsController.cs - Manual update required
echo   ? TransfersController.cs - Manual update required
echo   ? Any other Controllers with [Authorize(Roles = "...")]

pause

echo ?? EXPECTED RESULTS AFTER FULL FIX:
echo ===================================
echo.
echo ?? Custom Role '???? ???????' with Dashboard.view permission:
echo   BEFORE: 403 Forbidden on all dashboard APIs ?
echo   AFTER:  Dashboard loads with full data ?
echo.
echo ?? Custom Role '??? ?????' with Assets permissions:
echo   BEFORE: Cannot access Assets APIs ? 
echo   AFTER:  Full access to Assets based on permissions ?
echo.
echo ?? System Benefits:
echo   • No hardcoded role limitations
echo   • True permission-based access control
echo   • Unlimited custom roles supported
echo   • Granular permission management

echo.
echo Test the Dashboard fix first, then update other Controllers! ??
pause