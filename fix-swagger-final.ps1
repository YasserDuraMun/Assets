# ?? ????? ?????? Swagger 500 ?? .NET 9
Write-Host "?? ?? ????? Swagger 500" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

# ????? ????????
Write-Host "?? ????? ???????? ?????????..." -ForegroundColor Yellow
Get-Process -Name "dotnet" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "iisexpress" -ErrorAction SilentlyContinue | Stop-Process -Force

# ???? ???????
Write-Host "?? ???? ???????..." -ForegroundColor Yellow
& dotnet build --verbosity quiet

if ($LASTEXITCODE -ne 0) {
    Write-Host "? ??? ??????" -ForegroundColor Red
    exit 1
}

Write-Host "? ?????? ???!" -ForegroundColor Green

# ????? ???????
Write-Host "?? ????? ??????? ??????? Swagger..." -ForegroundColor Yellow
$job = Start-Job -ScriptBlock { & dotnet run --environment Development }

# ??????
Start-Sleep -Seconds 8

# ?????? endpoints
Write-Host "?? ?????? Endpoints:" -ForegroundColor Cyan

try {
    $health = Invoke-WebRequest -Uri "http://localhost:5002/api/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "Health: $($health.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Health: Error - $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $swagger = Invoke-WebRequest -Uri "http://localhost:5002/swagger/v1/swagger.json" -UseBasicParsing -TimeoutSec 5
    Write-Host "Swagger JSON: $($swagger.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Swagger JSON: Error - $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $swaggerUI = Invoke-WebRequest -Uri "http://localhost:5002/swagger/index.html" -UseBasicParsing -TimeoutSec 5
    Write-Host "Swagger UI: $($swaggerUI.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Swagger UI: Error - $($_.Exception.Message)" -ForegroundColor Red
}

# ????? ???????
Write-Host "?? ????? ???????..." -ForegroundColor Yellow
Get-Process -Name "dotnet" -ErrorAction SilentlyContinue | Stop-Process -Force
Stop-Job $job -ErrorAction SilentlyContinue
Remove-Job $job -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "=========================" -ForegroundColor Green
Write-Host "?? ??????? ??????!" -ForegroundColor Green  
Write-Host "=========================" -ForegroundColor Green
Write-Host ""
Write-Host "? ?? ????? IIS Express ????????" -ForegroundColor Green
Write-Host "? ?? ???? ??????? ?????" -ForegroundColor Green
Write-Host "? ?? ?????? Swagger" -ForegroundColor Green
Write-Host ""
Write-Host "?? ???????:" -ForegroundColor Cyan
Write-Host "   dotnet run" -ForegroundColor White
Write-Host ""
Write-Host "?? ????????:" -ForegroundColor Cyan  
Write-Host "   http://localhost:5002/swagger" -ForegroundColor White
Write-Host "   http://localhost:5002/api/health" -ForegroundColor White
Write-Host ""
Write-Host "?? ??????:" -ForegroundColor Cyan
Write-Host "   Email: admin@assets.ps" -ForegroundColor White
Write-Host "   Password: Admin@123" -ForegroundColor White
Write-Host ""

Read-Host "???? Enter ??????"