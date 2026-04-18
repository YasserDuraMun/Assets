# =====================================================
# PowerShell Script ???? ????? ?????? Assets ??? AssetTest
# =====================================================

Write-Host "?? Starting Assets Database Copy Process..." -ForegroundColor Green
Write-Host "Source Database: Assets" -ForegroundColor Yellow
Write-Host "Target Database: AssetTest" -ForegroundColor Yellow
Write-Host "Server: 10.0.0.17" -ForegroundColor Yellow
Write-Host ""

# ??????? ???????
$ServerInstance = "10.0.0.17"
$Username = "sa"
$Password = "Dur@123456"

# ???? ??? SQL
$SqlScriptPath = Join-Path $PSScriptRoot "Database_Copy_Assets_To_AssetTest.sql"

# ?????? ?? ???? ??? SQL
if (-not (Test-Path $SqlScriptPath)) {
    Write-Error "? SQL script file not found: $SqlScriptPath"
    Write-Host "Please ensure Database_Copy_Assets_To_AssetTest.sql is in the same directory."
    pause
    exit 1
}

Write-Host "?? SQL Script Found: $SqlScriptPath" -ForegroundColor Green

# ?????? ?? ???? sqlcmd
try {
    $null = Get-Command sqlcmd -ErrorAction Stop
    Write-Host "? sqlcmd found and ready" -ForegroundColor Green
} catch {
    Write-Error "? sqlcmd not found. Please install SQL Server command line tools."
    Write-Host "Download from: https://docs.microsoft.com/en-us/sql/tools/sqlcmd-utility"
    pause
    exit 1
}

Write-Host ""
Write-Host "??  WARNING: This operation will:" -ForegroundColor Red
Write-Host "   1. Drop AssetTest database if it exists" -ForegroundColor Yellow
Write-Host "   2. Create a backup of Assets database" -ForegroundColor Yellow
Write-Host "   3. Restore the backup as AssetTest database" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Do you want to continue? (y/N)"
if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
    Write-Host "? Operation cancelled by user." -ForegroundColor Yellow
    pause
    exit 0
}

Write-Host ""
Write-Host "?? Executing database copy operation..." -ForegroundColor Cyan
Write-Host "This may take several minutes depending on database size..." -ForegroundColor Gray
Write-Host ""

# ????? SQL Script
try {
    Write-Host "?? Connecting to SQL Server..." -ForegroundColor Cyan
    
    # ???? connection string
    $ConnectionString = "Server=$ServerInstance;User Id=$Username;Password=$Password;TrustServerCertificate=True;Connection Timeout=300;"
    
    # ????? ??? script
    Write-Host "? Executing SQL script..." -ForegroundColor Cyan
    
    $result = sqlcmd -S $ServerInstance -U $Username -P $Password -i $SqlScriptPath -t 600 -C
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "? Database copy completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "?? Summary:" -ForegroundColor Cyan
        Write-Host "   ? Source: Assets database" -ForegroundColor Green
        Write-Host "   ? Target: AssetTest database" -ForegroundColor Green
        Write-Host "   ? Server: $ServerInstance" -ForegroundColor Green
        Write-Host ""
        Write-Host "?? Test Connection String:" -ForegroundColor Cyan
        Write-Host "Data Source=10.0.0.17;Initial Catalog=AssetTest;User ID=sa;Password=Dur@123456;Connect Timeout=30;Encrypt=True;Trust Server Certificate=True;Application Intent=ReadWrite;Multi Subnet Failover=False" -ForegroundColor Gray
        Write-Host ""
        
        # ??? ???????
        Write-Host "?? SQL Output:" -ForegroundColor Cyan
        Write-Host $result -ForegroundColor Gray
        
    } else {
        Write-Host ""
        Write-Error "? Database copy failed!"
        Write-Host "SQL Output:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        Write-Host ""
        Write-Host "?? Common Issues:" -ForegroundColor Yellow
        Write-Host "   • Check if Assets database exists and is accessible" -ForegroundColor Gray
        Write-Host "   • Verify SQL Server credentials" -ForegroundColor Gray
        Write-Host "   • Ensure sufficient disk space" -ForegroundColor Gray
        Write-Host "   • Check SQL Server permissions" -ForegroundColor Gray
    }
} catch {
    Write-Error "? Unexpected error during database copy:"
    Write-Error $_.Exception.Message
    Write-Host ""
    Write-Host "?? Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   • Verify server connection: $ServerInstance" -ForegroundColor Gray
    Write-Host "   • Check username/password: $Username" -ForegroundColor Gray
    Write-Host "   • Ensure SQL Server is running" -ForegroundColor Gray
    Write-Host "   • Check firewall settings" -ForegroundColor Gray
}

Write-Host ""
Write-Host "?? Next Steps (if successful):" -ForegroundColor Cyan
Write-Host "   1. Update appsettings.json to use TestConnection" -ForegroundColor Gray
Write-Host "   2. Test your application with AssetTest database" -ForegroundColor Gray
Write-Host "   3. Run any additional test data setup" -ForegroundColor Gray
Write-Host "   4. Verify all features work correctly" -ForegroundColor Gray
Write-Host ""

# ????? ??? configuration ????????
$configNotes = @"
# =====================================================
# ?? ????? ????? ?????? AssetTest ?????
# =====================================================

## ??????? ????? ???????? ???????:
- ??? ????? ????????: AssetTest  
- ??????: 10.0.0.17
- ????????: sa

## Connection String ????????:
TestConnection: "Data Source=10.0.0.17;Initial Catalog=AssetTest;User ID=sa;Password=Dur@123456;Connect Timeout=30;Encrypt=True;Trust Server Certificate=True;Application Intent=ReadWrite;Multi Subnet Failover=False"

## ???????? ????? ???????? ????????:
1. ???? appsettings.json
2. ???? DefaultConnection ??? TestConnection
3. ??? ????? ???????

## ????? ???????: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

## ???????:
- ??? ???? ????? ?? ????? ???????? ???????
- ????? ??? ???? ???????? ???????????
- ???? ????????? ???????? ?????
- ?? ???? ??? ????? ???????? ???????
"@

$configFile = Join-Path $PSScriptRoot "AssetTest_Database_Info.txt"
$configNotes | Out-File -FilePath $configFile -Encoding UTF8

Write-Host "?? Configuration notes saved: AssetTest_Database_Info.txt" -ForegroundColor Green

Write-Host ""
pause