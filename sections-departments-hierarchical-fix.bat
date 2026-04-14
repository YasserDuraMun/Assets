@echo off
cls
echo ??? SECTIONS MANAGEMENT FIX - DEPARTMENTS HIERARCHICAL STRUCTURE
echo ==============================================================

echo ?? PROBLEM SOLVED:
echo   ? Sections (?????) CRUD operations had authorization issues
echo   ? Sections management under departments wasn't working with custom roles
echo   ? Hardcoded roles prevented custom role users from managing sections

echo ?? SECTIONSCONTROLLER AUTHORIZATION FIXED:
echo   ? GET /api/sections ? RequirePermission("Departments", "view")
echo   ? GET /api/sections/{id} ? RequirePermission("Departments", "view")
echo   ? GET /api/sections/by-department/{departmentId} ? RequirePermission("Departments", "view")
echo   ? POST /api/sections ? RequirePermission("Departments", "insert")
echo   ? PUT /api/sections/{id} ? RequirePermission("Departments", "update")
echo   ? DELETE /api/sections/{id} ? RequirePermission("Departments", "delete")

echo ?? DEPARTMENTS-SECTIONS HIERARCHY:
echo   ??? Departments (???????) ? Parent level
echo   ?? Sections (???????) ? Child level under departments
echo   • Each section belongs to a specific department
echo   • Sections inherit permissions from Departments screen
echo   • Full CRUD operations now permission-based

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting Backend with Sections Fix...
start "Backend - Sections Fix" cmd /k "echo ??? BACKEND - Sections Authorization Fixed && echo ========================== && echo. && echo ? SECTIONS API ENDPOINTS FIXED: && echo   • All sections operations now use RequirePermission && echo   • Permission scope: Departments (sections are sub-entities) && echo   • No more hardcoded role restrictions && echo   • Custom roles can manage sections based on Departments permissions && echo. && echo ??? DEPARTMENTS-SECTIONS STRUCTURE: && echo   • GET /api/departments ? View all departments && echo   • GET /api/sections ? View all sections && echo   • GET /api/sections/by-department/{id} ? View sections of specific department && echo   • POST /api/sections ? Create section under department && echo   • PUT /api/sections/{id} ? Update section && echo   • DELETE /api/sections/{id} ? Delete section && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 10

echo ?? Starting Frontend Sections Test...
cd ClientApp

start "Frontend - Sections CRUD" cmd /k "echo ?? FRONTEND - Departments ^& Sections Management && echo ==================================== && echo. && echo ?? SECTIONS MANAGEMENT TEST SEQUENCE: && echo. && echo ?? Phase 1: Navigate to Departments && echo   1. Login with user having Departments permissions: && echo      • Departments.view ? Can view departments and sections && echo      • Departments.insert ? Can add departments and sections && echo      • Departments.update ? Can edit departments and sections && echo      • Departments.delete ? Can delete departments and sections && echo   2. Navigate to /departments page && echo. && echo ?? Phase 2: Test Departments Management && echo   3. Departments tab should load successfully && echo   4. Should see departments list with CRUD operations && echo   5. Test Add/Edit/Delete departments && echo. && echo ?? Phase 3: Test Sections Management && echo   6. Look for Sections tab or section within departments page && echo   7. Should see sections list (possibly grouped by department) && echo   8. Test Sections CRUD Operations: && echo      • Add New Section: && echo        - Click 'Add Section' button && echo        - Select parent department && echo        - Fill section details (name, description) && echo        - Submit ? Should save successfully && echo      • Edit Section: && echo        - Click Edit on existing section && echo        - Modify section details && echo        - Submit ? Should update successfully && echo      • Delete Section: && echo        - Click Delete on section && echo        - Confirm deletion ? Should delete successfully && echo. && echo ?? Phase 4: Hierarchical Verification && echo   9. Verify sections are properly linked to departments && echo   10. Test filtering sections by department && echo   11. Ensure section operations don't affect parent departments && echo   12. Check proper parent-child relationship display && echo. && npm run dev"

echo.
echo ?? SECTIONS MANAGEMENT FIX READY!
echo ================================
echo.

echo ?? SUCCESS INDICATORS:
echo.
echo ? Sections Display:
echo   ? /departments page loads successfully
echo   ? Sections tab or section is visible and accessible
echo   ? Sections list loads without 403 errors
echo   ? Sections display with their parent department names
echo.
echo ? Sections CRUD Operations:
echo   ? Can view all sections or sections by department
echo   ? Can add new section with department selection
echo   ? Can edit existing sections (name, description, department)
echo   ? Can delete sections with proper confirmation
echo.
echo ? Hierarchical Management:
echo   ? Department-Section relationship is maintained
echo   ? Sections appear under correct departments
echo   ? Department deletion handling (if sections exist)
echo   ? Section filtering by department works
echo.
echo ? Permission-Based Access:
echo   ? Super Admin: Full access to departments and sections
echo   ? Custom roles: Access based on Departments permissions
echo   ? Users without Departments.view: Cannot see sections
echo   ? CRUD buttons enabled/disabled based on specific permissions

pause

echo ?? DETAILED SECTIONS TESTING WORKFLOW:
echo =====================================
echo.
echo ?? Comprehensive Sections Test:
echo.
echo ?? Step 1: Departments Access Test
echo   • Login with user having Departments.view permission
echo   • Navigate to /departments
echo   • Should see departments management interface
echo.
echo ?? Step 2: Sections Navigation
echo   • Look for "Sections" or "???????" tab/section
echo   • Should be able to access sections management
echo   • Sections should display with department information
echo.
echo ?? Step 3: Create New Section
echo   • Click "Add Section" or "????? ???" button
echo   • Form should open with fields:
echo     - Section Name (required)
echo     - Section Code (auto-generated or editable)
echo     - Description (optional)
echo     - Parent Department (dropdown selection)
echo   • Fill form and submit
echo   • Should see success message and list refresh
echo.
echo ?? Step 4: Edit Section
echo   • Click Edit button on existing section
echo   • Form should populate with current data
echo   • Should be able to change department if needed
echo   • Modify fields and submit
echo   • Should see success message and updated data
echo.
echo ?? Step 5: Delete Section
echo   • Click Delete button on section
echo   • Should show confirmation dialog
echo   • Confirm deletion
echo   • Section should be removed from list
echo.
echo ?? Step 6: Department-Section Relationship
echo   • Verify sections show their parent department
echo   • Test filtering sections by specific department
echo   • Ensure section count updates when sections are added/removed
echo   • Check that department deletion handles existing sections appropriately

echo.
echo ?? EXPECTED RESULTS:
echo ===================
echo.
echo ? BEFORE FIX:
echo   • Sections viewing failed with 403 errors
echo   • Adding/editing sections failed due to authorization
echo   • Custom roles couldn't manage sections
echo   • Hierarchical structure wasn't accessible
echo.
echo ? AFTER FIX:
echo   • All sections operations work with permission-based access
echo   • Custom roles can manage sections based on Departments permissions
echo   • Proper department-section hierarchical management
echo   • Complete CRUD functionality for sections
echo.
echo ? ORGANIZATIONAL BENEFITS:
echo   • Proper departmental structure management
echo   • Hierarchical organization of company structure
echo   • Granular control over organizational units
echo   • Scalable department-section relationship

echo.
echo ?? COMMON ORGANIZATIONAL SCENARIOS:
echo ==================================
echo.
echo ??? Example Department Structure:
echo   • ??????? ??????? (Financial Department)
echo     - ??? ???????? (Accounting Section)
echo     - ??? ??????? (Treasury Section)
echo   • ????? ??????? ??????? (HR Department)
echo     - ??? ??????? (Recruitment Section)  
echo     - ??? ??????? (Training Section)
echo   • ??????? ??????? (IT Department)
echo     - ??? ????????? (Software Section)
echo     - ??? ??????? (Networks Section)
echo.
echo ?? Management Capabilities:
echo   • Add departments first, then add sections under them
echo   • Move sections between departments if needed
echo   • Manage department and section hierarchies independently
echo   • Generate reports based on departmental structure

echo.
echo Test the complete departmental structure management now! ?????
pause