#!/usr/bin/env pwsh

# Apply Remove Capacity Migration
# ????? ???????? ??? ????? ?? ??????????

param(
    [string]$ConnectionString = "",
    [switch]$UseEFCore = $false,
    [switch]$UseSQLScript = $true,
    [switch]$CheckOnly = $false
)

Write-Host "?? ????? ???????? ??? ????? ?? ??????????" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Get connection string from appsettings.json if not provided
if ([string]::IsNullOrWhiteSpace($ConnectionString)) {
    Write-Host "?? ????? connection string ?? appsettings.json..." -ForegroundColor Yellow
    
    try {
        if (Test-Path "appsettings.json") {
            $appsettings = Get-Content "appsettings.json" | ConvertFrom-Json
            $ConnectionString = $appsettings.ConnectionStrings.DefaultConnection
            Write-Host "? ?? ?????? ??? connection string" -ForegroundColor Green
        } else {
            Write-Host "? ??? appsettings.json ??? ?????" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "? ??? ?? ????? appsettings.json: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

if ($CheckOnly) {
    Write-Host "`n?? ??? ???? ???? ?????..." -ForegroundColor Yellow
    
    $checkQuery = @"
SELECT 
    CASE WHEN EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'Warehouses' 
        AND COLUMN_NAME = 'Capacity'
    ) THEN 'EXISTS' ELSE 'NOT_EXISTS' END AS CapacityColumnStatus
"@
    
    try {
        $result = Invoke-Sqlcmd -ConnectionString $ConnectionString -Query $checkQuery -ErrorAction Stop
        
        if ($result.CapacityColumnStatus -eq "EXISTS") {
            Write-Host "?? ???? ????? ????? - ????? ?????" -ForegroundColor Yellow
        } else {
            Write-Host "? ???? ????? ??? ????? - ?????????? ???? ??????" -ForegroundColor Green
        }
    } catch {
        Write-Host "? ??? ?? ??? ????? ????????: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
    
    exit 0
}

if ($UseEFCore) {
    Write-Host "`n1?? ????? Migration ???????? EF Core..." -ForegroundColor Yellow
    
    try {
        # Check if migration exists
        $migrationExists = dotnet ef migrations list | Select-String "RemoveCapacityFromWarehouse"
        
        if (-not $migrationExists) {
            Write-Host "?? ????? Migration ????..." -ForegroundColor Cyan
            dotnet ef migrations add RemoveCapacityFromWarehouse -o Migrations
            
            if ($LASTEXITCODE -ne 0) {
                Write-Host "? ??? ?? ????? Migration" -ForegroundColor Red
                exit 1
            }
        }
        
        Write-Host "?? ????? Migration..." -ForegroundColor Cyan
        dotnet ef database update
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "? ?? ????? Migration ?????" -ForegroundColor Green
        } else {
            Write-Host "? ??? ????? Migration" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "? ??? ?? EF Core: $($_.Exception.Message)" -ForegroundColor Red
        
        # Fallback to SQL Script
        Write-Host "?? ?????? ??????? SQL Script..." -ForegroundColor Yellow
        $UseSQLScript = $true
    }
}

if ($UseSQLScript) {
    Write-Host "`n2?? ????? Migration ???????? SQL Script..." -ForegroundColor Yellow
    
    $sqlScriptPath = "Scripts\RemoveCapacityFromWarehouses.sql"
    
    if (-not (Test-Path $sqlScriptPath)) {
        Write-Host "? ??? SQL Script ??? ?????: $sqlScriptPath" -ForegroundColor Red
        exit 1
    }
    
    try {
        Write-Host "?? ????? SQL Script..." -ForegroundColor Cyan
        
        # Read and execute SQL script
        $sqlScript = Get-Content $sqlScriptPath -Raw
        
        # Replace database name placeholder if needed
        if ($sqlScript -match "USE \[AssetsDb\]") {
            # Extract database name from connection string
            if ($ConnectionString -match "Database=([^;]+)" -or $ConnectionString -match "Initial Catalog=([^;]+)") {
                $dbName = $matches[1]
                $sqlScript = $sqlScript -replace "USE \[AssetsDb\]", "USE [$dbName]"
                Write-Host "??? ??????? ????? ????????: $dbName" -ForegroundColor Cyan
            }
        }
        
        Invoke-Sqlcmd -ConnectionString $ConnectionString -Query $sqlScript -ErrorAction Stop
        
        Write-Host "? ?? ????? SQL Script ?????" -ForegroundColor Green
        
    } catch {
        Write-Host "? ??? ?? ????? SQL Script: $($_.Exception.Message)" -ForegroundColor Red
        
        # Try alternative method using sqlcmd
        Write-Host "?? ?????? ??????? sqlcmd..." -ForegroundColor Yellow
        
        try {
            # Extract server and database from connection string
            if ($ConnectionString -match "Server=([^;]+)") { $server = $matches[1] }
            if ($ConnectionString -match "Database=([^;]+)" -or $ConnectionString -match "Initial Catalog=([^;]+)") { $database = $matches[1] }
            
            if ($server -and $database) {
                $tempSqlFile = [System.IO.Path]::GetTempFileName() + ".sql"
                $sqlScript | Out-File -FilePath $tempSqlFile -Encoding UTF8
                
                if ($ConnectionString -match "Integrated Security=true|Trusted_Connection=true") {
                    sqlcmd -S $server -d $database -E -i $tempSqlFile
                } else {
                    Write-Host "?? ????? Windows Authentication ?? ????? ????????? ?? connection string" -ForegroundColor Yellow
                }
                
                Remove-Item $tempSqlFile -ErrorAction SilentlyContinue
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "? ?? ??????? ????? ???????? sqlcmd" -ForegroundColor Green
                } else {
                    Write-Host "? ??? ??????? ???????? sqlcmd" -ForegroundColor Red
                }
            }
        } catch {
            Write-Host "? ??? ?? sqlcmd: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Final verification
Write-Host "`n3?? ?????? ?? ????? ???????..." -ForegroundColor Yellow

try {
    $verificationQuery = @"
SELECT 
    CASE WHEN EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'Warehouses' 
        AND COLUMN_NAME = 'Capacity'
    ) THEN 'STILL_EXISTS' ELSE 'REMOVED' END AS CapacityStatus,
    CASE WHEN EXISTS (
        SELECT * FROM __EFMigrationsHistory 
        WHERE MigrationId = '20260327100000_RemoveCapacityFromWarehouse'
    ) THEN 'RECORDED' ELSE 'NOT_RECORDED' END AS MigrationStatus
"@
    
    $result = Invoke-Sqlcmd -ConnectionString $ConnectionString -Query $verificationQuery -ErrorAction Stop
    
    Write-Host "`n?? ????? ??????:" -ForegroundColor Cyan
    Write-Host "   ???? ?????: $($result.CapacityStatus)" -ForegroundColor $(if ($result.CapacityStatus -eq 'REMOVED') { 'Green' } else { 'Red' })
    Write-Host "   ??? Migration: $($result.MigrationStatus)" -ForegroundColor $(if ($result.MigrationStatus -eq 'RECORDED') { 'Green' } else { 'Yellow' })
    
    if ($result.CapacityStatus -eq 'REMOVED') {
        Write-Host "`n?? ?? ??? ???? ????? ?????!" -ForegroundColor Green
        Write-Host "? ?????????? ????? ???? ??? ?????" -ForegroundColor Green
        
        # Show current warehouse structure
        $structureQuery = "SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Warehouses' ORDER BY ORDINAL_POSITION"
        $structure = Invoke-Sqlcmd -ConnectionString $ConnectionString -Query $structureQuery
        
        Write-Host "`n?? ???? ???? ?????????? ??????:" -ForegroundColor Cyan
        foreach ($column in $structure) {
            Write-Host "   • $($column.COLUMN_NAME) ($($column.DATA_TYPE)) - Nullable: $($column.IS_NULLABLE)" -ForegroundColor White
        }
    } else {
        Write-Host "`n?? ???? ????? ?? ???? ????? - ?? ????? ?????? ????" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "? ??? ?? ??????: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n? ????? ????? Migration" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Usage examples
Write-Host "`n?? ????? ?????????:" -ForegroundColor Yellow
Write-Host "   # ??? ???:" -ForegroundColor Cyan
Write-Host "   .\Scripts\ApplyRemoveCapacityMigration.ps1 -CheckOnly" -ForegroundColor White
Write-Host "   # ????? ???????? EF Core:" -ForegroundColor Cyan
Write-Host "   .\Scripts\ApplyRemoveCapacityMigration.ps1 -UseEFCore" -ForegroundColor White
Write-Host "   # ????? ???????? SQL Script:" -ForegroundColor Cyan
Write-Host "   .\Scripts\ApplyRemoveCapacityMigration.ps1 -UseSQLScript" -ForegroundColor White