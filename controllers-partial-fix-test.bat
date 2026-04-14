@echo off
cls
echo ?? FIXING ALL CONTROLLERS - PERMISSION-BASED AUTHORIZATION
echo ========================================================

echo ?? PROBLEM:
echo   ? Dashboard works - Fixed with RequirePermissionAttribute
echo   ? Assets screen empty - Still using hardcoded roles  
echo   ? Categories screen empty - Still using hardcoded roles
echo   ? All other screens empty - Same issue

echo ?? SOLUTION:
echo   • Replace all [Authorize(Roles = "...")] with [RequirePermission("Screen", "action")]
echo   • Add using Assets.Attributes; to each Controller
echo   • Test each screen after update

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo.
echo ?? MANUAL CONTROLLER UPDATES NEEDED:
echo ===================================
echo.
echo ?? Priority Controllers (User reported empty screens):

echo 1?? AssetsController.cs - ? PARTIALLY DONE
echo   • Added using Assets.Attributes;
echo   • Updated GET methods ? RequirePermission("Assets", "view")
echo   • Updated POST ? RequirePermission("Assets", "insert")  
echo   • Updated PUT ? RequirePermission("Assets", "update")
echo   • Updated DELETE ? RequirePermission("Assets", "delete")

echo 2?? CategoriesController.cs - ?? IN PROGRESS
echo   • Added using Assets.Attributes;
echo   • Updated main GET methods
echo   • Need to check for remaining methods

echo 3?? Other Critical Controllers - ?? NEED UPDATE:
echo   • TransfersController.cs
echo   • WarehousesController.cs  
echo   • DepartmentsController.cs
echo   • EmployeesController.cs
echo   • ReportsController.cs
echo   • MaintenanceController.cs

echo.
echo ??? Starting Backend with Current Fixes...
start "Backend - Partial Fix" cmd /k "echo ??? BACKEND - Controllers Partially Fixed && echo ================================== && echo. && echo ? Fixed Controllers: && echo   • DashboardController ? Should work && echo   • AssetsController ? Should work now && echo   • CategoriesController ? Partially fixed && echo. && echo ? Still Broken (need manual fix): && echo   • TransfersController && echo   • WarehousesController && echo   • Other Controllers && echo. && echo ?? Expected Results: && echo   • Dashboard: Full data ? && echo   • Assets: Should now show data ? && echo   • Categories: Should now show data ? && echo   • Others: Still empty until fixed ? && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 10

echo ?? Starting Frontend Test...
cd ClientApp

start "Frontend - Controller Fix Test" cmd /k "echo ?? FRONTEND - Controller Fix Testing && echo ============================ && echo. && echo ?? TESTING SEQUENCE: && echo. && echo ?? Phase 1: Test Fixed Controllers && echo   1. Login with custom role user && echo   2. Check Dashboard ? Should work ? && echo   3. Check Assets ? Should now work ? && echo   4. Check Categories ? Should now work ? && echo. && echo ?? Phase 2: Identify Remaining Issues && echo   5. Check other screens (Transfers, etc.) && echo   6. Note which screens still show empty && echo   7. Those need manual controller updates && echo. && echo ?? Phase 3: Network Tab Analysis && echo   8. Open browser DevTools ? Network tab && echo   9. Navigate to each screen && echo   10. Fixed controllers: 200 OK responses && echo   11. Broken controllers: 403 Forbidden responses && echo. && npm run dev"

echo.
echo ?? PARTIAL FIX READY - TEST CRITICAL CONTROLLERS!
echo ================================================
echo.

echo ?? SUCCESS INDICATORS:
echo.
echo ? Fixed Controllers (should work now):
echo   ? Dashboard: Data loads ?
echo   ? Assets: Data loads ?  
echo   ? Categories: Data loads ?
echo.
echo ? Still Broken Controllers (need manual fix):
echo   ? Transfers: Empty data, 403 errors
echo   ? Warehouses: Empty data, 403 errors  
echo   ? Departments: Empty data, 403 errors
echo   ? Reports: Empty data, 403 errors
echo   ? Others: Empty data, 403 errors

pause

echo ?? IMMEDIATE NEXT STEPS:
echo =======================
echo.
echo ?? If Assets & Categories now work:
echo   1. Confirm fixes are successful
echo   2. Apply same pattern to other Controllers  
echo   3. Continue with remaining Controllers one by one
echo.
echo ?? Pattern to Apply:
echo   1. Add: using Assets.Attributes;
echo   2. Replace: [Authorize(Roles = "...")] 
echo   3. With: [RequirePermission("ScreenName", "view/insert/update/delete")]
echo.
echo ?? Controllers Mapping:
echo   • TransfersController ? RequirePermission("Transfers", "...")
echo   • WarehousesController ? RequirePermission("Warehouses", "...")  
echo   • DepartmentsController ? RequirePermission("Departments", "...")
echo   • EmployeesController ? RequirePermission("Employees", "...")
echo   • ReportsController ? RequirePermission("Reports", "view")

echo.
echo Test the fixed controllers first! ??
pause