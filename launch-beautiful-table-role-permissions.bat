@echo off
cls
echo ??? BEAUTIFUL TABLE-BASED ROLE PERMISSIONS - READY!
echo ====================================================

echo ?? New Beautiful Table Design Applied:
echo ? Interactive table layout instead of cards
echo ? Purple-pink gradient header with statistics  
echo ? 5-column organized table structure:
echo    ?? Screen/Module name with icons
echo    ??? VIEW toggle (Blue theme)
echo    ? INSERT toggle (Green theme)
echo    ?? UPDATE toggle (Orange theme) 
echo    ??? DELETE toggle (Red theme)
echo ? Color-coded toggle switches for each permission type
echo ? Smooth hover effects on table rows
echo ? Quick action buttons for bulk operations:
echo    ? Enable All Permissions
echo    ? Disable All Permissions
echo    ??? View Only Mode
echo ? Mobile responsive with horizontal scroll
echo ? Beautiful info guidelines
echo ? Professional loading and empty states
echo.

echo ?? Starting Beautiful Table-Based Role Permissions...

cd ClientApp

echo ?? Clearing processes...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM npm.exe 2>nul

timeout /t 2 >nul

echo ?? Launching Beautiful Table System...
start "Beautiful Table Role Permissions" cmd /k "echo ??? BEAUTIFUL TABLE ROLE PERMISSIONS SYSTEM && echo ============================================= && echo. && echo ?? Frontend URL: http://localhost:5173 && echo ??? Role Permissions: http://localhost:5173/role-permissions && echo ?? Login: admin@assets.ps / Admin@123 && echo. && echo ?? Beautiful Table Features: && echo   ?? Interactive permissions table && echo   ?? Elegant role selector && echo   ?? Color-coded toggle switches && echo   ? Quick action buttons && echo   ?? Smooth hover animations && echo   ?? Mobile responsive design && echo   ?? Professional user interface && echo. && npm run dev"

echo.
echo ?? TABLE-BASED ROLE PERMISSIONS IS NOW READY!
echo ==============================================
echo.
echo ?? How to Access the Beautiful Table:
echo   1. ?? Go to: http://localhost:5173
echo   2. ?? Login: admin@assets.ps / Admin@123
echo   3. ??? Navigate to: Role Permissions Management
echo   4. ?? Select a role from the dropdown
echo   5. ?? Enjoy the beautiful interactive table!
echo.

pause

echo ?? TABLE DESIGN HIGHLIGHTS:
echo ===========================
echo.
echo ?? Table Structure:
echo   • Column 1: Screen/Module (with icons + descriptions)
echo   • Column 2: VIEW permission (Blue toggle)
echo   • Column 3: INSERT permission (Green toggle)
echo   • Column 4: UPDATE permission (Orange toggle)
echo   • Column 5: DELETE permission (Red toggle)
echo.

echo ?? Visual Features:
echo   • Purple-pink gradient header (#7c3aed ? #ec4899)
echo   • Alternating row colors (white/light gray)
echo   • Color-coded column headers with icons
echo   • Interactive toggle switches with smooth animations
echo   • Hover effects that light up entire rows
echo   • Professional shadows and gradients
echo   • Beautiful spacing and typography
echo.

echo ? Quick Actions:
echo   • ? Enable All: Turn on all permissions for the role
echo   • ? Disable All: Turn off all permissions for the role
echo   • ??? View Only: Enable only view permissions
echo   • ?? Save Permissions: Save changes to database
echo.

echo ?? User Experience:
echo   • Easy to scan all permissions at a glance
echo   • Quick bulk operations with one click
echo   • Clear visual feedback for all actions
echo   • Responsive design works on all devices
echo   • Intuitive table layout familiar to users
echo   • Color coding makes permission types clear

pause

echo ?? USAGE TIPS:
echo =============
echo ?? Select Role: Choose from the beautiful dropdown
echo ?? Review Table: See all screens and their permissions
echo ?? Toggle Switches: Click to enable/disable permissions
echo ? Quick Actions: Use buttons for bulk operations
echo ?? Save Changes: Don't forget to save when done!
echo.

echo This table design is much easier for managing permissions! ???
echo You can now quickly see and modify all permissions in one view.

pause