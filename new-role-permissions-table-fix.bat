@echo off
cls
echo ?? FIX: EMPTY PERMISSIONS TABLE FOR NEW ROLES
echo ============================================

echo ?? PROBLEM IDENTIFIED:
echo   ? Creating new role ? Selecting role ? Empty permissions table
echo   ? Should show all 13 screens with empty permissions for configuration
echo   ? createDefaultPermissions() was giving permissions to system roles only

echo ?? ROOT CAUSE:
echo   • createDefaultPermissions was checking for 'SuperAdmin'/'Admin' only
echo   • New custom roles got no permissions ? empty table
echo   • User couldn't configure permissions for new roles

echo ?? SOLUTION APPLIED:
echo   • Fixed createDefaultPermissions to show all screens
echo   • Custom roles get empty permissions (false) for user configuration
echo   • System roles (SuperAdmin/Admin) still get default permissions
echo   • Enhanced logging to track permission creation process
echo   • Direct permission template creation for new roles

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting Fixed Backend...
start "Backend - Fixed Permissions" cmd /k "echo ??? BACKEND - New Role Permissions Fix && echo ================================ && echo. && echo ?? FIXED ISSUES: && echo   • createDefaultPermissions now shows all screens && echo   • New roles get configurable permission template && echo   • Enhanced logging for permission creation && echo. && echo ?? Expected Backend Logs: && echo   • 'Creating default permissions for new role: [Name]' && echo   • 'Default permissions created: [13 screens]' && echo   • 'Role permissions state set for: [Name]' && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 10

echo ?? Starting Fixed Frontend...
cd ClientApp

start "Frontend - Permissions Fix" cmd /k "echo ?? FRONTEND - New Role Permissions Fix && echo ================================== && echo. && echo ?? TESTING SEQUENCE: && echo. && echo ?? Phase 1: Create New Role && echo   1. Login as Super Admin && echo   2. Go to '????? ??????? ??????????' && echo   3. Click '????? ??? ????' (green button) && echo   4. Enter role name: '???? ???????' && echo   5. Click '????? ?????' && echo. && echo ?? Phase 2: Verify Permissions Table && echo   6. Role should be auto-selected && echo   7. Permissions table should appear immediately && echo   8. Should show ALL 13 screens: && echo      • Dashboard, Assets, Categories, Departments && echo      • Employees, Warehouses, Transfers, Disposal && echo      • Maintenance, Reports, Users, Permissions, Settings && echo   9. All toggles should be OFF (false) initially && echo   10. Ready for configuration! && echo. && echo ?? Phase 3: Configure Permissions && echo   11. Toggle some permissions ON (e.g., Dashboard View) && echo   12. Use bulk actions if needed && echo   13. Click '??? ?????????' && echo   14. Should save successfully && echo. && npm run dev"

echo.
echo ?? NEW ROLE PERMISSIONS TABLE FIX READY!
echo =======================================
echo.

echo ?? SUCCESS INDICATORS:
echo.
echo ? Creating New Role:
echo   ? Modal opens and closes properly
echo   ? Role appears in dropdown
echo   ? Role auto-selected after creation
echo.
echo ? Permissions Table Display:
echo   ? Table appears immediately (not empty)
echo   ? Shows all 13 system screens
echo   ? All permission toggles start as OFF (false)
echo   ? Visual permission matrix displays correctly
echo.
echo ? Permission Configuration:
echo   ? Can toggle individual permissions ON/OFF
echo   ? Bulk actions work (Enable All / Disable All)
echo   ? Save permissions button appears
echo   ? Permissions save successfully
echo.
echo ? Console Logs (Check browser/backend):
echo   ? "Creating default permissions for new role: [Name]"
echo   ? "Default permissions created: [Array of 13 permissions]"
echo   ? "Role permissions state set for: [Name]"

pause

echo ?? EXPECTED WORKFLOW:
echo ====================
echo.
echo ?? Creating '???? ???????' Role:
echo   1. ????? ??? ???? ? Enter name ? Create ?
echo   2. Auto-selection ? Role selected in dropdown ?
echo   3. Permissions table loads ? Shows 13 screens ?
echo   4. All toggles OFF ? Ready for configuration ?
echo   5. Configure: Dashboard (View), Reports (View) ?
echo   6. Save permissions ? Success message ?
echo   7. Role ready for user assignment ?
echo.
echo ?? Key Difference:
echo   BEFORE: Empty table ? No configuration possible ?
echo   AFTER: Full table with OFF toggles ? Full configuration ?

echo.
echo Test it now - new roles should show full permissions table! ??
pause