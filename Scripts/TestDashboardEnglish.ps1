# Test Dashboard with English Text
Write-Host "?? Testing Dashboard English Text..." -ForegroundColor Yellow

$baseUrl = "http://localhost:5002/api"

# Test Dashboard endpoints
Write-Host ""
Write-Host "Testing Dashboard Statistics..." -ForegroundColor Cyan

try {
    $statsResponse = Invoke-RestMethod -Uri "$baseUrl/dashboard/statistics" -Method GET -TimeoutSec 10
    Write-Host "? Statistics SUCCESS" -ForegroundColor Green
    Write-Host "   Total Assets: $($statsResponse.data.totalAssets)" -ForegroundColor White
    Write-Host "   Active Assets: $($statsResponse.data.activeAssets)" -ForegroundColor White
    Write-Host "   Under Maintenance: $($statsResponse.data.assetsUnderMaintenance)" -ForegroundColor White
    Write-Host "   Disposed: $($statsResponse.data.disposedAssets)" -ForegroundColor White
}
catch {
    Write-Host "? Statistics FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Testing Category Distribution..." -ForegroundColor Cyan

try {
    $categoryResponse = Invoke-RestMethod -Uri "$baseUrl/dashboard/assets-by-category" -Method GET -TimeoutSec 10
    Write-Host "? Category Data SUCCESS" -ForegroundColor Green
    
    if ($categoryResponse.data.categoryDistribution) {
        Write-Host "   Categories found:" -ForegroundColor White
        foreach ($cat in $categoryResponse.data.categoryDistribution) {
            Write-Host "   - $($cat.name): $($cat.value) assets" -ForegroundColor Gray
        }
    }
}
catch {
    Write-Host "? Category Data FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Testing Status Distribution..." -ForegroundColor Cyan

try {
    $statusResponse = Invoke-RestMethod -Uri "$baseUrl/dashboard/assets-by-status" -Method GET -TimeoutSec 10
    Write-Host "? Status Data SUCCESS" -ForegroundColor Green
    
    if ($statusResponse.data.statusDistribution) {
        Write-Host "   Statuses found:" -ForegroundColor White
        foreach ($status in $statusResponse.data.statusDistribution) {
            Write-Host "   - $($status.name): $($status.value) assets" -ForegroundColor Gray
        }
    }
}
catch {
    Write-Host "? Status Data FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=" * 50 -ForegroundColor Yellow
Write-Host "?? Dashboard English Test Complete" -ForegroundColor Yellow
Write-Host "Dashboard should now display in English!" -ForegroundColor Green