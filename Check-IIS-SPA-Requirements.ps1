# =====================================================
# ??? ??????? IIS ??? ????? SPA 404
# ?????? ?? ????? URL Rewrite ???????? IIS
# =====================================================

Write-Host "?? ??? ??????? IIS ?? SPA Routing" -ForegroundColor Blue
Write-Host "===============================" -ForegroundColor Blue
Write-Host ""

# ??? 1: URL Rewrite Module
Write-Host "1?? ??? URL Rewrite Module..." -ForegroundColor Yellow

$urlRewriteInstalled = $false
try {
    # ??? ?? Registry
    $rewriteKey = Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\IIS Extensions\URL Rewrite" -ErrorAction SilentlyContinue
    if ($rewriteKey) {
        $urlRewriteInstalled = $true
        Write-Host "   ? URL Rewrite Module ????" -ForegroundColor Green
        Write-Host "   ?? Version: $($rewriteKey.Version -or 'Unknown')" -ForegroundColor Gray
    }
    
    # ??? ?? IIS Modules
    $modules = & "$env:windir\system32\inetsrv\appcmd.exe" list modules 2>$null
    if ($modules -and ($modules -match "RewriteModule")) {
        $urlRewriteInstalled = $true
        Write-Host "   ? RewriteModule ?????? ?? IIS" -ForegroundColor Green
    }
    
    if (-not $urlRewriteInstalled) {
        Write-Host "   ? URL Rewrite Module ??? ????" -ForegroundColor Red
        Write-Host "   ?? ????? ??: https://www.iis.net/downloads/microsoft/url-rewrite" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "   ?? ?? ???? ??? URL Rewrite Module: $($_.Exception.Message)" -ForegroundColor Yellow
}

# ??? 2: IIS Features
Write-Host ""
Write-Host "2?? ??? IIS Features..." -ForegroundColor Yellow

$requiredFeatures = @(
    @{ Name = "IIS-WebServerRole"; Description = "IIS Web Server" },
    @{ Name = "IIS-WebServer"; Description = "World Wide Web Services" },
    @{ Name = "IIS-CommonHttpFeatures"; Description = "Common HTTP Features" },
    @{ Name = "IIS-StaticContent"; Description = "Static Content" },
    @{ Name = "IIS-DefaultDocument"; Description = "Default Document" },
    @{ Name = "IIS-HttpErrors"; Description = "HTTP Errors" },
    @{ Name = "IIS-HttpRedirect"; Description = "HTTP Redirection" }
)

foreach ($feature in $requiredFeatures) {
    try {
        $featureState = Get-WindowsOptionalFeature -Online -FeatureName $feature.Name -ErrorAction SilentlyContinue
        if ($featureState -and $featureState.State -eq "Enabled") {
            Write-Host "   ? $($feature.Description)" -ForegroundColor Green
        } else {
            Write-Host "   ? $($feature.Description) - ??? ??????" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ?? $($feature.Description) - ?? ???? ?????" -ForegroundColor Yellow
    }
}

# ??? 3: IIS Sites ? Application Pools
Write-Host ""
Write-Host "3?? ??? IIS Sites..." -ForegroundColor Yellow

try {
    Import-Module WebAdministration -ErrorAction SilentlyContinue
    
    if (Get-Module WebAdministration -ErrorAction SilentlyContinue) {
        # ??? ???????
        $sites = Get-IISSite
        $assetSites = $sites | Where-Object { $_.Name -like "*Asset*" -or $_.Bindings.bindingInformation -like "*:8098*" }
        
        if ($assetSites) {
            foreach ($site in $assetSites) {
                Write-Host "   ? ????: $($site.Name)" -ForegroundColor Green
                Write-Host "      ?? Path: $($site.Applications[0].VirtualDirectories[0].PhysicalPath)" -ForegroundColor Gray
                Write-Host "      ?? Binding: $($site.Bindings.bindingInformation)" -ForegroundColor Gray
                Write-Host "      ?? State: $($site.State)" -ForegroundColor Gray
            }
        } else {
            Write-Host "   ?? ?? ???? ???? ??? ?????? 8098" -ForegroundColor Yellow
        }
        
        # ??? Application Pools
        $pools = Get-IISAppPool
        $assetPools = $pools | Where-Object { $_.Name -like "*Asset*" }
        
        if ($assetPools) {
            foreach ($pool in $assetPools) {
                Write-Host "   ? Application Pool: $($pool.Name)" -ForegroundColor Green
                Write-Host "      ?? State: $($pool.State)" -ForegroundColor Gray
                Write-Host "      ?? .NET Version: $($pool.ManagedRuntimeVersion -or 'No Managed Code')" -ForegroundColor Gray
            }
        }
        
    } else {
        Write-Host "   ?? ?? ???? ????? WebAdministration module" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "   ?? ??? ?? ??? IIS Sites: $($_.Exception.Message)" -ForegroundColor Yellow
}

# ??? 4: ??????? ????????
Write-Host ""
Write-Host "4?? ??? ????? Frontend..." -ForegroundColor Yellow

$paths = @(
    @{ Path = ".\ClientApp\dist\index.html"; Description = "Build Output - index.html" },
    @{ Path = ".\ClientApp\dist\web.config"; Description = "Build Output - web.config" },
    @{ Path = "C:\inetpub\wwwroot\AssetWeb\index.html"; Description = "IIS - index.html" },
    @{ Path = "C:\inetpub\wwwroot\AssetWeb\web.config"; Description = "IIS - web.config" }
)

foreach ($pathInfo in $paths) {
    if (Test-Path $pathInfo.Path) {
        Write-Host "   ? $($pathInfo.Description)" -ForegroundColor Green
        
        if ($pathInfo.Path -like "*web.config") {
            $content = Get-Content $pathInfo.Path -Raw -ErrorAction SilentlyContinue
            if ($content -and $content -match "React Router SPA") {
                Write-Host "      ?? web.config ????" -ForegroundColor Cyan
            } else {
                Write-Host "      ?? web.config ????" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "   ? $($pathInfo.Description)" -ForegroundColor Red
    }
}

# ??? 5: ?????? Network Connectivity
Write-Host ""
Write-Host "5?? ?????? Network Connectivity..." -ForegroundColor Yellow

$testUrls = @(
    @{ Url = "http://10.0.0.17:8098/index.html"; Description = "index.html ?????" },
    @{ Url = "http://10.0.0.17:8098/"; Description = "?????? ????????" },
    @{ Url = "http://localhost:8098/"; Description = "localhost (local test)" }
)

foreach ($test in $testUrls) {
    try {
        $response = Invoke-WebRequest -Uri $test.Url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        Write-Host "   ? $($test.Description): $($response.StatusCode)" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__ -or "Connection Failed"
        Write-Host "   ? $($test.Description): $statusCode" -ForegroundColor Red
    }
}

# ??????? ?????????
Write-Host ""
Write-Host "?? ==============================" -ForegroundColor Blue
Write-Host "?? ???????? ??? ???????:" -ForegroundColor Blue
Write-Host "==============================" -ForegroundColor Blue
Write-Host ""

if ($urlRewriteInstalled) {
    Write-Host "? URL Rewrite ????? - ???? ????? ????" -ForegroundColor Green
    Write-Host ""
    Write-Host "?? ??????? ??????:" -ForegroundColor Cyan
    Write-Host "   .\fix-iis-spa-404-quick.bat" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "?? ?? ???? ??????:" -ForegroundColor Cyan
    Write-Host "   .\Fix-IIS-SPA-404-Issue.ps1" -ForegroundColor Yellow
} else {
    Write-Host "? URL Rewrite ??? ????? - ??? ??????? ?????" -ForegroundColor Red
    Write-Host ""
    Write-Host "?? ????? ???????:" -ForegroundColor Yellow
    Write-Host "   1. ????? URL Rewrite ??:" -ForegroundColor Gray
    Write-Host "      https://www.iis.net/downloads/microsoft/url-rewrite" -ForegroundColor Gray
    Write-Host "   2. ????? ????????? ?? Administrator" -ForegroundColor Gray
    Write-Host "   3. ????? ????? IIS" -ForegroundColor Gray
    Write-Host "   4. ????? ???? ??? ????" -ForegroundColor Gray
}

Write-Host ""
Write-Host "?? ?????? ????:" -ForegroundColor Blue
Write-Host "   http://10.0.0.17:8098/index.html" -ForegroundColor Gray
Write-Host "   (??? ?? ???? ??? ???? URL Rewrite)" -ForegroundColor Gray

Write-Host ""
Write-Host "?? ??? ?????? ???????:" -ForegroundColor Yellow
Write-Host "   1. ??? Windows Event Viewer" -ForegroundColor Gray
Write-Host "   2. ??? IIS Logs ?? C:\inetpub\logs\LogFiles" -ForegroundColor Gray
Write-Host "   3. ????? ????? ???? IIS ???? ??????" -ForegroundColor Gray