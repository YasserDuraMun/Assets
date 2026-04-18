# =====================================================
# PowerShell Script ????? ???? Assets ??? AssetsTest
# ???? ??????? Batch Files
# =====================================================

Write-Host "?? ??? ??? ????? ???????? Assets ??? AssetsTest..." -ForegroundColor Green
Write-Host "?? ??????: Assets" -ForegroundColor Cyan
Write-Host "?? ?????: AssetsTest" -ForegroundColor Cyan
Write-Host ""

# ??????? ???????
$ServerInstance = "10.0.0.17"
$Username = "sa"
$Password = "Dur@123456"
$SourceDatabase = "Assets"
$TargetDatabase = "AssetsTest"

# ?????? ?? ???? SqlServer Module
if (-not (Get-Module -ListAvailable -Name SqlServer)) {
    Write-Host "?? ????? SqlServer Module..." -ForegroundColor Yellow
    try {
        Install-Module -Name SqlServer -Force -AllowClobber -Scope CurrentUser
        Write-Host "? ?? ????? SqlServer Module" -ForegroundColor Green
    } catch {
        Write-Host "?? ?????: ????? ?? ????? SqlServer Module? ??????? sqlcmd" -ForegroundColor Yellow
    }
}

# ???? SQL ???????
$CopyScript = @"
USE master;

PRINT '?? ??? ????? ????? ???????...';
PRINT '?? ??????: Assets';
PRINT '?? ?????: AssetsTest';

-- ?????? ?? ???? ????? ???????? ??????
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'Assets')
BEGIN
    PRINT '? ???: ????? ???????? Assets ??? ??????!';
    RETURN;
END

PRINT '? ????? ???????? Assets ??????';

-- ???????
DECLARE @BackupPath NVARCHAR(500);
DECLARE @DataPath NVARCHAR(500);
DECLARE @LogPath NVARCHAR(500);
DECLARE @SQL NVARCHAR(MAX);

-- ??? ????????? ??????
SET @SQL = '';
SELECT @SQL = @SQL + 'KILL ' + CAST(session_id AS VARCHAR(10)) + '; '
FROM sys.dm_exec_sessions
WHERE database_id = DB_ID('Assets') AND session_id <> @@SPID;

IF LEN(@SQL) > 0
BEGIN
    PRINT '?? ????? ????????? ??????...';
    EXEC(@SQL);
    WAITFOR DELAY '00:00:02';
END

-- ??? AssetsTest ??? ???? ??????
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'AssetsTest')
BEGIN
    PRINT '??? ??? AssetsTest ????????...';
    
    SET @SQL = '';
    SELECT @SQL = @SQL + 'KILL ' + CAST(session_id AS VARCHAR(10)) + '; '
    FROM sys.dm_exec_sessions
    WHERE database_id = DB_ID('AssetsTest') AND session_id <> @@SPID;
    
    IF LEN(@SQL) > 0
        EXEC(@SQL);
    
    ALTER DATABASE AssetsTest SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE AssetsTest;
    PRINT '? ?? ??? AssetsTest ???????';
END

-- ????? ?????? ???????
SELECT TOP 1 
    @DataPath = LEFT(physical_name, LEN(physical_name) - CHARINDEX('\', REVERSE(physical_name)) + 1)
FROM sys.master_files 
WHERE database_id = DB_ID('Assets') AND type = 0;

SELECT TOP 1 
    @LogPath = LEFT(physical_name, LEN(physical_name) - CHARINDEX('\', REVERSE(physical_name)) + 1)
FROM sys.master_files 
WHERE database_id = DB_ID('Assets') AND type = 1;

IF @DataPath IS NULL 
    SET @DataPath = 'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\';
IF @LogPath IS NULL 
    SET @LogPath = @DataPath;

PRINT '?? ???? ????????: ' + @DataPath;

-- ???? backup ????
SET @BackupPath = 'C:\Temp\Assets_PowerShell_Backup_' + 
                  REPLACE(REPLACE(REPLACE(CONVERT(VARCHAR(19), GETDATE(), 120), '-', ''), ' ', '_'), ':', '') + '.bak';

PRINT '?? ???? backup: ' + @BackupPath;

-- ????? backup
PRINT '?? ????? backup...';
EXEC master.dbo.xp_cmdshell 'md C:\Temp', NO_OUTPUT;

SET @SQL = '
BACKUP DATABASE [Assets] 
TO DISK = ''' + @BackupPath + '''
WITH 
    FORMAT, 
    COPY_ONLY,
    COMPRESSION,
    CHECKSUM,
    NAME = ''Assets PowerShell Backup'',
    STATS = 10';

EXEC sp_executesql @SQL;
PRINT '? ?? ????? backup';

-- ????? ??????? ???????
CREATE TABLE #FileList (
    LogicalName NVARCHAR(128),
    PhysicalName NVARCHAR(260),
    Type CHAR(1),
    FileGroupName NVARCHAR(128),
    Size NUMERIC(20,0),
    MaxSize NUMERIC(20,0),
    FileID BIGINT,
    CreateLSN NUMERIC(25,0),
    DropLSN NUMERIC(25,0),
    UniqueID UNIQUEIDENTIFIER,
    ReadOnlyLSN NUMERIC(25,0),
    ReadWriteLSN NUMERIC(25,0),
    BackupSizeInBytes BIGINT,
    SourceBlockSize INT,
    FileGroupID INT,
    LogGroupGUID UNIQUEIDENTIFIER,
    DifferentialBaseLSN NUMERIC(25,0),
    DifferentialBaseGUID UNIQUEIDENTIFIER,
    IsReadOnly BIT,
    IsPresent BIT,
    TDEThumbprint VARBINARY(32),
    SnapshotURL NVARCHAR(360)
);

DECLARE @FileListSQL NVARCHAR(1000) = 'RESTORE FILELISTONLY FROM DISK = ''' + @BackupPath + '''';
INSERT INTO #FileList EXEC(@FileListSQL);

-- ????? ??????? ???????
DECLARE @DataFileName NVARCHAR(500) = @DataPath + 'AssetsTest.mdf';
DECLARE @LogFileName NVARCHAR(500) = @LogPath + 'AssetsTest_Log.ldf';
DECLARE @DataLogicalName NVARCHAR(128);
DECLARE @LogLogicalName NVARCHAR(128);

SELECT @DataLogicalName = LogicalName FROM #FileList WHERE Type = 'D';
SELECT @LogLogicalName = LogicalName FROM #FileList WHERE Type = 'L';

PRINT '?? ??? ????????: ' + @DataFileName;
PRINT '?? ??? ?????: ' + @LogFileName;

-- ??????? ????? ????????
PRINT '?? ??????? AssetsTest...';

DECLARE @RestoreSQL NVARCHAR(MAX) = 
'RESTORE DATABASE [AssetsTest] FROM DISK = ''' + @BackupPath + ''' WITH ' +
'MOVE ''' + @DataLogicalName + ''' TO ''' + @DataFileName + ''', ' +
'MOVE ''' + @LogLogicalName + ''' TO ''' + @LogFileName + ''', ' +
'REPLACE, STATS = 10, CHECKSUM';

EXEC sp_executesql @RestoreSQL;
PRINT '? ?? ??????? AssetsTest ?????';

-- ?????
DROP TABLE #FileList;

-- ??????? ????? ????????
ALTER DATABASE AssetsTest SET RECOVERY SIMPLE;
ALTER DATABASE AssetsTest SET AUTO_UPDATE_STATISTICS ON;

-- ?????? ???????
USE AssetsTest;

DECLARE @TableCount INT, @TotalRecords BIGINT = 0;
SELECT @TableCount = COUNT(*) FROM sys.tables WHERE type = 'U';

PRINT '?? ??? ???????: ' + CAST(@TableCount AS VARCHAR(10));

-- ?? ??????? ????????
IF OBJECT_ID('SecurityUsers') IS NOT NULL
BEGIN
    DECLARE @SecurityUsersCount INT;
    SELECT @SecurityUsersCount = COUNT(*) FROM SecurityUsers;
    PRINT '?? SecurityUsers: ' + CAST(@SecurityUsersCount AS VARCHAR(10)) + ' ???';
    SET @TotalRecords = @TotalRecords + @SecurityUsersCount;
END

IF OBJECT_ID('Assets') IS NOT NULL
BEGIN
    DECLARE @AssetsCount INT;
    SELECT @AssetsCount = COUNT(*) FROM Assets;
    PRINT '?? Assets: ' + CAST(@AssetsCount AS VARCHAR(10)) + ' ???';
    SET @TotalRecords = @TotalRecords + @AssetsCount;
END

IF OBJECT_ID('AssetCategories') IS NOT NULL
BEGIN
    DECLARE @CategoriesCount INT;
    SELECT @CategoriesCount = COUNT(*) FROM AssetCategories;
    PRINT '?? AssetCategories: ' + CAST(@CategoriesCount AS VARCHAR(10)) + ' ???';
    SET @TotalRecords = @TotalRecords + @CategoriesCount;
END

PRINT '?? ?????? ??????? ????????: ' + CAST(@TotalRecords AS VARCHAR(20));

-- ????? backup
USE master;
DECLARE @DeleteCmd NVARCHAR(1000) = 'DEL "' + @BackupPath + '"';
EXEC master.dbo.xp_cmdshell @DeleteCmd, NO_OUTPUT;

PRINT '';
PRINT '?? =================================================';
PRINT '? ?????? ????? ????? ?????!';
PRINT '=================================================';
PRINT '?? ????? ????????: AssetsTest';
PRINT '??? ??????: 10.0.0.17';
PRINT '?? ???????: ' + CONVERT(VARCHAR(19), GETDATE(), 120);
PRINT '';
PRINT '?? Connection String:';
PRINT 'Data Source=10.0.0.17;Initial Catalog=AssetsTest;User ID=sa;Password=Dur@123456;...';
PRINT '';
PRINT '?? AssetsTest ????? ?????????!';
PRINT '=================================================';
"@

# ??? SQL ?? ??? ????
$SqlFile = "temp_copy_script.sql"
$CopyScript | Out-File -FilePath $SqlFile -Encoding UTF8

Write-Host "?? ????? SQL Script ??????..." -ForegroundColor Yellow

try {
    # ????? ???????? sqlcmd
    sqlcmd -S $ServerInstance -U $Username -P $Password -i $SqlFile -t 1800 -C
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "? ?? ??? ????? ???????? ?????!" -ForegroundColor Green
        Write-Host "?? AssetsTest ????? ?????????" -ForegroundColor Green
        
        # ?????? ??????
        Write-Host ""
        Write-Host "?? ?????? ??????..." -ForegroundColor Yellow
        
        $VerifyScript = @"
USE AssetsTest;
SELECT 'AssetsTest Database' as [Database], COUNT(*) as [Tables] 
FROM sys.tables WHERE type = 'U';

SELECT 'SecurityUsers' as [Table], COUNT(*) as [Records] FROM SecurityUsers
UNION ALL
SELECT 'Assets', COUNT(*) FROM Assets  
UNION ALL
SELECT 'AssetCategories', COUNT(*) FROM AssetCategories;
"@
        
        $VerifyFile = "temp_verify_script.sql"
        $VerifyScript | Out-File -FilePath $VerifyFile -Encoding UTF8
        
        sqlcmd -S $ServerInstance -U $Username -P $Password -i $VerifyFile -C
        
        Write-Host ""
        Write-Host "?? Connection String ???? ?? appsettings.json:" -ForegroundColor Cyan
        Write-Host "AssetsTestConnection" -ForegroundColor Yellow
        
        # ????? ??????? ???????
        Remove-Item $VerifyFile -ErrorAction SilentlyContinue
    } else {
        Write-Host "? ??? ?? ????? ???????" -ForegroundColor Red
        Write-Host "???? ??:" -ForegroundColor Yellow
        Write-Host "1. ???? ????? ???????? Assets" -ForegroundColor Gray
        Write-Host "2. ??????? ???????? sa" -ForegroundColor Gray  
        Write-Host "3. ????? ????? ????????" -ForegroundColor Gray
    }
} catch {
    Write-Host "? ???: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    # ?????
    Remove-Item $SqlFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "?? ????? ???????" -ForegroundColor Green