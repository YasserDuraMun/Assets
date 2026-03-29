# ===============================================
# Backend Health Check Script
# ??? ??? Backend ?Disposal APIs
# ===============================================

Write-Host "?? Checking Backend Health and Disposal APIs..." -ForegroundColor Yellow
Write-Host ""

$baseUrl = "http://localhost:5002"

# Test basic connectivity
Write-Host "1. Testing basic connectivity..." -ForegroundColor Blue
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/assets" -Method GET -TimeoutSec 5
    Write-Host "? Backend is running and responsive" -ForegroundColor Green
} catch {
    Write-Host "? Backend is not responding!" -ForegroundColor Red
    Write-Host "Please start the backend application (F5 in Visual Studio)" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test Disposal Controller
Write-Host "2. Testing Disposal Controller..." -ForegroundColor Blue

# Test disposal test endpoint
try {
    $testResponse = Invoke-RestMethod -Uri "$baseUrl/api/disposals/test" -Method GET -TimeoutSec 5
    Write-Host "? Disposal Controller Test: $($testResponse.message)" -ForegroundColor Green
    Write-Host "   Timestamp: $($testResponse.timestamp)" -ForegroundColor Gray
} catch {
    Write-Host "? Disposal Controller Test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test disposal reasons endpoint
try {
    $reasonsResponse = Invoke-RestMethod -Uri "$baseUrl/api/disposals/reasons" -Method GET -TimeoutSec 5
    if ($reasonsResponse.success) {
        Write-Host "? Disposal Reasons: Found $($reasonsResponse.data.Count) reasons" -ForegroundColor Green
        $reasonsResponse.data | ForEach-Object { 
            Write-Host "   $($_.value) = $($_.label)" -ForegroundColor Gray 
        }
    } else {
        Write-Host "? Disposal Reasons: API returned unsuccessful response" -ForegroundColor Red
    }
} catch {
    Write-Host "? Disposal Reasons failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test other controllers
Write-Host "3. Testing other critical endpoints..." -ForegroundColor Blue

$endpoints = @(
    @{ Name = "Assets"; Url = "$baseUrl/api/assets" },
    @{ Name = "Dashboard"; Url = "$baseUrl/api/dashboard/statistics" },
    @{ Name = "Categories"; Url = "$baseUrl/api/categories" }
)

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-RestMethod -Uri $endpoint.Url -Method GET -TimeoutSec 3
        Write-Host "? $($endpoint.Name) API working" -ForegroundColor Green
    } catch {
        Write-Host "?? $($endpoint.Name) API issue: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "?? Summary:" -ForegroundColor Cyan
Write-Host ""
Write-Host "If all tests passed:" -ForegroundColor Green
Write-Host "  ? Backend is healthy" -ForegroundColor White
Write-Host "  ? Disposal system should work" -ForegroundColor White
Write-Host "  ? Try disposing an asset from frontend" -ForegroundColor White
Write-Host ""
Write-Host "If tests failed:" -ForegroundColor Red
Write-Host "  ?? Restart Backend (F5 in Visual Studio)" -ForegroundColor White
Write-Host "  ?? Check Visual Studio Output window for errors" -ForegroundColor White
Write-Host "  ?? Verify database connection in appsettings.json" -ForegroundColor White
Write-Host ""
Write-Host "Frontend URLs to test:" -ForegroundColor Cyan
Write-Host "  ?? Assets: http://localhost:5173/assets" -ForegroundColor White
Write-Host "  ??? Disposals: http://localhost:5173/disposals" -ForegroundColor White
Write-Host "===============================================" -ForegroundColor Cyan