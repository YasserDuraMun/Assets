# Test Reports API Endpoints
Write-Host "?? Testing Reports APIs..." -ForegroundColor Yellow

$baseUrl = "http://localhost:5002"
$token = "your-jwt-token-here" # Replace with actual token

# Headers
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Report filter (last 30 days)
$filter = @{
    startDate = (Get-Date).AddDays(-30).ToString("yyyy-MM-dd")
    endDate = (Get-Date).ToString("yyyy-MM-dd")
} | ConvertTo-Json

# Test different report endpoints
$endpoints = @(
    @{ Name = "Reports Test"; Url = "$baseUrl/api/reports/test"; Method = "GET"; Body = $null },
    @{ Name = "Summary Report"; Url = "$baseUrl/api/reports/summary"; Method = "POST"; Body = $filter },
    @{ Name = "Assets Report"; Url = "$baseUrl/api/reports/assets"; Method = "POST"; Body = $filter },
    @{ Name = "Disposals Report"; Url = "$baseUrl/api/reports/disposals"; Method = "POST"; Body = $filter },
    @{ Name = "Maintenance Report"; Url = "$baseUrl/api/reports/maintenance"; Method = "POST"; Body = $filter },
    @{ Name = "Transfers Report"; Url = "$baseUrl/api/reports/transfers"; Method = "POST"; Body = $filter }
)

foreach ($endpoint in $endpoints) {
    Write-Host ""
    Write-Host "Testing: $($endpoint.Name)" -ForegroundColor Cyan
    Write-Host "URL: $($endpoint.Url)" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $endpoint.Url
            Method = $endpoint.Method
            Headers = $headers
            TimeoutSec = 10
            ErrorAction = "Stop"
        }
        
        if ($endpoint.Body) {
            $params.Body = $endpoint.Body
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "? SUCCESS" -ForegroundColor Green
        
        if ($response) {
            if ($response.success -ne $null) {
                Write-Host "   Success: $($response.success)" -ForegroundColor White
                Write-Host "   Message: $($response.message)" -ForegroundColor White
                
                if ($response.data -and $response.data.summary) {
                    $summary = $response.data.summary
                    Write-Host "   ?? Summary:" -ForegroundColor Cyan
                    Write-Host "      Total Assets: $($summary.totalAssets)" -ForegroundColor White
                    Write-Host "      Total Disposals: $($summary.totalDisposals)" -ForegroundColor White
                    Write-Host "      Total Maintenance: $($summary.totalMaintenance)" -ForegroundColor White
                    Write-Host "      Total Transfers: $($summary.totalTransfers)" -ForegroundColor White
                    Write-Host "      Total Asset Value: $($summary.totalAssetValue)" -ForegroundColor White
                }
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
            
            # Try to read error response
            try {
                $errorStream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorStream)
                $errorResponse = $reader.ReadToEnd()
                if ($errorResponse) {
                    Write-Host "   Details: $errorResponse" -ForegroundColor Red
                }
            }
            catch {
                # Ignore error reading response
            }
        }
    }
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Yellow
Write-Host "?? Reports API Test Summary:" -ForegroundColor Yellow
Write-Host "1. First test the '/api/reports/test' endpoint without auth" -ForegroundColor White
Write-Host "2. If working, get a JWT token from login" -ForegroundColor White
Write-Host "3. Update the token variable above and test other endpoints" -ForegroundColor White
Write-Host "4. Reports require authentication and valid date ranges" -ForegroundColor White
Write-Host ""

# Test without authentication first
Write-Host "Testing without authentication..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/reports/test" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "? Basic endpoint works!" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "? Authentication required (expected)" -ForegroundColor Green
        Write-Host "   Get a token and update the script" -ForegroundColor Yellow
    } else {
        Write-Host "? Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}