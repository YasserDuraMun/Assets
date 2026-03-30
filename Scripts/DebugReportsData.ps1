# Debug Reports Data Issue
Write-Host "?? Debugging Reports Data Issue..." -ForegroundColor Yellow

$baseUrl = "http://localhost:5002/api"

# Test Reports endpoints with different date ranges
Write-Host ""
Write-Host "Testing Reports with Different Date Ranges..." -ForegroundColor Cyan

$dateRanges = @(
    @{ Name = "Last 6 months"; StartDate = (Get-Date).AddMonths(-6).ToString("yyyy-MM-dd"); EndDate = (Get-Date).ToString("yyyy-MM-dd") },
    @{ Name = "Last year"; StartDate = (Get-Date).AddYears(-1).ToString("yyyy-MM-dd"); EndDate = (Get-Date).ToString("yyyy-MM-dd") },
    @{ Name = "All time"; StartDate = $null; EndDate = $null },
    @{ Name = "Current month"; StartDate = (Get-Date -Day 1).ToString("yyyy-MM-dd"); EndDate = (Get-Date).ToString("yyyy-MM-dd") }
)

foreach ($range in $dateRanges) {
    Write-Host ""
    Write-Host "Testing: $($range.Name)" -ForegroundColor Green
    Write-Host "Date Range: $($range.StartDate) to $($range.EndDate)" -ForegroundColor Gray
    
    # Test Assets Summary
    try {
        $params = @{}
        if ($range.StartDate) { $params.Add("startDate", $range.StartDate) }
        if ($range.EndDate) { $params.Add("endDate", $range.EndDate) }
        
        $uri = "$baseUrl/reports/assets-summary"
        if ($params.Count -gt 0) {
            $queryString = ($params.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join "&"
            $uri += "?$queryString"
        }
        
        Write-Host "   URL: $uri" -ForegroundColor Gray
        $response = Invoke-RestMethod -Uri $uri -Method GET -TimeoutSec 10
        
        if ($response.success -and $response.data) {
            Write-Host "   ? Assets Summary SUCCESS" -ForegroundColor Green
            
            if ($response.data.summary) {
                Write-Host "   ?? Total Assets: $($response.data.summary.totalAssets)" -ForegroundColor White
                Write-Host "   ?? Active Assets: $($response.data.summary.activeAssets)" -ForegroundColor White
                Write-Host "   ?? Total Value: $($response.data.summary.totalValue) $($response.data.summary.currency)" -ForegroundColor White
            } else {
                Write-Host "   ??  No summary data" -ForegroundColor Yellow
            }
            
            if ($response.data.assetsByCategory -and $response.data.assetsByCategory.Count -gt 0) {
                Write-Host "   ?? Categories: $($response.data.assetsByCategory.Count) found" -ForegroundColor White
                $response.data.assetsByCategory | ForEach-Object {
                    Write-Host "     - $($_.category): $($_.count)" -ForegroundColor Gray
                }
            } else {
                Write-Host "   ? No category data" -ForegroundColor Red
            }
        } else {
            Write-Host "   ? Assets Summary FAILED" -ForegroundColor Red
            Write-Host "   Message: $($response.message)" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "   ? Assets Summary ERROR" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test database directly
Write-Host ""
Write-Host "=" * 50 -ForegroundColor Yellow
Write-Host "???  CHECKING DATABASE DIRECTLY" -ForegroundColor Yellow
Write-Host "=" * 50 -ForegroundColor Yellow

Write-Host "NOTE: Run these SQL queries in SQL Server Management Studio:" -ForegroundColor Green
Write-Host ""
Write-Host "-- Check total assets in database" -ForegroundColor Gray
Write-Host "SELECT COUNT(*) as TotalAssets FROM Assets WHERE IsDeleted = 0;" -ForegroundColor White
Write-Host ""
Write-Host "-- Check assets by category" -ForegroundColor Gray
Write-Host "SELECT c.Name as Category, COUNT(*) as Count" -ForegroundColor White
Write-Host "FROM Assets a" -ForegroundColor White  
Write-Host "INNER JOIN Categories c ON a.CategoryId = c.Id" -ForegroundColor White
Write-Host "WHERE a.IsDeleted = 0" -ForegroundColor White
Write-Host "GROUP BY c.Name;" -ForegroundColor White
Write-Host ""
Write-Host "-- Check asset creation dates" -ForegroundColor Gray
Write-Host "SELECT TOP 10 Name, CreatedAt FROM Assets ORDER BY CreatedAt DESC;" -ForegroundColor White

Write-Host ""
Write-Host "?? Debug Complete!" -ForegroundColor Yellow
Write-Host "If database has data but API returns empty, check:" -ForegroundColor Green
Write-Host "  1. Date filtering in ReportsService" -ForegroundColor White
Write-Host "  2. Entity Framework relationships" -ForegroundColor White  
Write-Host "  3. Authentication/Authorization" -ForegroundColor White