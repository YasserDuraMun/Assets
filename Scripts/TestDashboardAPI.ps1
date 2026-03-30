# Dashboard API Test Script
Write-Host "?? Testing Dashboard API..." -ForegroundColor Yellow

$baseUrl = "http://localhost:5002/api"
$token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test"  # ?????? ???? token ??????

# Test Dashboard endpoints
$endpoints = @(
    @{ Name = "Dashboard Statistics"; Url = "$baseUrl/dashboard/statistics" },
    @{ Name = "Assets by Category"; Url = "$baseUrl/dashboard/assets-by-category" },
    @{ Name = "Assets by Status"; Url = "$baseUrl/dashboard/assets-by-status" },
    @{ Name = "Recent Activities"; Url = "$baseUrl/dashboard/recent-activities" },
    @{ Name = "Dashboard Alerts"; Url = "$baseUrl/dashboard/alerts" }
)

foreach ($endpoint in $endpoints) {
    Write-Host ""
    Write-Host "Testing: $($endpoint.Name)" -ForegroundColor Cyan
    Write-Host "URL: $($endpoint.Url)" -ForegroundColor Gray
    
    try {
        # Test without auth first (to check if endpoint exists)
        $response = Invoke-RestMethod -Uri $endpoint.Url -Method GET -TimeoutSec 5 -ErrorAction Stop
        Write-Host "? SUCCESS" -ForegroundColor Green
        
        if ($response) {
            Write-Host "   Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor White
        }
    }
    catch {
        Write-Host "? FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "=" * 50 -ForegroundColor Yellow
Write-Host "?? Dashboard API Test Complete" -ForegroundColor Yellow