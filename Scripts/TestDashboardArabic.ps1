# Test Dashboard with Arabic Text
Write-Host "?? Testing Dashboard Arabic Text..." -ForegroundColor Yellow

$baseUrl = "http://localhost:5002/api"

# Test Dashboard endpoints
Write-Host ""
Write-Host "Testing Dashboard Statistics..." -ForegroundColor Cyan

try {
    $statsResponse = Invoke-RestMethod -Uri "$baseUrl/dashboard/statistics" -Method GET -TimeoutSec 5
    Write-Host "? Statistics SUCCESS" -ForegroundColor Green
    Write-Host "   Response: $($statsResponse | ConvertTo-Json -Depth 2)" -ForegroundColor White
}
catch {
    Write-Host "? Statistics FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Testing Category Data..." -ForegroundColor Cyan

try {
    $categoryResponse = Invoke-RestMethod -Uri "$baseUrl/dashboard/assets-by-category" -Method GET -TimeoutSec 5
    Write-Host "? Category Data SUCCESS" -ForegroundColor Green
    Write-Host "   Response: $($categoryResponse | ConvertTo-Json -Depth 3)" -ForegroundColor White
}
catch {
    Write-Host "? Category Data FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Testing Status Data..." -ForegroundColor Cyan

try {
    $statusResponse = Invoke-RestMethod -Uri "$baseUrl/dashboard/assets-by-status" -Method GET -TimeoutSec 5
    Write-Host "? Status Data SUCCESS" -ForegroundColor Green
    Write-Host "   Response: $($statusResponse | ConvertTo-Json -Depth 3)" -ForegroundColor White
}
catch {
    Write-Host "? Status Data FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=" * 50 -ForegroundColor Yellow
Write-Host "?? Dashboard Arabic Test Complete" -ForegroundColor Yellow