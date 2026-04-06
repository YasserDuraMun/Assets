@echo off
echo ===============================================
echo      ????? ???? ?????? Login
echo ===============================================
echo.

echo ?? ??? ???? ??????? ??????? ??? Login:
echo    1. Database connection
echo    2. Users table ? ????????
echo    3. Password hashing
echo    4. JWT configuration  
echo    5. API response
echo    6. CORS settings
echo.

echo ==========================================
echo 1?? ??? Database Connection
echo ==========================================
echo.

echo ?????? ???????...
sqlcmd -S 10.0.0.17 -d Assets -U sa -P Dur@123456 -Q "SELECT @@VERSION" -l 5

if %ERRORLEVEL% NEQ 0 (
    echo ? Database connection ????!
    echo ???? ??:
    echo    - SQL Server ?????
    echo    - ?????? 1433 ??????
    echo    - Firewall settings
    pause
    exit /b 1
)

echo ? Database connection ???!
echo.

echo ==========================================
echo 2?? ??? Users Table ?????????
echo ==========================================
echo.

echo ??? ???? Users...
sqlcmd -S 10.0.0.17 -d Assets -U sa -P Dur@123456 -Q "SELECT COUNT(*) as TotalUsers FROM Users" -h-1

echo.
echo ?????????? ?????????:
sqlcmd -S 10.0.0.17 -d Assets -U sa -P Dur@123456 -Q "SELECT TOP 10 Id, Username, FullName, Role, IsActive, CASE WHEN PasswordHash IS NOT NULL THEN 'Has Password' ELSE 'No Password' END as PasswordStatus FROM Users" -h-1

echo.
echo ??? ?????? admin:
sqlcmd -S 10.0.0.17 -d Assets -U sa -P Dur@123456 -Q "SELECT Id, Username, FullName, Role, IsActive, LEN(PasswordHash) as PasswordHashLength FROM Users WHERE Username = 'admin'" -h-1

echo.
echo ==========================================
echo 3?? ?????? Password Hashing
echo ==========================================
echo.

echo ??? ??? Password Hash ????????...
sqlcmd -S 10.0.0.17 -d Assets -U sa -P Dur@123456 -Q "SELECT TOP 1 Username, LEFT(PasswordHash, 10) + '...' as HashPrefix, LEN(PasswordHash) as HashLength FROM Users WHERE PasswordHash IS NOT NULL" -h-1

echo.
echo ?? BCrypt hash ??? ?? ???? ?? $2a ?? $2b
echo    ????? ????? 60 ???
echo.

echo ==========================================
echo 4?? ?????? API ?? ?????? ??????
echo ==========================================
echo.

echo ?????? Dashboard API (?? ????? authentication)...
curl -s -w "HTTP Status: %%{http_code}\n" http://10.0.0.17:8099/api/dashboard/summary

echo.
echo ?????? Login API ?? admin user...
echo.

:: Create JSON payload for login test
echo {"username":"admin","password":"admin123"} > login_test.json

echo Testing login with admin/admin123...
curl -X POST -H "Content-Type: application/json" -d @login_test.json -s -w "HTTP Status: %%{http_code}\n" http://10.0.0.17:8099/api/auth/login

echo.
echo Testing login with wrong credentials...
echo {"username":"admin","password":"wrongpass"} > login_wrong.json
curl -X POST -H "Content-Type: application/json" -d @login_wrong.json -s -w "HTTP Status: %%{http_code}\n" http://10.0.0.17:8099/api/auth/login

:: Cleanup
del login_test.json 2>nul
del login_wrong.json 2>nul

echo.
echo ==========================================
echo 5?? ??? Swagger API
echo ==========================================
echo.

echo ?????? Swagger endpoint...
curl -I http://10.0.0.17:8099/swagger/index.html 2>nul | findstr "200"

if %ERRORLEVEL% EQU 0 (
    echo ? Swagger ????: http://10.0.0.17:8099/swagger/
    echo.
    echo ?? ???????? ??????:
    echo    1. ????: http://10.0.0.17:8099/swagger/
    echo    2. ???? ?? /api/auth/login
    echo    3. ???? "Try it out"
    echo    4. ????: {"username":"admin","password":"admin123"}
    echo    5. ???? "Execute"
) else (
    echo ? Swagger ??? ????
)

echo.
echo ==========================================
echo 6?? ??? Application Logs
echo ==========================================
echo.

echo ??? ???? ??????? ?? Event Log...
powershell -Command "Get-EventLog -LogName Application -Source 'ASP.NET Core*' -Newest 5 -ErrorAction SilentlyContinue | Format-Table TimeGenerated, EntryType, Message -Wrap"

echo.
echo ??? IIS logs ?? ????...
if exist "C:\inetpub\wwwroot\AssetManagmentSystem\logs\" (
    echo "IIS Application Logs found:"
    dir "C:\inetpub\wwwroot\AssetManagmentSystem\logs\" /O:D
) else (
    echo "No IIS logs directory found"
)

echo.
echo ==========================================
echo 7?? ???? ??????
echo ==========================================
echo.

echo ?? ????? ??? ??????? ?????? ???:
echo.

echo ??? ??? Users table ???? ?? ?? ???? admin:
echo    ????: create-test-admin-user.bat
echo.

echo ??? ???? password hashes ???:
echo    ????: fix-password-hashing.bat
echo.

echo ??? ??? API ?? ??????:
echo    ????: restart-iis-application.bat
echo.

echo ??? ??? CORS ?????:
echo    ????: fix-cors-settings.bat
echo.

echo ??? ??? JWT configuration ???:
echo    ????: fix-jwt-settings.bat
echo.

echo ????? ?????? ??? ????:
echo    ????: diagnose-login-issue.bat
echo.

pause