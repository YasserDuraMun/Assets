@echo off
echo ===============================================
echo  ????? IIS Express applicationhost.config
echo  ????? bindings ??? network IP
echo ===============================================
echo.

:: Find IIS Express config path
set "configPath=%USERPROFILE%\Documents\IISExpress\config\applicationhost.config"
if not exist "%configPath%" (
    set "configPath=%USERPROFILE%\My Documents\IISExpress\config\applicationhost.config"
)

if not exist "%configPath%" (
    echo ? ?? ??? ?????? ??? ??? applicationhost.config
    echo ???????? ????????:
    echo   %USERPROFILE%\Documents\IISExpress\config\applicationhost.config
    echo   %USERPROFILE%\My Documents\IISExpress\config\applicationhost.config
    echo.
    echo ?? ???? ??:
    echo    1. ????? IIS Express
    echo    2. ????? Visual Studio ??? ????? ??? ?????
    echo    3. ????? ????? web application
    pause
    exit /b 1
)

echo ? ??? ??????? ?????: %configPath%
echo.

echo ????? backup...
copy "%configPath%" "%configPath%.backup-%date:~-4%-%date:~3,2%-%date:~0,2%-%time:~0,2%-%time:~3,2%-%time:~6,2%" >nul

echo.
echo ?? ????? Site bindings ??????...
echo.

:: Create PowerShell script to modify XML
echo $configPath = '%configPath%' > temp_update_config.ps1
echo $xml = [xml](Get-Content $configPath) >> temp_update_config.ps1
echo. >> temp_update_config.ps1
echo # Find sites section >> temp_update_config.ps1
echo $sites = $xml.configuration."system.applicationHost".sites >> temp_update_config.ps1
echo. >> temp_update_config.ps1
echo # Add Assets Frontend Site (Port 8098) >> temp_update_config.ps1
echo $frontendSite = $xml.CreateElement("site") >> temp_update_config.ps1
echo $frontendSite.SetAttribute("name", "Assets-Frontend") >> temp_update_config.ps1
echo $frontendSite.SetAttribute("id", "10") >> temp_update_config.ps1
echo. >> temp_update_config.ps1
echo $frontendApp = $xml.CreateElement("application") >> temp_update_config.ps1
echo $frontendApp.SetAttribute("path", "/") >> temp_update_config.ps1
echo $frontendApp.SetAttribute("applicationPool", "Clr4IntegratedAppPool") >> temp_update_config.ps1
echo. >> temp_update_config.ps1
echo $frontendVirtualDir = $xml.CreateElement("virtualDirectory") >> temp_update_config.ps1
echo $frontendVirtualDir.SetAttribute("path", "/") >> temp_update_config.ps1
echo $frontendVirtualDir.SetAttribute("physicalPath", "C:\inetpub\wwwroot\AssetWeb") >> temp_update_config.ps1
echo $frontendApp.AppendChild($frontendVirtualDir) >> temp_update_config.ps1
echo $frontendSite.AppendChild($frontendApp) >> temp_update_config.ps1
echo. >> temp_update_config.ps1
echo # Add bindings for Frontend >> temp_update_config.ps1
echo $frontendBindings = $xml.CreateElement("bindings") >> temp_update_config.ps1
echo $binding1 = $xml.CreateElement("binding") >> temp_update_config.ps1
echo $binding1.SetAttribute("protocol", "http") >> temp_update_config.ps1
echo $binding1.SetAttribute("bindingInformation", "*:8098:") >> temp_update_config.ps1
echo $frontendBindings.AppendChild($binding1) >> temp_update_config.ps1
echo $binding2 = $xml.CreateElement("binding") >> temp_update_config.ps1
echo $binding2.SetAttribute("protocol", "http") >> temp_update_config.ps1
echo $binding2.SetAttribute("bindingInformation", "*:8098:10.0.0.17") >> temp_update_config.ps1
echo $frontendBindings.AppendChild($binding2) >> temp_update_config.ps1
echo $binding3 = $xml.CreateElement("binding") >> temp_update_config.ps1
echo $binding3.SetAttribute("protocol", "http") >> temp_update_config.ps1
echo $binding3.SetAttribute("bindingInformation", "*:8098:localhost") >> temp_update_config.ps1
echo $frontendBindings.AppendChild($binding3) >> temp_update_config.ps1
echo $frontendSite.AppendChild($frontendBindings) >> temp_update_config.ps1
echo. >> temp_update_config.ps1
echo # Add Assets Backend Site (Port 8099) >> temp_update_config.ps1
echo $backendSite = $xml.CreateElement("site") >> temp_update_config.ps1
echo $backendSite.SetAttribute("name", "Assets-Backend") >> temp_update_config.ps1
echo $backendSite.SetAttribute("id", "11") >> temp_update_config.ps1
echo. >> temp_update_config.ps1
echo $backendApp = $xml.CreateElement("application") >> temp_update_config.ps1
echo $backendApp.SetAttribute("path", "/") >> temp_update_config.ps1
echo $backendApp.SetAttribute("applicationPool", "Clr4IntegratedAppPool") >> temp_update_config.ps1
echo. >> temp_update_config.ps1
echo $backendVirtualDir = $xml.CreateElement("virtualDirectory") >> temp_update_config.ps1
echo $backendVirtualDir.SetAttribute("path", "/") >> temp_update_config.ps1
echo $backendVirtualDir.SetAttribute("physicalPath", "C:\inetpub\wwwroot\AssetManagmentSystem") >> temp_update_config.ps1
echo $backendApp.AppendChild($backendVirtualDir) >> temp_update_config.ps1
echo $backendSite.AppendChild($backendApp) >> temp_update_config.ps1
echo. >> temp_update_config.ps1
echo # Add bindings for Backend >> temp_update_config.ps1
echo $backendBindings = $xml.CreateElement("bindings") >> temp_update_config.ps1
echo $binding4 = $xml.CreateElement("binding") >> temp_update_config.ps1
echo $binding4.SetAttribute("protocol", "http") >> temp_update_config.ps1
echo $binding4.SetAttribute("bindingInformation", "*:8099:") >> temp_update_config.ps1
echo $backendBindings.AppendChild($binding4) >> temp_update_config.ps1
echo $binding5 = $xml.CreateElement("binding") >> temp_update_config.ps1
echo $binding5.SetAttribute("protocol", "http") >> temp_update_config.ps1
echo $binding5.SetAttribute("bindingInformation", "*:8099:10.0.0.17") >> temp_update_config.ps1
echo $backendBindings.AppendChild($binding5) >> temp_update_config.ps1
echo $binding6 = $xml.CreateElement("binding") >> temp_update_config.ps1
echo $binding6.SetAttribute("protocol", "http") >> temp_update_config.ps1
echo $binding6.SetAttribute("bindingInformation", "*:8099:localhost") >> temp_update_config.ps1
echo $backendBindings.AppendChild($binding6) >> temp_update_config.ps1
echo $backendSite.AppendChild($backendBindings) >> temp_update_config.ps1
echo. >> temp_update_config.ps1
echo # Add sites to configuration >> temp_update_config.ps1
echo $sites.AppendChild($frontendSite) >> temp_update_config.ps1
echo $sites.AppendChild($backendSite) >> temp_update_config.ps1
echo. >> temp_update_config.ps1
echo # Save the configuration >> temp_update_config.ps1
echo $xml.Save($configPath) >> temp_update_config.ps1
echo Write-Host "Configuration updated successfully!" >> temp_update_config.ps1

echo ????? PowerShell script...
powershell -ExecutionPolicy Bypass -File temp_update_config.ps1

if %ERRORLEVEL% EQU 0 (
    echo ? ?? ????? ??? ??????? ?????!
) else (
    echo ? ??? ?? ????? ??? ???????
    echo ??? ??????? ??????
)

:: Cleanup
del temp_update_config.ps1 2>nul

echo.
echo ?? ????????? ???????:
echo    ? ????? Assets-Frontend site ??? ?????? 8098
echo    ? ????? Assets-Backend site ??? ?????? 8099  
echo    ? Bindings ??? localhost ? 10.0.0.17
echo    ? Physical paths ???????? ????????
echo.

echo ?? ?????????:
echo    1. ??? ????? IIS Express
echo    2. ?????: http://10.0.0.17:8098/ (Frontend)
echo    3. ?????: http://10.0.0.17:8099/ (Backend)
echo.

echo ?? ?????? ?? ?????????:
echo    ????: %configPath%
echo    ???? ??: "Assets-Frontend" ? "Assets-Backend"
echo.

pause