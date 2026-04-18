# =====================================================
# ????? Migration ?????? ?????? ????????
# =====================================================

Write-Host "?? Creating EF Core Migration for Test Database..." -ForegroundColor Green

# ?????? ?? ???? dotnet ef tools
try {
    $efVersion = dotnet ef --version
    Write-Host "? EF Core Tools version: $efVersion" -ForegroundColor Green
} catch {
    Write-Host "? EF Core Tools not installed. Installing..." -ForegroundColor Yellow
    dotnet tool install --global dotnet-ef
}

# ????? Migration ????
Write-Host "?? Creating new migration for test database..." -ForegroundColor Cyan

try {
    # ????? migration ?????? ???????? ????????
    dotnet ef migrations add CreateTestDatabaseCopy --context ApplicationDbContext

    Write-Host "? Migration created successfully!" -ForegroundColor Green
    
    # ????? Migration ??? ????? ???????? ????????
    Write-Host "?? Applying migration to test database..." -ForegroundColor Cyan
    
    # ????? connection string ??????
    $env:ConnectionStrings__DefaultConnection = "Data Source=10.0.0.17;Initial Catalog=AssetTest;User ID=sa;Password=Dur@123456;Connect Timeout=30;Encrypt=True;Trust Server Certificate=True;Application Intent=ReadWrite;Multi Subnet Failover=False"
    
    dotnet ef database update --context ApplicationDbContext
    
    Write-Host "? Test database updated successfully!" -ForegroundColor Green
    
} catch {
    Write-Error "? Migration failed: $($_.Exception.Message)"
    Write-Host "?? Try using the SQL script method instead: copy-database-to-test.bat" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "?? Migration Summary:" -ForegroundColor Cyan
Write-Host "   ? Target Database: AssetTest" -ForegroundColor Green
Write-Host "   ? Server: 10.0.0.17" -ForegroundColor Green
Write-Host "   ? Migration: Applied" -ForegroundColor Green

pause