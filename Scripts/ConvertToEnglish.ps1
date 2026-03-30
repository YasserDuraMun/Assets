# Convert Database to English Script
Write-Host "?? Converting Database Data to English..." -ForegroundColor Yellow

$scriptPath = "Scripts\ConvertDatabaseToEnglish.sql"

if (Test-Path $scriptPath) {
    Write-Host "?? Found conversion script: $scriptPath" -ForegroundColor Green
    
    # Check if SQL Server is available
    try {
        # Try to connect to SQL Server
        $connectionTest = sqlcmd -S "(localdb)\MSSQLLocalDB" -d "Assets" -Q "SELECT 1" -h -1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "? SQL Server connection successful" -ForegroundColor Green
            
            Write-Host "?? Executing conversion script..." -ForegroundColor Cyan
            
            # Execute the conversion script
            sqlcmd -S "(localdb)\MSSQLLocalDB" -d "Assets" -i $scriptPath
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "? Database conversion completed successfully!" -ForegroundColor Green
                Write-Host ""
                Write-Host "?? Your reports should now display in English" -ForegroundColor Green
                Write-Host "?? Please restart your backend server:" -ForegroundColor Yellow
                Write-Host "   1. Stop backend (Ctrl+C)" -ForegroundColor White
                Write-Host "   2. Run: dotnet run" -ForegroundColor White
                Write-Host "   3. Test reports: http://localhost:5173/reports" -ForegroundColor White
            } else {
                Write-Host "? Conversion script failed" -ForegroundColor Red
            }
        } else {
            Write-Host "? Cannot connect to SQL Server" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "? SQL Server connection failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "?? Alternative options:" -ForegroundColor Yellow
        Write-Host "   1. Open SQL Server Management Studio" -ForegroundColor White
        Write-Host "   2. Connect to your database" -ForegroundColor White
        Write-Host "   3. Open and execute: $scriptPath" -ForegroundColor White
    }
} else {
    Write-Host "? Conversion script not found: $scriptPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "?? Next steps after conversion:" -ForegroundColor Green
Write-Host "   • Restart backend server" -ForegroundColor White
Write-Host "   • Test reports page" -ForegroundColor White
Write-Host "   • Verify English text in categories and statuses" -ForegroundColor White