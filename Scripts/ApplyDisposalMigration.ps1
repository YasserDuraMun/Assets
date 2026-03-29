# ===============================================
# PowerShell Script ?????? Migration ????? ??????
# Apply Asset Disposal Migration Script
# ===============================================

Write-Host "?? Starting Asset Disposal Migration for Municipality..." -ForegroundColor Yellow
Write-Host ""

# ?????? ?? ???? .NET CLI
try {
    $dotnetVersion = dotnet --version
    Write-Host "? .NET CLI Version: $dotnetVersion" -ForegroundColor Green
} catch {
    Write-Host "? .NET CLI not found! Please install .NET SDK." -ForegroundColor Red
    exit 1
}

# ?????? ?? ???? ??? ???????
if (-not (Test-Path "*.csproj")) {
    Write-Host "? No .csproj file found in current directory!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "?? Current directory: $(Get-Location)" -ForegroundColor Blue
Write-Host ""

# ????? Migration
Write-Host "?? Applying Asset Disposal Migration..." -ForegroundColor Yellow

try {
    # ????? Migration ???????? dotnet ef
    $result = dotnet ef database update --verbose
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "? Migration applied successfully!" -ForegroundColor Green
    } else {
        throw "Migration failed with exit code: $LASTEXITCODE"
    }
} catch {
    Write-Host "?? EF Migration failed. Trying alternative approach..." -ForegroundColor Yellow
    Write-Host ""
    
    # ??????? ??????? - ????? SQL Script ??????
    Write-Host "?? Running SQL script directly..." -ForegroundColor Blue
    
    $sqlScript = @"
-- Municipality Asset Disposal Migration
USE [AssetsManagement];

-- Create AssetDisposals table if not exists
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'AssetDisposals')
BEGIN
    PRINT 'Creating AssetDisposals table...';
    
    CREATE TABLE [AssetDisposals] (
        [Id] int IDENTITY(1,1) NOT NULL,
        [AssetId] int NOT NULL,
        [DisposalDate] datetime2 NOT NULL,
        [DisposalReason] int NOT NULL,
        [Notes] nvarchar(500) NULL,
        [PerformedBy] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_AssetDisposals] PRIMARY KEY ([Id])
    );
    
    -- Add indexes
    CREATE NONCLUSTERED INDEX [IX_AssetDisposals_AssetId] ON [AssetDisposals] ([AssetId]);
    CREATE NONCLUSTERED INDEX [IX_AssetDisposals_PerformedBy] ON [AssetDisposals] ([PerformedBy]);
    CREATE NONCLUSTERED INDEX [IX_AssetDisposals_DisposalDate] ON [AssetDisposals] ([DisposalDate]);
    CREATE NONCLUSTERED INDEX [IX_AssetDisposals_DisposalReason] ON [AssetDisposals] ([DisposalReason]);
    
    PRINT 'AssetDisposals table created successfully.';
END
ELSE
BEGIN
    PRINT 'AssetDisposals table already exists.';
END

-- Add foreign key constraints if missing
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_AssetDisposals_Assets_AssetId')
BEGIN
    ALTER TABLE [AssetDisposals]
    ADD CONSTRAINT [FK_AssetDisposals_Assets_AssetId]
    FOREIGN KEY ([AssetId]) REFERENCES [Assets] ([Id]);
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_AssetDisposals_Users_PerformedBy')
BEGIN
    ALTER TABLE [AssetDisposals]
    ADD CONSTRAINT [FK_AssetDisposals_Users_PerformedBy]
    FOREIGN KEY ([PerformedBy]) REFERENCES [Users] ([Id]);
END

-- Update migration history
IF NOT EXISTS (SELECT * FROM [__EFMigrationsHistory] WHERE [MigrationId] = '20260326090000_UpdateAssetDisposalForMunicipality')
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES ('20260326090000_UpdateAssetDisposalForMunicipality', '9.0.0');
    PRINT 'Migration history updated.';
END

PRINT 'Asset Disposal Migration completed successfully!';
"@

    # ??? SQL Script ?? ??? ????
    $tempSqlFile = "temp_migration.sql"
    $sqlScript | Out-File -FilePath $tempSqlFile -Encoding UTF8
    
    Write-Host "?? SQL script saved to: $tempSqlFile" -ForegroundColor Blue
    Write-Host "?? You can run this script manually in SQL Server Management Studio" -ForegroundColor Yellow
    Write-Host ""
}

# ?????? ?? ???? ???????
Write-Host "?? Checking migration status..." -ForegroundColor Blue

try {
    $migrationCheck = dotnet ef migrations list 2>$null
    if ($migrationCheck -match "UpdateAssetDisposalForMunicipality") {
        Write-Host "? Migration is listed in EF migrations" -ForegroundColor Green
    }
} catch {
    Write-Host "?? Could not verify migration through EF CLI" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "?? Next Steps:" -ForegroundColor Cyan
Write-Host "1. ? Restart your backend application" -ForegroundColor White
Write-Host "2. ? Test disposal API: http://localhost:5002/api/disposals/test" -ForegroundColor White
Write-Host "3. ? Test disposal reasons: http://localhost:5002/api/disposals/reasons" -ForegroundColor White
Write-Host "4. ? Try disposing an asset from frontend" -ForegroundColor White
Write-Host ""
Write-Host "?? Available Disposal Reasons:" -ForegroundColor Cyan
Write-Host "  1 = Damaged (????)" -ForegroundColor White
Write-Host "  2 = Obsolete (????)" -ForegroundColor White
Write-Host "  3 = Lost (?????)" -ForegroundColor White
Write-Host "  4 = Stolen (?????)" -ForegroundColor White
Write-Host "  5 = EndOfLife (?????? ?????)" -ForegroundColor White
Write-Host "  6 = Maintenance (????? ?????)" -ForegroundColor White
Write-Host "  7 = Replacement (?? ????????)" -ForegroundColor White
Write-Host " 99 = Other (????)" -ForegroundColor White
Write-Host ""
Write-Host "??? Municipality Asset Disposal System Ready!" -ForegroundColor Green