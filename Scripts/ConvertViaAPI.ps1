# Convert Database to English via API
Write-Host "?? Converting Database to English via Backend API..." -ForegroundColor Yellow

$baseUrl = "http://localhost:5002/api/data-conversion"

Write-Host "?? Calling conversion endpoint..." -ForegroundColor Cyan
Write-Host "URL: $baseUrl/convert-to-english" -ForegroundColor Gray

try {
    # Call the conversion endpoint
    $response = Invoke-RestMethod -Uri "$baseUrl/convert-to-english" -Method POST -TimeoutSec 30
    
    if ($response.success) {
        Write-Host "? DATABASE CONVERSION SUCCESSFUL!" -ForegroundColor Green
        Write-Host ""
        Write-Host "?? Conversion Results:" -ForegroundColor Cyan
        Write-Host "   • Total conversions: $($response.data.conversionsCount)" -ForegroundColor White
        Write-Host "   • Database changes: $($response.data.totalChanges)" -ForegroundColor White
        Write-Host "   • Message: $($response.data.message)" -ForegroundColor White
        
        if ($response.data.conversions -and $response.data.conversions.Count -gt 0) {
            Write-Host ""
            Write-Host "?? Sample Conversions:" -ForegroundColor Yellow
            foreach ($conversion in $response.data.conversions) {
                Write-Host "   $conversion" -ForegroundColor Gray
            }
        }
        
        Write-Host ""
        Write-Host "?? NEXT STEPS:" -ForegroundColor Green
        Write-Host "   1. ? Database converted to English" -ForegroundColor White
        Write-Host "   2. ?? Refresh your reports page" -ForegroundColor White
        Write-Host "   3. ?? Check: http://localhost:5173/reports" -ForegroundColor White
        Write-Host ""
        Write-Host "?? Reports should now display in English!" -ForegroundColor Green
        
    } else {
        Write-Host "? CONVERSION FAILED" -ForegroundColor Red
        Write-Host "   Error: $($response.message)" -ForegroundColor Red
    }
}
catch {
    Write-Host "? API CALL FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response.StatusCode.value__) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   Status Code: $statusCode" -ForegroundColor Red
        
        if ($statusCode -eq 404) {
            Write-Host ""
            Write-Host "?? The conversion endpoint is not available." -ForegroundColor Yellow
            Write-Host "   Make sure your backend server is running:" -ForegroundColor White
            Write-Host "   • dotnet run" -ForegroundColor Gray
            Write-Host "   • Wait for startup" -ForegroundColor Gray
            Write-Host "   • Try again" -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "?? Manual Alternative:" -ForegroundColor Yellow
Write-Host "   If API method doesn't work, you can:" -ForegroundColor White
Write-Host "   1. Open SQL Server Management Studio" -ForegroundColor Gray
Write-Host "   2. Connect to your database" -ForegroundColor Gray
Write-Host "   3. Run: Scripts\ConvertDatabaseToEnglish.sql" -ForegroundColor Gray