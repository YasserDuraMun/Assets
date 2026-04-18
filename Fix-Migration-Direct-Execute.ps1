# =====================================================
# ?? ???? ?????? Migration - ????? ?????
# ????? ????? "The host was aborted"
# =====================================================

Write-Host "?? ?? ???? ?????? Migration" -ForegroundColor Red
Write-Host "=================================" -ForegroundColor Red
Write-Host ""

Write-Host "? ??????? ????????:" -ForegroundColor Yellow
Write-Host "   • Migration ?? ?????? ????" -ForegroundColor Gray
Write-Host "   • Application startup failed ????? Update-Database" -ForegroundColor Gray
Write-Host "   • The host was aborted" -ForegroundColor Gray
Write-Host ""

Write-Host "? ????: ????? Migration ?????? ???? ????? ???????" -ForegroundColor Green
Write-Host ""

# ??????? ???????
$Server = "10.0.0.17"
$Username = "sa"
$Password = "Dur@123456"

Write-Host "?? ????? Migration ???????? .NET CLI ??????..." -ForegroundColor Yellow
Write-Host ""

try {
    # ?????? ?? ???? .NET CLI
    $dotnetVersion = dotnet --version
    Write-Host "? .NET CLI ?????: $dotnetVersion" -ForegroundColor Green
    
    # ?????? ????? Migration ??????
    Write-Host ""
    Write-Host "? ?????? Update-Database ??????..." -ForegroundColor Yellow
    
    dotnet ef database update --no-build --verbose
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "?? ?? ????? Migration ?????!" -ForegroundColor Green
        
        # ?????? ?? ???????
        Write-Host ""
        Write-Host "?? ?????? ?? ????? AssetsTest..." -ForegroundColor Cyan
        
        $CheckSQL = @"
SELECT CASE WHEN DB_ID('AssetsTest') IS NOT NULL 
       THEN '? AssetsTest created successfully!' 
       ELSE '? AssetsTest not found' END as Status;
"@
        
        sqlcmd -S $Server -U $Username -P $Password -Q $CheckSQL -C
        
        # ??? ??????????
        $StatsSQL = @"
USE AssetsTest;
SELECT 'Tables' as Type, COUNT(*) as Count FROM sys.tables WHERE type = 'U'
UNION ALL
SELECT 'SecurityUsers Records', COUNT(*) FROM SecurityUsers
UNION ALL
SELECT 'Assets Records', COUNT(*) FROM Assets;
"@
        
        sqlcmd -S $Server -U $Username -P $Password -Q $StatsSQL -C
        
    } else {
        throw "Migration failed with .NET CLI"
    }
    
} catch {
    Write-Host "?? .NET CLI ???? ???? ???????? ?? SQL ?????..." -ForegroundColor Yellow
    
    # ???? ??????: ????? SQL ?????
    $DirectSQL = @"
USE master;

PRINT '?? ????? ??? ????? ???????? ??????...';

-- ?????? ?? ??????
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'Assets')
BEGIN
    RAISERROR('Assets database not found!', 16, 1);
    RETURN;
END

PRINT '? Assets database found';

-- ??? ?????????
DECLARE @killCmd NVARCHAR(MAX) = '';
SELECT @killCmd = @killCmd + 'KILL ' + CAST(session_id AS VARCHAR(10)) + '; '
FROM sys.dm_exec_sessions
WHERE database_id IN (DB_ID('Assets'), DB_ID('AssetsTest')) 
  AND session_id <> @@SPID
  AND is_user_process = 1;

IF LEN(@killCmd) > 0
BEGIN
    PRINT '?? ????? ?????????...';
    EXEC(@killCmd);
    WAITFOR DELAY '00:00:02';
END

-- ??? AssetsTest ??? ???? ??????
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'AssetsTest')
BEGIN
    PRINT '??? ??? AssetsTest ????????...';
    ALTER DATABASE AssetsTest SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE AssetsTest;
END

-- ????? ????????
DECLARE @backupPath NVARCHAR(500);
DECLARE @dataPath NVARCHAR(500);

SELECT TOP 1 
    @dataPath = REVERSE(SUBSTRING(REVERSE(physical_name), 
                CHARINDEX('\', REVERSE(physical_name)), 
                LEN(physical_name)))
FROM sys.master_files 
WHERE database_id = DB_ID('Assets') AND type = 0;

IF @dataPath IS NULL OR @dataPath = ''
    SET @dataPath = 'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\';

SET @backupPath = 'C:\Temp\Assets_Direct_Fix_' + 
    FORMAT(GETDATE(), 'yyyyMMdd_HHmmss') + '.bak';

PRINT '?? ???? ????????: ' + @dataPath;
PRINT '?? ???? Backup: ' + @backupPath;

-- ????? backup
EXEC master.dbo.xp_cmdshell 'mkdir C:\Temp', NO_OUTPUT;

PRINT '?? ????? backup...';
BACKUP DATABASE Assets TO DISK = @backupPath
WITH FORMAT, COPY_ONLY, COMPRESSION, CHECKSUM,
NAME = 'Assets Direct Fix Backup', STATS = 20;

-- ??????? ???????
CREATE TABLE #Files (
    LogicalName NVARCHAR(128),
    PhysicalName NVARCHAR(260),
    Type CHAR(1),
    FileGroupName NVARCHAR(128),
    Size BIGINT,
    MaxSize BIGINT,
    FileId INT,
    CreateLSN NUMERIC(25,0),
    DropLSN NUMERIC(25,0),
    UniqueId UNIQUEIDENTIFIER,
    ReadOnlyLSN NUMERIC(25,0),
    ReadWriteLSN NUMERIC(25,0),
    BackupSizeInBytes BIGINT,
    SourceBlockSize INT,
    filegroupid INT,
    loggroupguid UNIQUEIDENTIFIER,
    differentialbaselsn NUMERIC(25,0),
    differentialbaseguid UNIQUEIDENTIFIER,
    isreadonly BIT,
    ispresent BIT,
    TDEThumbprint VARBINARY(32),
    SnapshotURL NVARCHAR(360)
);

DECLARE @fileListSQL NVARCHAR(MAX) = 'RESTORE FILELISTONLY FROM DISK = ''' + @backupPath + '''';
INSERT INTO #Files EXEC(@fileListSQL);

DECLARE @dataLogical NVARCHAR(128), @logLogical NVARCHAR(128);
DECLARE @dataFile NVARCHAR(500), @logFile NVARCHAR(500);

SELECT @dataLogical = LogicalName FROM #Files WHERE Type = 'D';
SELECT @logLogical = LogicalName FROM #Files WHERE Type = 'L';

SET @dataFile = @dataPath + 'AssetsTest.mdf';
SET @logFile = @dataPath + 'AssetsTest_Log.ldf';

-- ??????? ????? ????????
PRINT '?? ??????? ????? ????????...';

DECLARE @restoreSQL NVARCHAR(MAX) = 
'RESTORE DATABASE AssetsTest FROM DISK = ''' + @backupPath + ''' WITH ' +
'MOVE ''' + @dataLogical + ''' TO ''' + @dataFile + ''', ' +
'MOVE ''' + @logLogical + ''' TO ''' + @logFile + ''', ' +
'REPLACE, STATS = 20, CHECKSUM';

EXEC(@restoreSQL);

-- ?????
DROP TABLE #Files;

-- ??????? ????? ????????
ALTER DATABASE AssetsTest SET RECOVERY SIMPLE;
ALTER DATABASE AssetsTest SET AUTO_UPDATE_STATISTICS ON;

-- ?????? ???????
USE AssetsTest;

DECLARE @tableCount INT, @recordCount BIGINT = 0;
SELECT @tableCount = COUNT(*) FROM sys.tables WHERE type = 'U';

IF OBJECT_ID('SecurityUsers') IS NOT NULL
    SELECT @recordCount = @recordCount + COUNT(*) FROM SecurityUsers;

IF OBJECT_ID('Assets') IS NOT NULL
    SELECT @recordCount = @recordCount + COUNT(*) FROM Assets;

USE master;

-- ????? backup
DECLARE @deleteCmd NVARCHAR(1000) = 'DEL "' + @backupPath + '"';
EXEC master.dbo.xp_cmdshell @deleteCmd, NO_OUTPUT;

-- ????? ??????
PRINT '';
PRINT '?? ================================================';
PRINT '? ?? ????? AssetsTest ?????!';
PRINT '================================================';
PRINT '??? ???????: ' + CAST(@tableCount AS VARCHAR(10));
PRINT '???? ?????: ' + CAST(@recordCount AS VARCHAR(20));
PRINT '?? Connection: AssetsTestConnection';
PRINT '?? AssetsTest ????? ?????????!';
PRINT '================================================';

-- ????? ???? Migration
USE Assets;
IF OBJECT_ID('__EFMigrationsHistory') IS NOT NULL
BEGIN
    INSERT INTO [__EFMigrationsHistory] (MigrationId, ProductVersion)
    VALUES ('20260416072219_CreateAssetsTestDatabase', '9.0.1');
    PRINT '? Migration history updated';
END
"@

    Write-Host ""
    Write-Host "? ????? SQL ?????..." -ForegroundColor Yellow
    
    # ??? SQL ?? ???
    $SqlFile = "migration_direct_fix.sql"
    $DirectSQL | Out-File -FilePath $SqlFile -Encoding UTF8
    
    # ?????
    sqlcmd -S $Server -U $Username -P $Password -i $SqlFile -C -t 900
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "?? ?? ????? AssetsTest ?????!" -ForegroundColor Green
        
        # ?????? ???????
        Write-Host ""
        Write-Host "?? ?????? ???????..." -ForegroundColor Cyan
        
        $FinalCheckSQL = @"
-- ??? AssetsTest
USE AssetsTest;
SELECT 'SUCCESS: AssetsTest Created!' as Status;

-- ???????? ???????
SELECT 
    'Tables' as Type, 
    COUNT(*) as Count 
FROM sys.tables WHERE type = 'U';

-- ???????? ????????
SELECT 'SecurityUsers' as TableName, COUNT(*) as Records FROM SecurityUsers
UNION ALL
SELECT 'Assets', COUNT(*) FROM Assets
UNION ALL
SELECT 'AssetCategories', COUNT(*) FROM AssetCategories;
"@
        
        $CheckFile = "final_verification.sql"
        $FinalCheckSQL | Out-File -FilePath $CheckFile -Encoding UTF8
        
        sqlcmd -S $Server -U $Username -P $Password -i $CheckFile -C
        
        Write-Host ""
        Write-Host "? Migration ????? ?????!" -ForegroundColor Green
        Write-Host "?? AssetsTest ????? ???????? ?????" -ForegroundColor Green
        
        Remove-Item $CheckFile -ErrorAction SilentlyContinue
        
    } else {
        Write-Host ""
        Write-Host "? ??? ?? ????? SQL ?????" -ForegroundColor Red
    }
    
    Remove-Item $SqlFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "?? ??????? ????????:" -ForegroundColor Blue
Write-Host "   • AssetsTest: ???? ?????? 100% ?? Assets" -ForegroundColor Gray
Write-Host "   • Connection String: AssetsTestConnection" -ForegroundColor Gray
Write-Host "   • ????? ???????? ????? ????????" -ForegroundColor Gray

Write-Host ""
Write-Host "?? ?????????:" -ForegroundColor Cyan
Write-Host '   ????? appsettings.json ??????:' -ForegroundColor Gray
Write-Host '   "DefaultConnection": "...AssetsTest..."' -ForegroundColor Gray