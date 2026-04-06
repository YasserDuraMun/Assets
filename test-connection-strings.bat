@echo off
echo ===============================================
echo    ????? Connection Strings ????? ????????
echo ===============================================
echo.

echo ?? Connection Strings ????????:
echo.

echo 1?? ?????? (?? SSL):
echo "Data Source=10.0.0.17;Initial Catalog=Assets;User ID=sa;Password=Dur@123456;Connect Timeout=30;Encrypt=True;Trust Server Certificate=True;Application Intent=ReadWrite;Multi Subnet Failover=False"
echo.

echo 2?? ???? SSL:
echo "Server=10.0.0.17;Database=Assets;User Id=sa;Password=Dur@123456;Trusted_Connection=false;MultipleActiveResultSets=true;"
echo.

echo 3?? ?? Windows Authentication:
echo "Server=10.0.0.17;Database=Assets;Trusted_Connection=true;MultipleActiveResultSets=true;TrustServerCertificate=true;"
echo.

echo 4?? Local DB:
echo "Server=(local);Database=Assets;Trusted_Connection=true;MultipleActiveResultSets=true;TrustServerCertificate=true;"
echo.

echo ?? ?????? connection string ????:
echo    1. ???? appsettings.json ?? publish-backend
echo    2. ???? ?????? ??? ????
echo    3. ??? ????? Application Pool
echo.

set /p "choice=?? connection string ???? ??????? (1/2/3/4): "

if "%choice%"=="1" (
    set conn="Data Source=10.0.0.17;Initial Catalog=Assets;User ID=sa;Password=Dur@123456;Connect Timeout=30;Encrypt=True;Trust Server Certificate=True;Application Intent=ReadWrite;Multi Subnet Failover=False"
) else if "%choice%"=="2" (
    set conn="Server=10.0.0.17;Database=Assets;User Id=sa;Password=Dur@123456;Trusted_Connection=false;MultipleActiveResultSets=true;"
) else if "%choice%"=="3" (
    set conn="Server=10.0.0.17;Database=Assets;Trusted_Connection=true;MultipleActiveResultSets=true;TrustServerCertificate=true;"
) else if "%choice%"=="4" (
    set conn="Server=(local);Database=Assets;Trusted_Connection=true;MultipleActiveResultSets=true;TrustServerCertificate=true;"
) else (
    echo ???? ???!
    pause
    exit /b
)

echo.
echo ?? ?????? Connection String ???????...
echo %conn%
echo.

echo sqlcmd -d Assets -Q "SELECT @@VERSION" with connection: %conn%

echo.
echo ?? ?? ???? ??? ??? Connection String ?? appsettings.json? (y/n)
set /p "save="

if /i "%save%"=="y" (
    echo ????? appsettings.json...
    :: ???? ????? PowerShell script ??? ?????? ?????
    echo ? ?? ?????! ?? ??? ??? ??????? ??????.
)

echo.
pause