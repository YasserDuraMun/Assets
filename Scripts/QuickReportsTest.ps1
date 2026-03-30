# Quick Test for Reports APIs
Write-Host "?? Quick Reports API Test..." -ForegroundColor Yellow

$baseUrl = "http://localhost:5002/api/reports"

# Test basic endpoints
$endpoints = @(
    "test",
    "available-reports", 
    "assets-summary",
    "assets-by-status",
    "assets-by-category",
    "assets-by-location",
    "disposal-report",
    "maintenance-report",
    "transfers-report",
    "monthly-summary?year=2026&month=3"
)

foreach ($endpoint in $endpoints) {
    Write-Host ""
    Write-Host "Testing: $endpoint" -ForegroundColor Cyan
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/$endpoint" -Method GET -TimeoutSec 5
        
        if ($response.success) {
            Write-Host "? SUCCESS" -ForegroundColor Green
        } else {
            Write-Host "? FAILED: $($response.message)" -ForegroundColor Red
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "? ERROR: $statusCode - $($_.Exception.Message)" -ForegroundColor Red
        
        if ($statusCode -eq 404) {
            Write-Host "   ? Endpoint not found!" -ForegroundColor Yellow
        } elseif ($statusCode -eq 401) {
            Write-Host "   ? Authentication required!" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "?? Test Complete!" -ForegroundColor Green