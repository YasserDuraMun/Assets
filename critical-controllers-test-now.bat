@echo off
cls
echo ?? CRITICAL CONTROLLERS FIXED - IMMEDIATE TEST
echo ==============================================

echo ? CONTROLLERS FIXED:
echo   • DashboardController - ? Complete
echo   • AssetsController - ? Complete (GET, POST, PUT, DELETE)
echo   • CategoriesController - ? Complete (GET, POST, PUT, DELETE)

echo ?? EXPECTED RESULTS:
echo   • Dashboard: Should continue working ?
echo   • Assets: Should now load data ?
echo   • Categories: Should now load data ?
echo   • Other screens: Still empty (need more fixes) ??

cd "C:\Users\haya\source\repos\Assets - Copy\Assets"

echo ??? Starting Backend with Critical Fixes...
start "Backend - Critical Fix" cmd /k "echo ??? BACKEND - Critical Controllers Fixed && echo =============================== && echo. && echo ? FIXED CONTROLLERS: && echo   • Dashboard: RequirePermission active && echo   • Assets: RequirePermission active && echo   • Categories: RequirePermission active && echo. && echo ?? User should now see: && echo   • Dashboard with full data && echo   • Assets with full data && echo   • Categories with full data && echo. && echo ?? Still broken: Other controllers && echo   • Need similar fixes for remaining screens && echo. && dotnet run"

echo ? Waiting for backend startup...
timeout /t 8

echo ?? Starting Frontend Critical Test...
cd ClientApp

start "Frontend - Critical Test" cmd /k "echo ?? FRONTEND - Critical Controllers Test && echo =================================== && echo. && echo ?? IMMEDIATE TEST SEQUENCE: && echo. && echo ?? Step 1: Login with Custom Role User && echo   • Use the user with custom role && echo   • Should login successfully && echo. && echo ?? Step 2: Test Critical Screens && echo   • Dashboard ? Should work (data loads) ? && echo   • Assets ? Should NOW work (data loads) ? && echo   • Categories ? Should NOW work (data loads) ? && echo. && echo ?? Step 3: Check Network Tab && echo   • Dashboard APIs: 200 OK ? && echo   • Assets APIs: Should be 200 OK now ? && echo   • Categories APIs: Should be 200 OK now ? && echo   • Other APIs: Still 403 until fixed ?? && echo. && echo ?? Step 4: Report Results && echo   • If Assets & Categories now work ? Success! && echo   • Can continue fixing other controllers && echo   • If still broken ? Need deeper investigation && echo. && npm run dev"

echo.
echo ?? CRITICAL TEST READY!
echo ======================
echo.

echo ?? SUCCESS CRITERIA:
echo.
echo ? EXPECTED SUCCESS:
echo   ? Login works with custom role
echo   ? Dashboard shows full data  
echo   ? Assets screen shows list of assets
echo   ? Categories screen shows list of categories
echo   ? No 403 errors on these 3 screens
echo.
echo ? STILL EXPECTED TO FAIL:
echo   ? Transfers screen (not fixed yet)
echo   ? Warehouses screen (not fixed yet)  
echo   ? Employees screen (not fixed yet)
echo   ? Reports screen (not fixed yet)
echo   ? Other screens (not fixed yet)

pause

echo ?? WHAT TO LOOK FOR:
echo ===================
echo.
echo ?? If Critical Controllers Now Work:
echo   • Assets screen loads with asset list
echo   • Categories screen loads with category list  
echo   • Network tab shows 200 OK for these APIs
echo   • Progress confirmed ? Continue with other controllers
echo.
echo ?? If Still Not Working:
echo   • Check backend console for permission errors
echo   • Check if RequirePermissionAttribute is working
echo   • Verify user has correct permissions in database
echo   • May need to debug HasPermissionAsync method

echo.
echo Test these 3 critical screens now! ??
pause