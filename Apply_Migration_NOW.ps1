# ===================================================================
# ????? Migration ????? ?? Connection String ??????
# ===================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "????? Migration ??? ????? ????????..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Connection String ??????
$serverName = "10.0.0.17"
$databaseName = "Assets"
$username = "sa"
$password = "Dur@123456"

$connectionString = "Server=$serverName;Database=$databaseName;User Id=$username;Password=$password;TrustServerCertificate=True;Encrypt=True;"

Write-Host "?? ??????? ??: $serverName\$databaseName" -ForegroundColor Yellow
Write-Host "?? ????????: $username" -ForegroundColor Yellow
Write-Host ""

try {
    # ????? ???????
    $connection = New-Object System.Data.SqlClient.SqlConnection
    $connection.ConnectionString = $connectionString
    $connection.Open()
    
    Write-Host "? ?? ??????? ?????? ???????? ?????" -ForegroundColor Green
    Write-Host ""
    
    # ==============================================
    # ?????? 1: ??? ???????? ???????
    # ==============================================
    Write-Host "?????? 1: ??? ?????? ????????..." -ForegroundColor Yellow
    
    $deleteSql = @"
    DELETE FROM AssetMaintenances;
    DELETE FROM AssetMovements;
    DELETE FROM AssetDisposals;
"@
    
    $cmd = $connection.CreateCommand()
    $cmd.CommandText = $deleteSql
    $rowsAffected = $cmd.ExecuteNonQuery()
    Write-Host "? ?? ??? ???????? ???????" -ForegroundColor Green
    Write-Host ""
    
    # ==============================================
    # ?????? 2: ??? ???????? ???????
    # ==============================================
    Write-Host "?????? 2: ??? ???????? ???????..." -ForegroundColor Yellow
    
    $dropFKs = @"
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_AssetDisposals_Users_PerformedBy')
        ALTER TABLE [AssetDisposals] DROP CONSTRAINT [FK_AssetDisposals_Users_PerformedBy];
    
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_AssetMaintenances_Users_CreatedBy')
        ALTER TABLE [AssetMaintenances] DROP CONSTRAINT [FK_AssetMaintenances_Users_CreatedBy];
    
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_AssetMovements_Users_PerformedBy')
        ALTER TABLE [AssetMovements] DROP CONSTRAINT [FK_AssetMovements_Users_PerformedBy];
"@
    
    $cmd.CommandText = $dropFKs
    $cmd.ExecuteNonQuery() | Out-Null
    Write-Host "? ?? ??? ???????? ???????" -ForegroundColor Green
    Write-Host ""
    
    # ==============================================
    # ?????? 3: ????? ???????? ???????
    # ==============================================
    Write-Host "?????? 3: ????? ???????? ??????? ?? SecurityUsers..." -ForegroundColor Yellow
    
    $addFKs = @"
    ALTER TABLE [AssetDisposals]
    ADD CONSTRAINT [FK_AssetDisposals_SecurityUsers_PerformedBy]
    FOREIGN KEY ([PerformedBy]) REFERENCES [SecurityUsers] ([Id]);
    
    ALTER TABLE [AssetMaintenances]
    ADD CONSTRAINT [FK_AssetMaintenances_SecurityUsers_CreatedBy]
    FOREIGN KEY ([CreatedBy]) REFERENCES [SecurityUsers] ([Id]);
    
    ALTER TABLE [AssetMovements]
    ADD CONSTRAINT [FK_AssetMovements_SecurityUsers_PerformedBy]
    FOREIGN KEY ([PerformedBy]) REFERENCES [SecurityUsers] ([Id]);
"@
    
    $cmd.CommandText = $addFKs
    $cmd.ExecuteNonQuery() | Out-Null
    Write-Host "? ?? ????? ???????? ???????" -ForegroundColor Green
    Write-Host ""
    
    # ==============================================
    # ?????? 4: ????? __EFMigrationsHistory
    # ==============================================
    Write-Host "?????? 4: ????? ???? Migrations..." -ForegroundColor Yellow
    
    $updateHistory = @"
    IF NOT EXISTS (SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20260415064522_UpdateForeignKeysToSecurityUsers')
    BEGIN
        INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
        VALUES ('20260415064522_UpdateForeignKeysToSecurityUsers', '9.0.0');
    END
"@
    
    $cmd.CommandText = $updateHistory
    $cmd.ExecuteNonQuery() | Out-Null
    Write-Host "? ?? ????? __EFMigrationsHistory" -ForegroundColor Green
    Write-Host ""
    
    # ==============================================
    # ?????? ?? ???????
    # ==============================================
    Write-Host "?????? ?? ???????..." -ForegroundColor Yellow
    
    $verifySql = @"
    SELECT 
        name AS ConstraintName,
        OBJECT_NAME(parent_object_id) AS TableName
    FROM sys.foreign_keys
    WHERE name IN (
        'FK_AssetDisposals_SecurityUsers_PerformedBy',
        'FK_AssetMaintenances_SecurityUsers_CreatedBy',
        'FK_AssetMovements_SecurityUsers_PerformedBy'
    );
"@
    
    $cmd.CommandText = $verifySql
    $reader = $cmd.ExecuteReader()
    
    Write-Host ""
    Write-Host "???????? ???????:" -ForegroundColor Cyan
    while ($reader.Read()) {
        Write-Host "  ? $($reader['ConstraintName']) ??? ???? $($reader['TableName'])" -ForegroundColor Green
    }
    $reader.Close()
    
    $connection.Close()
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "?????? ?? ?????! ??????" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "? Migration ????? ?????!" -ForegroundColor Green
    Write-Host "? ?????? ???? ?????? SecurityUsers" -ForegroundColor Green
    Write-Host ""
    Write-Host "??????? ???????:" -ForegroundColor Yellow
    Write-Host "1. ??? ????? ??????? (F5)" -ForegroundColor White
    Write-Host "2. ????? ????? ??? ????? ????" -ForegroundColor White
    Write-Host "3. ???? ?? ??? ???? NullReferenceException" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "? ??? ????? Migration" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "?????: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Stack Trace:" -ForegroundColor Yellow
    Write-Host $_.Exception.StackTrace -ForegroundColor Gray
    Write-Host ""
    
    if ($connection -and $connection.State -eq 'Open') {
        $connection.Close()
    }
    
    exit 1
}
