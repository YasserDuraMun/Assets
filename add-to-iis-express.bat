@echo off
echo Adding Assets Management site to IIS Express...

set SITE_PATH=%~dp0publish
set SITE_PORT=8080

echo Site Path: %SITE_PATH%
echo Port: %SITE_PORT%

:: Add site to IIS Express configuration
"%ProgramFiles%\IIS Express\appcmd" add site /name:"Assets Management" /physicalPath:"%SITE_PATH%" /bindings:"http/*:%SITE_PORT%:"

:: Configure application pool
"%ProgramFiles%\IIS Express\appcmd" set site "Assets Management" /applicationDefaults.applicationPool:"Clr4IntegratedAppPool"

echo.
echo ? Site added successfully!
echo.
echo ?? Your site will be available at: http://localhost:%SITE_PORT%
echo.
echo To start IIS Express:
echo "%ProgramFiles%\IIS Express\iisexpress" /site:"Assets Management"
echo.
pause