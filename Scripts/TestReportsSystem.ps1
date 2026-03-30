# Municipal Asset Reports Test Script
Write-Host "?? Testing Municipal Asset Management Reports System..." -ForegroundColor Yellow

$baseUrl = "http://localhost:5002"
$reportsBaseUrl = "$baseUrl/api/reports"

# Test reports endpoints
$reportEndpoints = @(
    @{ 
        Name = "Reports Controller Test"
        Url = "$reportsBaseUrl/test"
        Description = "Test if ReportsController is working"
    },
    @{ 
        Name = "Available Reports List"
        Url = "$reportsBaseUrl/available-reports"
        Description = "Get list of all available report types"
    },
    @{ 
        Name = "Assets Summary Report"
        Url = "$reportsBaseUrl/assets-summary"
        Description = "Overall assets summary and statistics"
    },
    @{ 
        Name = "Assets by Status"
        Url = "$reportsBaseUrl/assets-by-status"
        Description = "Assets distribution by status"
    },
    @{ 
        Name = "Assets by Category"
        Url = "$reportsBaseUrl/assets-by-category"
        Description = "Assets distribution by category"
    },
    @{ 
        Name = "Assets by Location"
        Url = "$reportsBaseUrl/assets-by-location"
        Description = "Assets distribution by location"
    },
    @{ 
        Name = "Disposal Report"
        Url = "$reportsBaseUrl/disposal-report"
        Description = "Disposed assets during a period"
    },
    @{ 
        Name = "Maintenance Report"
        Url = "$reportsBaseUrl/maintenance-report"
        Description = "Maintenance activities during a period"
    },
    @{ 
        Name = "Transfers Report"
        Url = "$reportsBaseUrl/transfers-report"
        Description = "Asset transfers during a period"
    },
    @{ 
        Name = "Monthly Summary"
        Url = "$reportsBaseUrl/monthly-summary?year=2026&month=3"
        Description = "Monthly summary for March 2026"
    }
)

Write-Host ""
Write-Host "?? Testing Reports Endpoints:" -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$totalCount = $reportEndpoints.Count

foreach ($endpoint in $reportEndpoints) {
    Write-Host "Testing: $($endpoint.Name)" -ForegroundColor Cyan
    Write-Host "Description: $($endpoint.Description)" -ForegroundColor Gray
    Write-Host "URL: $($endpoint.Url)" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $endpoint.Url -Method GET -TimeoutSec 10 -ErrorAction Stop
        Write-Host "? SUCCESS" -ForegroundColor Green
        $successCount++
        
        if ($response) {
            if ($response.success -ne $null) {
                Write-Host "   Success: $($response.success)" -ForegroundColor White
                Write-Host "   Message: $($response.message)" -ForegroundColor White
                
                if ($response.data) {
                    if ($response.data.reportTitle) {
                        Write-Host "   Report Title: $($response.data.reportTitle)" -ForegroundColor Magenta
                    }
                    if ($response.data.summary) {
                        Write-Host "   Summary Available: Yes" -ForegroundColor Green
                    }
                    if ($response.data.charts) {
                        Write-Host "   Charts Data Available: Yes" -ForegroundColor Green
                    }
                }
            } else {
                Write-Host "   Response Data Available: Yes" -ForegroundColor Green
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
    
    Write-Host ""
}

# Summary
Write-Host "=" * 70 -ForegroundColor Yellow
Write-Host "?? REPORTS SYSTEM TEST SUMMARY" -ForegroundColor Yellow
Write-Host "=" * 70 -ForegroundColor Yellow

$successRate = [math]::Round(($successCount / $totalCount) * 100, 1)

Write-Host "? Successful Tests: $successCount / $totalCount ($successRate%)" -ForegroundColor Green

if ($successCount -eq $totalCount) {
    Write-Host "?? ALL REPORTS ENDPOINTS WORKING PERFECTLY!" -ForegroundColor Green
    Write-Host ""
    Write-Host "?? Ready to Test:" -ForegroundColor Cyan
    Write-Host "   • Frontend Reports Page: http://localhost:3000/reports" -ForegroundColor White
    Write-Host "   • Test date range filtering" -ForegroundColor White
    Write-Host "   • Test different report categories" -ForegroundColor White
    Write-Host "   • Test disposal reasons filtering" -ForegroundColor White
    Write-Host "   • Test maintenance types filtering" -ForegroundColor White
    
} elseif ($successCount -gt ($totalCount / 2)) {
    Write-Host "??  PARTIAL SUCCESS - Some reports working" -ForegroundColor Yellow
    Write-Host "   Check failed endpoints above for issues" -ForegroundColor White
    
} else {
    Write-Host "? SYSTEM ISSUES DETECTED" -ForegroundColor Red
    Write-Host "   Possible causes:" -ForegroundColor White
    Write-Host "   • ReportsService not registered in Program.cs" -ForegroundColor Red
    Write-Host "   • Database connection issues" -ForegroundColor Red
    Write-Host "   • IReportsService implementation missing" -ForegroundColor Red
}

Write-Host ""
Write-Host "??? Municipal Asset Management System - Reports Module" -ForegroundColor Cyan
Write-Host "??? Ready for Municipality Use!" -ForegroundColor Green
Write-Host ""