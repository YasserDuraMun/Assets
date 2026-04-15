# Apply Migration with Data Cleanup
# This script applies the migration to update foreign keys to SecurityUsers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "????? Migration ?? ????? ????????..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$serverName = "10.0.0.17"
$databaseName = "Assets"
$username = "AssetUser"
$password = "123"

$sqlScriptPath = Join-Path $PSScriptRoot "Apply_Migration_With_Data_Cleanup.sql"

if (-not (Test-Path $sqlScriptPath)) {
    Write-Host "? ?? ??? ?????? ??? ??? SQL: $sqlScriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "?? ????? ???????? ??: $sqlScriptPath" -ForegroundColor Yellow
$sqlScript = Get-Content $sqlScriptPath -Raw

Write-Host "?? ??????? ?????? ????????: $serverName\$databaseName" -ForegroundColor Yellow
Write-Host ""

try {
    # ????? ???????
    $connectionString = "Server=$serverName;Database=$databaseName;User Id=$username;Password=$password;TrustServerCertificate=True;"
    $connection = New-Object System.Data.SqlClient.SqlConnection
    $connection.ConnectionString = $connectionString
    $connection.Open()
    
    Write-Host "? ?? ??????? ?????? ???????? ?????" -ForegroundColor Green
    Write-Host ""
    Write-Host "? ????? ????????..." -ForegroundColor Yellow
    Write-Host ""
    
    # ????? ???????? ??? GO
    $batches = $sqlScript -split '\bGO\b'
    
    $batchNumber = 1
    foreach ($batch in $batches) {
        $batch = $batch.Trim()
        if ($batch -ne "") {
            Write-Host "????? Batch $batchNumber..." -ForegroundColor Gray
            
            $command = $connection.CreateCommand()
            $command.CommandText = $batch
            $command.CommandTimeout = 300 # 5 minutes
            
            # ????? ?????? ???????
            $reader = $command.ExecuteReader()
            
            # ????? ???????
            while ($reader.Read()) {
                for ($i = 0; $i -lt $reader.FieldCount; $i++) {
                    Write-Host "$($reader.GetName($i)): $($reader.GetValue($i))" -ForegroundColor Cyan
                }
                Write-Host ""
            }
            
            $reader.Close()
            $batchNumber++
        }
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "?? ????? ??????? ?????!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "??????? ???????:" -ForegroundColor Yellow
    Write-Host "1. ??? ????? ???????" -ForegroundColor White
    Write-Host "2. ????? ????? ??? ????? ????" -ForegroundColor White
    Write-Host "3. ???? ?? ?? ?????? ???? ???? ????" -ForegroundColor White
    Write-Host ""
    
    $connection.Close()
    
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "? ??? ????? Migration" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "?????: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    
    if ($connection.State -eq 'Open') {
        $connection.Close()
    }
    
    exit 1
}

Write-Host "? ?? ????? ??????? ?????" -ForegroundColor Green
