# Backend API Test Script
Write-Host "?? Testing Backend APIs..." -ForegroundColor Yellow

$baseUrl = "http://localhost:5002"

# Test different endpoints
$endpoints = @(
    @{ Name = "Health Check"; Url = "$baseUrl" },
    @{ Name = "Debug Health"; Url = "$baseUrl/api/debug/health" },
    @{ Name = "Disposal Test"; Url = "$baseUrl/api/disposals/test" },
    @{ Name = "Disposal Reasons"; Url = "$baseUrl/api/disposals/reasons" },
    @{ Name = "Maintenance Test"; Url = "$baseUrl/api/maintenance/test" },
    @{ Name = "Maintenance Types"; Url = "$baseUrl/api/maintenance/types" },
    @{ Name = "Maintenance Stats"; Url = "$baseUrl/api/maintenance/stats" },
    @{ Name = "Reports Test"; Url = "$baseUrl/api/reports/test" },
    @{ Name = "Available Reports"; Url = "$baseUrl/api/reports/available-reports" },
    @{ Name = "Assets Summary"; Url = "$baseUrl/api/reports/assets-summary" },
    @{ Name = "Assets"; Url = "$baseUrl/api/assets" },
    @{ Name = "Categories"; Url = "$baseUrl/api/categories" }
)

foreach ($endpoint in $endpoints) {
    Write-Host ""
    Write-Host "Testing: $($endpoint.Name)" -ForegroundColor Cyan
    Write-Host "URL: $($endpoint.Url)" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $endpoint.Url -Method GET -TimeoutSec 5 -ErrorAction Stop
        Write-Host "? SUCCESS" -ForegroundColor Green
        
        if ($response) {
            if ($response.success -ne $null) {
                Write-Host "   Success: $($response.success)" -ForegroundColor White
                Write-Host "   Message: $($response.message)" -ForegroundColor White
            } else {
                Write-Host "   Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor White
            }
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
Write-Host "?? Summary:" -ForegroundColor Yellow
Write-Host "If any endpoints work, Backend is running." -ForegroundColor White
Write-Host "If Disposal endpoints fail but others work, DisposalController has issues." -ForegroundColor White
Write-Host "If Maintenance endpoints fail, MaintenanceController has issues." -ForegroundColor White
Write-Host "If Reports endpoints fail, ReportsController has issues." -ForegroundColor White
Write-Host "If all fail, Backend is not responding properly." -ForegroundColor White

Write-Host ""
Write-Host "?? Next Steps:" -ForegroundColor Cyan
Write-Host "1. Test Reports page: http://localhost:3000/reports" -ForegroundColor White
Write-Host "2. Check different report types (Disposal, Maintenance, Transfers)" -ForegroundColor White
Write-Host "3. Test date range filtering" -ForegroundColor White