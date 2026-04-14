@echo off
cls
echo ?? CRUD OPERATIONS FIX - SETTINGS SCREENS
echo ========================================

echo ?? PROBLEM TO SOLVE:
echo   ? CRUD operations (Add, Edit, Delete) not working properly
echo   ? Permission issues with insert/update/delete operations  
echo   ? Forms may have validation or API call issues

echo ?? CONTROLLERS FIXED FOR CRUD:
echo   ? CategoriesController: All CRUD operations use RequirePermission
echo   ? DepartmentsController: Fixed POST/PUT/DELETE authorization  
echo   ? WarehousesController: Fixed POST/PUT/DELETE authorization
echo   ? EmployeesController: Already fixed in previous updates
echo   ?? Need to verify: Asset Statuses CRUD operations

echo ?? TARGETS TO TEST:
echo   • ?????? ??????? ??????? (Categories & Subcategories)
echo   • ???????? ???????? (Departments & Sections)
echo   • ???????? (Employees)
echo   • ?????????? (Warehouses)
echo   • ????? ?????? (Asset Statuses)

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting Backend with CRUD Fixes...
start "Backend - CRUD Fix" cmd /k "echo ??? BACKEND - CRUD Operations Fixed && echo ========================= && echo. && echo ? FIXED AUTHORIZATION: && echo   • Categories: insert/update/delete permissions && echo   • Departments: insert/update/delete permissions && echo   • Warehouses: insert/update/delete permissions && echo   • Employees: insert/update/delete permissions && echo. && echo ?? CRUD Operations Now Permission-Based: && echo   • POST ? RequirePermission([Screen], insert) && echo   • PUT ? RequirePermission([Screen], update) && echo   • DELETE ? RequirePermission([Screen], delete) && echo   • GET ? RequirePermission([Screen], view) && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 10

echo ?? Starting Frontend CRUD Testing...
cd ClientApp

start "Frontend - CRUD Test" cmd /k "echo ?? FRONTEND - CRUD Operations Test && echo =========================== && echo. && echo ?? COMPREHENSIVE CRUD TEST SEQUENCE: && echo. && echo ?? Phase 1: Login with Full Permissions && echo   1. Login with user that has all CRUD permissions: && echo      • Categories: view, insert, update, delete && echo      • Departments: view, insert, update, delete && echo      • Employees: view, insert, update, delete && echo      • Warehouses: view, insert, update, delete && echo      • Assets: view, insert, update, delete && echo. && echo ?? Phase 2: Test Categories CRUD && echo   2. Go to /categories ? Test: && echo      • View categories list ? && echo      • Add new category (form validation + save) && echo      • Edit existing category && echo      • Delete category && echo      • Add subcategory to existing category && echo. && echo ?? Phase 3: Test Departments CRUD && echo   3. Go to /departments ? Test: && echo      • View departments list ? && echo      • Add new department && echo      • Edit existing department && echo      • Delete department && echo. && echo ?? Phase 4: Test Employees CRUD && echo   4. Go to /employees ? Test: && echo      • View employees list ? && echo      • Add new employee && echo      • Edit existing employee && echo      • Delete employee && echo. && echo ?? Phase 5: Test Warehouses CRUD && echo   5. Go to /warehouses ? Test: && echo      • View warehouses list ? && echo      • Add new warehouse && echo      • Edit existing warehouse && echo      • Delete warehouse && echo. && npm run dev"

echo.
echo ?? CRUD OPERATIONS TESTING READY!
echo ================================
echo.

echo ?? SUCCESS INDICATORS:
echo.
echo ? CRUD Authorization Fixed:
echo   ? No more 403 errors on POST/PUT/DELETE operations
echo   ? Custom roles can perform CRUD based on permissions
echo   ? Add/Edit forms submit successfully
echo   ? Delete operations work without authorization errors
echo.
echo ? Categories CRUD:
echo   ? Can add new categories with proper validation
echo   ? Can edit existing categories
echo   ? Can delete categories (soft delete)
echo   ? Can manage subcategories
echo.
echo ? Departments CRUD:
echo   ? Can add new departments
echo   ? Can edit existing departments  
echo   ? Can delete departments
echo   ? Proper validation and error handling
echo.
echo ? Employees CRUD:
echo   ? Can add new employees
echo   ? Can edit existing employees
echo   ? Can delete employees
echo   ? Department assignment works
echo.
echo ? Warehouses CRUD:
echo   ? Can add new warehouses
echo   ? Can edit existing warehouses
echo   ? Can delete warehouses
echo   ? Location and capacity management works

pause

echo ?? TESTING WORKFLOW:
echo ===================
echo.
echo ?? For Each Settings Screen:
echo   1. Navigate to the specific screen (/categories, /departments, etc.)
echo   2. Verify list loads correctly (VIEW operation)
echo   3. Click "Add New" button:
echo      • Form should open
echo      • Fill required fields
echo      • Submit form
echo      • Should save successfully and refresh list
echo   4. Click "Edit" on existing item:
echo      • Form should populate with current data
echo      • Modify fields
echo      • Submit form
echo      • Should update successfully
echo   5. Click "Delete" on item:
echo      • Should show confirmation dialog
echo      • Confirm deletion
echo      • Item should be removed from list
echo.
echo ?? Common Issues to Watch For:
echo   • 403 Forbidden errors ? Permission not granted
echo   • 400 Bad Request errors ? Validation issues
echo   • 500 Server errors ? Backend service issues
echo   • Form not submitting ? Frontend validation issues
echo   • Data not refreshing ? State management issues

echo.
echo ?? EXPECTED RESULTS:
echo ===================
echo.
echo ? BEFORE FIX:
echo   • View operations worked
echo   • Add/Edit/Delete operations had permission errors
echo   • 403 Forbidden responses for CRUD operations
echo.
echo ? AFTER FIX:
echo   • All CRUD operations work based on user permissions
echo   • Proper form validation and submission
echo   • Success messages and list refresh
echo   • Permission-based button visibility
echo.
echo ? PERMISSION BEHAVIOR:
echo   • Users with insert permission: Can add new items
echo   • Users with update permission: Can edit existing items
echo   • Users with delete permission: Can delete items
echo   • Users without permissions: Buttons hidden/disabled

echo.
echo Start comprehensive CRUD testing now! ??
pause