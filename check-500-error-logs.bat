@echo off
echo ===============================================
echo      ??? ??? Logs ?????? 500 Error
echo ===============================================
echo.

echo ?? ??? Application Event Log...
echo.
powershell -Command "Get-EventLog -LogName Application -Source 'ASP.NET Core*' -Newest 10 | Format-Table TimeGenerated, EntryType, Message -Wrap"

echo.
echo ?? ??? System Event Log...
echo.
powershell -Command "Get-EventLog -LogName System -EntryType Error -Newest 5 | Format-Table TimeGenerated, Source, Message -Wrap"

echo.
echo ?? ??? IIS Logs...
echo.
if exist "C:\inetpub\wwwroot\AssetManagmentSystem\logs\" (
    echo "IIS Application Logs:"
    dir "C:\inetpub\wwwroot\AssetManagmentSystem\logs\" /O:D
    echo.
    echo "Latest log file:"
    for /f "delims=" %%i in ('dir "C:\inetpub\wwwroot\AssetManagmentSystem\logs\stdout*.log" /B /O:D') do set "latest=%%i"
    if defined latest (
        echo Content of latest log:
        type "C:\inetpub\wwwroot\AssetManagmentSystem\logs\!latest!"
    )
) else (
    echo ? Logs directory not found
)

echo.
echo ?? ?????? ?? ????????:
echo    1. Event Viewer ? Windows Logs ? Application
echo    2. Event Viewer ? Windows Logs ? System  
echo    3. IIS Manager ? Logging
echo.
pause