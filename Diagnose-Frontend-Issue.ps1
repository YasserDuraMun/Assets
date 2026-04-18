# =====================================================
# ????? ???? ?????? Frontend ?????? ???????
# ??? ???? ????????? ??????????
# =====================================================

Write-Host "?? ????? ????? Frontend ?????? ???????" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# ??? 1: Backend
Write-Host "1?? ??? Backend..." -ForegroundColor Yellow

try {
    $swaggerTest = Invoke-WebRequest -Uri "http://10.0.0.17:8099/swagger/index.html" -UseBasicParsing -TimeoutSec 5
    Write-Host "   ? Swagger ????: $($swaggerTest.StatusCode)" -ForegroundColor Green
    
    $apiTest = Invoke-WebRequest -Uri "http://10.0.0.17:8099/api" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($apiTest) {
        Write-Host "   ? API ????: $($apiTest.StatusCode)" -ForegroundColor Green
    } else {
        Write-Host "   ?? API ?? ??? ??? /api" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ? Backend ??? ????: $($_.Exception.Message)" -ForegroundColor Red
}

# ??? 2: Frontend Files
Write-Host ""
Write-Host "2?? ??? ????? Frontend..." -ForegroundColor Yellow

$distPath = ".\ClientApp\dist"
if (Test-Path $distPath) {
    $distFiles = Get-ChildItem -Path $distPath -Recurse -File
    $distSize = ($distFiles | Measure-Object -Property Length -Sum).Sum / 1MB
    $lastModified = ($distFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime
    
    Write-Host "   ? dist ?????: $($distFiles.Count) ???" -ForegroundColor Green
    Write-Host "   ?? ?????: $([Math]::Round($distSize, 2)) MB" -ForegroundColor Gray
    Write-Host "   ?? ??? ?????: $lastModified" -ForegroundColor Gray
    
    # ??? index.html
    if (Test-Path "$distPath\index.html") {
        $indexContent = Get-Content "$distPath\index.html" -Raw
        if ($indexContent -match "build-time.*content='(\d+)'") {
            Write-Host "   ? Build Time: $($matches[1])" -ForegroundColor Cyan
        } else {
            Write-Host "   ?? ?? ???? timestamp ?? index.html" -ForegroundColor Yellow
        }
        
        if ($indexContent -match "10\.0\.0\.17:8099") {
            Write-Host "   ? ????? ??? API ??????" -ForegroundColor Green
        } else {
            Write-Host "   ? ?? ????? ??? API ??????" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   ? dist ??? ?????" -ForegroundColor Red
}

# ??? 3: ??????? .env
Write-Host ""
Write-Host "3?? ??? ??????? .env..." -ForegroundColor Yellow

if (Test-Path "ClientApp\.env") {
    $envContent = Get-Content "ClientApp\.env"
    $apiUrl = $envContent | Where-Object { $_ -match "VITE_API_BASE_URL" } | Select-Object -First 1
    
    Write-Host "   ? .env ?????" -ForegroundColor Green
    Write-Host "   ?? $apiUrl" -ForegroundColor Cyan
    
    if ($apiUrl -match "10\.0\.0\.17:8099") {
        Write-Host "   ? API URL ????" -ForegroundColor Green
    } else {
        Write-Host "   ? API URL ???" -ForegroundColor Red
    }
} else {
    Write-Host "   ? .env ??? ?????" -ForegroundColor Red
}

# ??? 4: IIS
Write-Host ""
Write-Host "4?? ??? IIS..." -ForegroundColor Yellow

$iisPath = "C:\inetpub\wwwroot\AssetWeb"
try {
    if (Test-Path $iisPath) {
        $iisFiles = Get-ChildItem -Path $iisPath -Recurse -File -ErrorAction SilentlyContinue
        if ($iisFiles) {
            $iisLastModified = ($iisFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime
            Write-Host "   ? IIS ???? ?????: $($iisFiles.Count) ???" -ForegroundColor Green
            Write-Host "   ?? ??? ????? IIS: $iisLastModified" -ForegroundColor Gray
            
            # ?????? ????????
            if (Test-Path $distPath) {
                $distLastModified = (Get-ChildItem -Path $distPath -Recurse -File | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime
                
                if ($iisLastModified -lt $distLastModified) {
                    Write-Host "   ?? IIS ???? ?? dist - ????? ??? ????!" -ForegroundColor Yellow
                } else {
                    Write-Host "   ? IIS ????" -ForegroundColor Green
                }
            }
        } else {
            Write-Host "   ?? IIS ???? ????" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ? IIS ???? ??? ?????" -ForegroundColor Red
    }
} catch {
    Write-Host "   ?? ?? ???? ?????? ????? IIS" -ForegroundColor Yellow
}

# ??? 5: ?????? Frontend
Write-Host ""
Write-Host "5?? ?????? Frontend..." -ForegroundColor Yellow

try {
    $frontendResponse = Invoke-WebRequest -Uri "http://10.0.0.17:8098" -UseBasicParsing -TimeoutSec 10
    Write-Host "   ? Frontend ????: $($frontendResponse.StatusCode)" -ForegroundColor Green
    
    # ??? ????? ?????????
    if ($frontendResponse.Content -match "Assets Management") {
        Write-Host "   ? ????? ??? Assets Management" -ForegroundColor Green
    }
    
    if ($frontendResponse.Content -match "build-time") {
        Write-Host "   ? ????? ??? build timestamp" -ForegroundColor Green
    } else {
        Write-Host "   ?? ?? ????? ??? build timestamp" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "   ? Frontend ??? ????: $($_.Exception.Message)" -ForegroundColor Red
}

# ??????? ???????
Write-Host ""
Write-Host "?? ========================================" -ForegroundColor Blue
Write-Host "?? ????? ??????? ??????? ????????:" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

Write-Host "?? ?????? ???????:" -ForegroundColor Green
Write-Host "1. ??? ????? ??????:" -ForegroundColor Yellow
Write-Host "   .\fix-frontend-cache-quick.bat" -ForegroundColor Gray
Write-Host ""
Write-Host "2. ?? ??? Cache ???????:" -ForegroundColor Yellow
Write-Host "   • ???? ????? ???? (Incognito)" -ForegroundColor Gray
Write-Host "   • ???? Ctrl+Shift+R" -ForegroundColor Gray
Write-Host "   • ???? cache ?? ??????? ???????" -ForegroundColor Gray
Write-Host ""
Write-Host "3. ?? ??? Developer Tools:" -ForegroundColor Yellow
Write-Host "   • ???? F12" -ForegroundColor Gray
Write-Host "   • ???? ?? Network tab" -ForegroundColor Gray
Write-Host "   • ???? ?? ?? API calls ???? ?? 8099" -ForegroundColor Gray
Write-Host ""
Write-Host "4. ?? ??? ???? ??? ??? ?????:" -ForegroundColor Yellow
Write-Host "   ??: .\ClientApp\dist" -ForegroundColor Gray
Write-Host "   ???: C:\inetpub\wwwroot\AssetWeb" -ForegroundColor Gray

Write-Host ""
Write-Host "?? URLs ????????:" -ForegroundColor Cyan
Write-Host "   Frontend: http://10.0.0.17:8098" -ForegroundColor Gray
Write-Host "   Backend: http://10.0.0.17:8099/swagger" -ForegroundColor Gray
Write-Host "   API Test: http://10.0.0.17:8099/api" -ForegroundColor Gray