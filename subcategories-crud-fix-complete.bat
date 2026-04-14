@echo off
cls
echo ?? SUBCATEGORIES CRUD FIX - COMPLETE AUTHORIZATION
echo ================================================

echo ?? PROBLEM IDENTIFIED:
echo   ? ??? ????? ???? ?????? ???????
echo   ? SubCategories methods in CategoriesController used hardcoded roles
echo   ? Custom roles couldn't perform subcategory operations

echo ?? AUTHORIZATION FIXED:
echo   ? GET /categories/{id}/subcategories ? RequirePermission("Categories", "view")
echo   ? POST /categories/subcategories ? RequirePermission("Categories", "insert") 
echo   ? PUT /categories/subcategories/{id} ? RequirePermission("Categories", "update")
echo   ? DELETE /categories/subcategories/{id} ? RequirePermission("Categories", "delete")

echo ?? SUBCATEGORIES OPERATIONS NOW SUPPORTED:
echo   • ??? ?????? ??????? ???? ????? (GET)
echo   • ????? ??? ????? ????? (POST)
echo   • ????? ??? ????? ?????? (PUT)  
echo   • ??? ??? ????? (DELETE)

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting Backend with SubCategories Fix...
start "Backend - SubCategories" cmd /k "echo ??? BACKEND - SubCategories Authorization Fixed && echo =============================== && echo. && echo ? SUBCATEGORIES ENDPOINTS FIXED: && echo   • All subcategory operations now use RequirePermission && echo   • No more hardcoded role restrictions && echo   • Custom roles can manage subcategories && echo. && echo ?? SUBCATEGORIES API ENDPOINTS: && echo   • GET /api/categories/{id}/subcategories ? View subcategories && echo   • POST /api/categories/subcategories ? Create subcategory && echo   • PUT /api/categories/subcategories/{id} ? Update subcategory && echo   • DELETE /api/categories/subcategories/{id} ? Delete subcategory && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 10

echo ?? Starting Frontend SubCategories Test...
cd ClientApp

start "Frontend - SubCategories" cmd /k "echo ?? FRONTEND - SubCategories CRUD Test && echo ========================== && echo. && echo ?? SUBCATEGORIES TEST SEQUENCE: && echo. && echo ?? Phase 1: Login and Navigate && echo   1. Login with user having Categories permissions: && echo      • Categories.view ? Can view subcategories && echo      • Categories.insert ? Can add subcategories && echo      • Categories.update ? Can edit subcategories && echo      • Categories.delete ? Can delete subcategories && echo   2. Navigate to /categories page && echo. && echo ?? Phase 2: Test SubCategories Viewing && echo   3. Categories page should load successfully && echo   4. Should see both Categories and SubCategories tabs && echo   5. Click on SubCategories tab ? Should show list && echo   6. SubCategories should load without 403 errors && echo. && echo ?? Phase 3: Test SubCategories CRUD && echo   7. Add New SubCategory: && echo      • Click 'Add SubCategory' button && echo      • Fill form (name, description, select category) && echo      • Submit ? Should save successfully && echo   8. Edit SubCategory: && echo      • Click Edit on existing subcategory && echo      • Modify fields && echo      • Submit ? Should update successfully && echo   9. Delete SubCategory: && echo      • Click Delete on subcategory && echo      • Confirm deletion ? Should delete successfully && echo. && echo ?? Phase 4: Network Tab Verification && echo   10. Check browser Network tab: && echo       • All subcategory APIs should return 200 OK && echo       • No 403 Forbidden errors && echo       • Proper data loading and saving && echo. && npm run dev"

echo.
echo ?? SUBCATEGORIES FIX READY FOR TESTING!
echo ======================================
echo.

echo ?? SUCCESS INDICATORS:
echo.
echo ? SubCategories Display:
echo   ? /categories page loads successfully
echo   ? SubCategories tab is visible and clickable
echo   ? SubCategories list loads without errors
echo   ? Data displays correctly with category names
echo.
echo ? SubCategories CRUD Operations:
echo   ? Can view all subcategories
echo   ? Can add new subcategory (form submission works)
echo   ? Can edit existing subcategory (data loads and saves)
echo   ? Can delete subcategory (confirmation and removal works)
echo.
echo ? Permission-Based Access:
echo   ? Super Admin: Full access to all operations
echo   ? Custom roles: Access based on Categories permissions
echo   ? Users without Categories.view: Cannot see subcategories
echo   ? Users without insert/update/delete: Buttons disabled/hidden
echo.
echo ? Technical Validation:
echo   ? Network tab shows 200 OK for all subcategory APIs
echo   ? No 403 Forbidden errors on any operation
echo   ? Proper error handling and success messages
echo   ? Data refreshes correctly after operations

pause

echo ?? DETAILED TESTING WORKFLOW:
echo =============================
echo.
echo ?? SubCategories CRUD Test Steps:
echo.
echo ?? Step 1: Navigation Test
echo   • Login with user having Categories.view permission
echo   • Navigate to /categories
echo   • Should see page load without access denied errors
echo.
echo ?? Step 2: View SubCategories
echo   • Look for SubCategories section/tab in categories page
echo   • Should display list of existing subcategories
echo   • Each subcategory should show: name, code, parent category
echo.
echo ?? Step 3: Add New SubCategory
echo   • Click "Add SubCategory" or similar button
echo   • Form should open with fields:
echo     - Name (required)
echo     - Code (auto-generated or editable)
echo     - Description (optional)
echo     - Parent Category (dropdown selection)
echo   • Fill form and submit
echo   • Should see success message and list refresh
echo.
echo ?? Step 4: Edit SubCategory
echo   • Click Edit button on existing subcategory
echo   • Form should populate with current data
echo   • Modify fields and submit
echo   • Should see success message and updated data
echo.
echo ?? Step 5: Delete SubCategory
echo   • Click Delete button on subcategory
echo   • Should show confirmation dialog
echo   • Confirm deletion
echo   • SubCategory should be removed from list

echo.
echo ?? EXPECTED RESULTS:
echo ===================
echo.
echo ? BEFORE FIX:
echo   • SubCategories viewing failed (403 errors)
echo   • Adding subcategories failed (authorization errors)
echo   • Custom roles couldn't manage subcategories
echo.
echo ? AFTER FIX:
echo   • All subcategory operations work with permission-based access
echo   • Custom roles can manage subcategories based on Categories permissions
echo   • No more hardcoded role limitations
echo   • Complete CRUD functionality restored

echo.
echo ?? COMMON ISSUES TO WATCH FOR:
echo ==============================
echo.
echo ? If Still Getting 403 Errors:
echo   • Check user has Categories.view permission for viewing
echo   • Check user has Categories.insert for adding
echo   • Check user has Categories.update for editing  
echo   • Check user has Categories.delete for removing
echo.
echo ? If Forms Don't Submit:
echo   • Check browser console for validation errors
echo   • Check network tab for API call failures
echo   • Verify required fields are filled correctly
echo.
echo ? If Data Doesn't Load:
echo   • Check if parent categories exist
echo   • Check API response format in network tab
echo   • Look for JavaScript errors in console

echo.
echo Test SubCategories functionality now! ??
pause