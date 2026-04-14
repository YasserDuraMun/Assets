@echo off
cls
echo ?? EMPLOYEES API 403 FORBIDDEN - URGENT FIX APPLIED
echo =================================================

echo ?? PROBLEM IDENTIFIED AND FIXED:
echo   ? GET /api/employees/active returned 403 Forbidden
echo   ? EmployeesController /active endpoint used hardcoded roles
echo   ? User couldn't load employees dropdown in WarehousesPage
echo   ? Fixed: Updated to RequirePermission("Employees", "view")

echo ?? EMPLOYEESCONTROLLER FIXES APPLIED:
echo   ? GET /api/employees/active ? RequirePermission("Employees", "view")
echo   ? DELETE /api/employees/{id} ? RequirePermission("Employees", "delete")
echo   ? POST /api/employees/{id}/generate-qrcode ? RequirePermission("Employees", "insert")

echo ?? ROOT CAUSE RESOLUTION:
echo   • WarehousesPage tries to load active employees for dropdown
echo   • User needs Employees.view permission to access employee data
echo   • Now uses consistent permission-based authorization
echo   • Should work with custom roles that have Employees permissions

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting Backend with Employees Fix...
start "Backend - Employees Fix" cmd /k "echo ??? BACKEND - Employees API 403 Fix Applied && echo ============================ && echo. && echo ? EMPLOYEES ENDPOINTS FIXED: && echo   • /api/employees/active now uses Employees.view permission && echo   • No more hardcoded role restrictions && echo   • Custom roles with Employees permissions can access && echo. && echo ?? EMPLOYEES API PERMISSIONS: && echo   • GET /api/employees ? Employees.view && echo   • GET /api/employees/{id} ? Employees.view && echo   • GET /api/employees/active ? Employees.view (FIXED) && echo   • POST /api/employees ? Employees.insert && echo   • PUT /api/employees/{id} ? Employees.update && echo   • DELETE /api/employees/{id} ? Employees.delete (FIXED) && echo   • POST /api/employees/{id}/generate-qrcode ? Employees.insert (FIXED) && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 10

echo ?? Starting Frontend Employees Test...
cd ClientApp

start "Frontend - Employees Fix" cmd /k "echo ?? FRONTEND - Employees 403 Fix Test && echo ========================== && echo. && echo ?? EMPLOYEES API FIX VALIDATION: && echo. && echo ?? Phase 1: Test WarehousesPage Employee Loading && echo   1. Login with user having Employees.view permission && echo   2. Navigate to /warehouses page && echo   3. Try to add new warehouse or edit existing one && echo   4. Employee dropdown should load without 403 error && echo   5. Should see list of active employees && echo. && echo ?? Phase 2: Test Direct Employees Management && echo   6. Navigate to /employees page && echo   7. Should see employees list load successfully && echo   8. Test Add/Edit/Delete operations (based on permissions) && echo. && echo ?? Phase 3: Permission Verification && echo   9. Check browser console for success messages && echo   10. Network tab should show 200 OK for /api/employees/active && echo   11. No more 403 Forbidden errors on employee operations && echo. && echo ?? Phase 4: Cross-Screen Integration && echo   12. Test employee dropdown in other screens: && echo       • Asset assignment to employees && echo       • Department/Section employee assignment && echo       • Any other employee selection dropdowns && echo. && npm run dev"

echo.
echo ?? EMPLOYEES API FIX READY FOR TESTING!
echo ======================================
echo.

echo ?? SUCCESS INDICATORS:
echo.
echo ? WarehousesPage Employee Loading:
echo   ? /warehouses page loads without errors
echo   ? Add/Edit warehouse forms load employee dropdown
echo   ? Employee dropdown populated with active employees
echo   ? No 403 errors in browser console or network tab
echo.
echo ? Employees Management:
echo   ? /employees page loads successfully
echo   ? Can view employees list
echo   ? Can perform CRUD operations based on permissions
echo   ? QR code generation works (if has insert permission)
echo.
echo ? Permission-Based Access:
echo   ? Super Admin: Full access to all employee operations
echo   ? Custom roles with Employees.view: Can see employee data
echo   ? Custom roles with full Employees permissions: Can manage employees
echo   ? Users without Employees permissions: Cannot access employee data
echo.
echo ? Integration Validation:
echo   ? Employee dropdowns work in all relevant screens
echo   ? Asset assignment to employees functional
echo   ? Department employee assignments work
echo   ? Cross-screen employee references functional

pause

echo ?? EMPLOYEES PERMISSION REQUIREMENTS:
echo ====================================
echo.
echo ?? For WarehousesPage (Employee Dropdown):
echo   • User needs: Employees.view permission
echo   • Purpose: Load active employees for warehouse responsibility assignment
echo   • API call: GET /api/employees/active
echo.
echo ?? For Full Employee Management:
echo   • Employees.view ? View employees list and details
echo   • Employees.insert ? Create new employees, generate QR codes
echo   • Employees.update ? Edit employee information
echo   • Employees.delete ? Remove employees (soft delete)
echo.
echo ?? Permission Grant Instructions:
echo   1. Login as Super Admin
echo   2. Go to "????? ??????? ??????????"
echo   3. Select user's role
echo   4. Enable Employees permissions as needed:
echo      ? Employees.view (minimum for dropdowns)
echo      ? Employees.insert (for creating employees)
echo      ? Employees.update (for editing employees)
echo      ? Employees.delete (for removing employees)

echo.
echo ?? EXPECTED RESULTS:
echo ===================
echo.
echo ? BEFORE FIX:
echo   • WarehousesPage couldn't load employee dropdown (403 error)
echo   • Custom roles blocked from accessing employee data
echo   • Employee management inconsistent across screens
echo.
echo ? AFTER FIX:
echo   • WarehousesPage loads employee dropdown successfully
echo   • Custom roles can access employees based on permissions
echo   • Consistent employee access across all screens
echo   • Permission-based employee management fully functional

echo.
echo ?? QUICK TEST STEPS:
echo ===================
echo.
echo ?? Immediate Validation:
echo   1. Login with user who has Employees.view permission
echo   2. Go to /warehouses page
echo   3. Click "Add New Warehouse" or edit existing warehouse
echo   4. Employee dropdown should load without errors
echo   5. Should see list of active employees to select from
echo.
echo ?? If Still Getting 403:
echo   • Check user has Employees.view permission in role management
echo   • Verify permission is saved and applied
echo   • Try logging out and back in to refresh permissions
echo   • Test with Super Admin account first to confirm API works

echo.
echo Test the employees dropdown fix now! ????
pause