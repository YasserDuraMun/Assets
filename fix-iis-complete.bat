@echo off
title IIS Configuration Fixer
echo ===============================================
echo              ????? ??????? IIS
echo ===============================================
echo.

echo ?? ?????? 1/5: ??? IIS Express...
where iisexpress >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ? IIS Express ??? ????!
    echo ?? ???? ????? IIS Express ?? Visual Studio
    pause
    exit /b 1
) else (
    echo ? IIS Express ?????
)

echo.
echo ?? ?????? 2/5: ????? web.config...

echo ^<?xml version="1.0" encoding="utf-8"?^> > web.config
echo ^<configuration^> >> web.config
echo   ^<location path="." inheritInChildApplications="false"^> >> web.config
echo     ^<system.webServer^> >> web.config
echo       ^<handlers^> >> web.config
echo         ^<add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModuleV2" resourceType="Unspecified" /^> >> web.config
echo       ^</handlers^> >> web.config
echo       ^<aspNetCore processPath="dotnet" arguments=".\Assets.dll" stdoutLogEnabled="true" stdoutLogFile=".\logs\stdout" hostingModel="inprocess" /^> >> web.config
echo     ^</system.webServer^> >> web.config
echo   ^</location^> >> web.config
echo ^</configuration^> >> web.config

echo ? ?? ????? web.config

echo.
echo ?? ?????? 3/5: ????? ???? logs...
if not exist "logs" mkdir logs
echo ? ?? ????? ???? logs

echo.
echo ?? ?????? 4/5: ????? launchSettings.json...

echo { > Properties\launchSettings.json
echo   "$schema": "https://json.schemastore.org/launchsettings.json", >> Properties\launchSettings.json
echo   "profiles": { >> Properties\launchSettings.json
echo     "http": { >> Properties\launchSettings.json
echo       "commandName": "Project", >> Properties\launchSettings.json
echo       "dotnetRunMessages": true, >> Properties\launchSettings.json
echo       "launchBrowser": false, >> Properties\launchSettings.json
echo       "applicationUrl": "http://10.0.0.17:8099", >> Properties\launchSettings.json
echo       "environmentVariables": { >> Properties\launchSettings.json
echo         "ASPNETCORE_ENVIRONMENT": "Development" >> Properties\launchSettings.json
echo       } >> Properties\launchSettings.json
echo     }, >> Properties\launchSettings.json
echo     "https": { >> Properties\launchSettings.json
echo       "commandName": "Project", >> Properties\launchSettings.json
echo       "dotnetRunMessages": true, >> Properties\launchSettings.json
echo       "launchBrowser": false, >> Properties\launchSettings.json
echo       "applicationUrl": "https://10.0.0.17:7051;http://10.0.0.17:8099", >> Properties\launchSettings.json
echo       "environmentVariables": { >> Properties\launchSettings.json
echo         "ASPNETCORE_ENVIRONMENT": "Development" >> Properties\launchSettings.json
echo       } >> Properties\launchSettings.json
echo     }, >> Properties\launchSettings.json
echo     "IIS Express": { >> Properties\launchSettings.json
echo       "commandName": "IISExpress", >> Properties\launchSettings.json
echo       "launchBrowser": true, >> Properties\launchSettings.json
echo       "environmentVariables": { >> Properties\launchSettings.json
echo         "ASPNETCORE_ENVIRONMENT": "Development" >> Properties\launchSettings.json
echo       } >> Properties\launchSettings.json
echo     } >> Properties\launchSettings.json
echo   } >> Properties\launchSettings.json
echo } >> Properties\launchSettings.json

echo ? ?? ????? launchSettings.json

echo.
echo ?? ?????? 5/5: ?????? ???????...
echo.
echo [1] ?????? HTTP ????
echo [2] ?????? HTTPS + IIS Express
echo [3] ???? ????????
echo.

choice /c 123 /n /m "???? ????? (1-3): "

if errorlevel 3 goto :end
if errorlevel 2 goto :test_https
if errorlevel 1 goto :test_http

:test_http
echo.
echo ?? ?????? ??????? HTTP...
start "" cmd /k "echo ?????? HTTP... && timeout 3 && set ASPNETCORE_ENVIRONMENT=Development && dotnet run --no-build --urls http://10.0.0.17:8099"
timeout 5 >nul
echo ? ?? ??? ???????? - ???? ?? http://10.0.0.17:8099
goto :end

:test_https
echo.
echo ?? ?????? ??????? HTTPS + IIS Express...
start "" cmd /k "echo ?????? HTTPS... && timeout 3 && set ASPNETCORE_ENVIRONMENT=Development && dotnet run --no-build --launch-profile https"
timeout 5 >nul
echo ? ?? ??? ???????? - ???? ?? https://10.0.0.17:7051
goto :end

:end
echo.
echo ===============================================
echo           ? ?? ????? ??????? IIS!
echo ===============================================
echo.
echo ?? ????????? ????????:
echo   ? web.config ????
echo   ? launchSettings.json ????  
echo   ? ???? logs ?? ??????
echo   ? ??????? ?????? ?????
echo.

pause