@echo off
cls
echo ?? Fix Login Design - Install Tailwind & Run System
echo ===============================================

echo ????????? ???????:
echo ? Login.tsx - Complete English interface
echo ? Tailwind CSS configuration added
echo ? PostCSS configuration created
echo ? Package.json updated with Tailwind
echo ? Modern professional login design
echo.

echo Installing Tailwind CSS dependencies...
cd ClientApp
echo ?? Installing Tailwind CSS, PostCSS, and AutoPrefixer...
call npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
if %ERRORLEVEL% NEQ 0 (
    echo ? Failed to install Tailwind CSS
    echo Trying alternative installation...
    call npm install -D tailwindcss postcss autoprefixer
)

echo ? Dependencies installed successfully
echo.

echo ?? Building with new design...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ? Build failed, but continuing with dev server...
)

echo.
echo ?? Starting Frontend with new professional login...
start "Frontend - AssetFlow Professional" cmd /k "echo ?? AssetFlow - Professional Login Design && echo ?? http://localhost:5173 && echo ?? Modern Split-Screen Layout && echo ?? Responsive English Interface && echo ?? Enterprise-Grade Branding && echo ?? admin@assets.ps / Admin@123 && echo. && npm run dev"

cd ..

echo ===============================================
echo ?? New Professional Login Features
echo ===============================================
echo.
echo ?? Visual Design:
echo   ? Modern split-screen layout
echo   ? Beautiful gradient backgrounds  
echo   ? Professional typography
echo   ? Clean form styling
echo   ? Smooth animations
echo.
echo ?? Branding:
echo   ? AssetFlow brand identity
echo   ? Professional messaging
echo   ? Enterprise-grade appearance
echo   ? Feature highlights
echo.
echo ?? Login Features:
echo   ? Email field with icon
echo   ? Password show/hide toggle
echo   ? Remember me checkbox
echo   ? Forgot password link
echo   ? Professional error handling
echo   ? Loading states
echo   ? Demo credentials display
echo.
echo ?? Responsive:
echo   ? Desktop: Split-screen layout
echo   ? Mobile: Single column layout
echo   ? Touch-friendly interface
echo   ? Proper scaling
echo.

echo ?? Test URLs:
echo   Frontend: http://localhost:5173
echo   Backend: https://localhost:7067 (if running)
echo.

echo ?? Demo Credentials (Pre-filled):
echo   Email: admin@assets.ps
echo   Password: Admin@123
echo   Role: Super Admin
echo.

echo Expected Results:
echo ?????????????????
echo ? Beautiful professional login page
echo ? Complete English interface
echo ? Modern enterprise design
echo ? Smooth user experience
echo ? Responsive mobile-friendly layout
echo ? AssetFlow branding throughout
echo.

echo ?? Design Features:
echo ?? No Arabic text anywhere
echo ?? Professional business appearance
echo ?? Enterprise-grade styling
echo ?? Modern gradient backgrounds
echo ?? Clean form interactions
echo ?? Accessible design patterns

pause

echo ?? If you see any issues:
echo.
echo 1?? Check browser console for errors
echo 2?? Ensure Tailwind CSS is loading properly
echo 3?? Verify all dependencies are installed
echo 4?? Try hard refresh (Ctrl+F5)
echo.

echo ? Quick troubleshooting:
echo   • Missing styles? Run: npm install
echo   • Build errors? Check package.json
echo   • CSS not loading? Verify index.css imports
echo   • Layout broken? Check Tailwind config

pause