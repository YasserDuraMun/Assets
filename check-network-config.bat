@echo off
echo ===============================================
echo    ??? ??????? IIS Express ???????
echo ===============================================
echo.

echo ==========================================
echo 1?? ??? URL Reservations
echo ==========================================
echo.

echo ??? URL reservations ?????? 8098...
netsh http show urlacl | findstr "8098"

echo ??? URL reservations ?????? 8099...
netsh http show urlacl | findstr "8099"

echo.
echo ==========================================
echo 2?? ??? Windows Firewall Rules
echo ==========================================
echo.

echo ??? ????? Firewall ?????? 8098...
netsh advfirewall firewall show rule name="IIS Express Port 8098"

echo.
echo ??? ????? Firewall ?????? 8099...
netsh advfirewall firewall show rule name="IIS Express Port 8099"

echo.
echo ==========================================
echo 3?? ??? Network Connectivity
echo ==========================================
echo.

echo ??? Ping ??? IP...
ping 10.0.0.17 -n 2

echo.
echo ??? ???????? ??????...
netstat -an | findstr ":8098 "
netstat -an | findstr ":8099 "

echo.
echo ==========================================
echo 4?? ??? SQL Server Connection
echo ==========================================
echo.

echo ??? ????? ????? ????????...
sqlcmd -S 10.0.0.17 -d Assets -U sa -P Dur@123456 -Q "SELECT @@VERSION" -l 5

if %ERRORLEVEL% EQU 0 (
    echo ? SQL Server connection ????
) else (
    echo ? SQL Server connection ????
)

echo.
echo ==========================================
echo 5?? ??? IIS Express Configuration
echo ==========================================
echo.

set "configPath=%USERPROFILE%\Documents\IISExpress\config\applicationhost.config"
if not exist "%configPath%" (
    set "configPath=%USERPROFILE%\My Documents\IISExpress\config\applicationhost.config"
)

if exist "%configPath%" (
    echo ? ??? IIS Express config ?????
    echo ??????: %configPath%
    
    echo.
    echo ??? Sites ????????...
    findstr /C:"Assets-Frontend" "%configPath%" >nul
    if %ERRORLEVEL% EQU 0 (
        echo ? Assets-Frontend site ?????
    ) else (
        echo ? Assets-Frontend site ??? ?????
    )
    
    findstr /C:"Assets-Backend" "%configPath%" >nul
    if %ERRORLEVEL% EQU 0 (
        echo ? Assets-Backend site ?????  
    ) else (
        echo ? Assets-Backend site ??? ?????
    )
    
    echo.
    echo ??? Bindings...
    findstr /C:":8098:" "%configPath%" >nul
    if %ERRORLEVEL% EQU 0 (
        echo ? ?????? 8098 ????? ?? bindings
    ) else (
        echo ? ?????? 8098 ??? ?????
    )
    
    findstr /C:":8099:" "%configPath%" >nul
    if %ERRORLEVEL% EQU 0 (
        echo ? ?????? 8099 ????? ?? bindings
    ) else (
        echo ? ?????? 8099 ??? ?????
    )
    
) else (
    echo ? ??? IIS Express config ??? ?????
)

echo.
echo ==========================================
echo 6?? ??? Physical Paths
echo ==========================================
echo.

if exist "C:\inetpub\wwwroot\AssetWeb" (
    echo ? Frontend path ?????: C:\inetpub\wwwroot\AssetWeb
    dir "C:\inetpub\wwwroot\AssetWeb\index.html" >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo ? Frontend files ??????
    ) else (
        echo ? Frontend files ??????
    )
) else (
    echo ? Frontend path ?????: C:\inetpub\wwwroot\AssetWeb
)

if exist "C:\inetpub\wwwroot\AssetManagmentSystem" (
    echo ? Backend path ?????: C:\inetpub\wwwroot\AssetManagmentSystem
    dir "C:\inetpub\wwwroot\AssetManagmentSystem\Assets.dll" >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo ? Backend files ??????
    ) else (
        echo ? Backend files ??????
    )
) else (
    echo ? Backend path ?????: C:\inetpub\wwwroot\AssetManagmentSystem
)

echo.
echo ==========================================
echo 7?? ?????? ?????????
echo ==========================================
echo.

echo ?? ???? ?????????:
echo.

:: Summary logic would go here based on the checks above
echo ?? ??? ????? ?????:
echo.
echo 1?? ?????? ??????:
echo    ????: setup-iis-express-network.bat (?? Administrator)
echo.
echo 2?? ?????? IIS Express config:
echo    ????: update-iis-express-config.bat
echo.
echo 3?? ?????:
echo    ????: deploy-complete-separate.bat
echo.
echo 4?? ???? Authentication:
echo    ????: fix-auth-no-rebuild-db.bat
echo.

echo ?? URLs ????????:
echo    Frontend: http://10.0.0.17:8098/
echo    Backend:  http://10.0.0.17:8099/
echo    Swagger:  http://10.0.0.17:8099/swagger/
echo.

pause