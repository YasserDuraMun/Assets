using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Assets.Migrations
{
    /// <inheritdoc />
    public partial class CreateAssetsTestDatabase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ??? ????? ???????? Assets ??? AssetsTest
            migrationBuilder.Sql(@"
                USE master;
                
                -- ?????? ?? ???? ??????
                IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'Assets')
                BEGIN
                    RAISERROR('Assets database not found!', 16, 1);
                    RETURN;
                END
                
                PRINT '? Assets database found';
                
                -- ??? ????????? ??????
                DECLARE @killConnections NVARCHAR(MAX) = '';
                SELECT @killConnections = @killConnections + 'KILL ' + CAST(session_id AS VARCHAR(10)) + '; '
                FROM sys.dm_exec_sessions
                WHERE database_id IN (DB_ID('Assets'), DB_ID('AssetsTest')) 
                  AND session_id <> @@SPID
                  AND is_user_process = 1;
                
                IF LEN(@killConnections) > 0
                BEGIN
                    PRINT 'Closing active connections...';
                    EXEC(@killConnections);
                    WAITFOR DELAY '00:00:02';
                END
                
                -- ??? AssetsTest ??? ???? ??????
                IF EXISTS (SELECT name FROM sys.databases WHERE name = 'AssetsTest')
                BEGIN
                    PRINT 'Dropping existing AssetsTest...';
                    ALTER DATABASE AssetsTest SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
                    DROP DATABASE AssetsTest;
                    PRINT '? AssetsTest dropped';
                END
            ");

            migrationBuilder.Sql(@"
                -- ????? ????????
                DECLARE @backupPath NVARCHAR(500);
                DECLARE @dataPath NVARCHAR(500);
                
                -- ?????? ??? ???? ????? ????? ????????
                SELECT TOP 1 
                    @dataPath = REVERSE(SUBSTRING(REVERSE(physical_name), 
                                CHARINDEX('\', REVERSE(physical_name)), 
                                LEN(physical_name)))
                FROM sys.master_files 
                WHERE database_id = DB_ID('Assets') AND type = 0;
                
                -- ???? ??????? ??????
                IF @dataPath IS NULL OR @dataPath = ''
                    SET @dataPath = 'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\';
                
                -- ???? backup ????
                SET @backupPath = 'C:\Temp\Assets_PMC_Fix_' + 
                    FORMAT(GETDATE(), 'yyyyMMdd_HHmmss') + '.bak';
                
                PRINT 'Data path: ' + @dataPath;
                PRINT 'Backup path: ' + @backupPath;
                
                -- ????? ???? Temp
                EXEC master.dbo.xp_cmdshell 'mkdir C:\Temp', NO_OUTPUT;
                
                -- ????? backup
                PRINT 'Creating backup...';
                BACKUP DATABASE Assets TO DISK = @backupPath
                WITH FORMAT, COPY_ONLY, COMPRESSION, CHECKSUM,
                NAME = 'Assets PMC Fix Backup', STATS = 25;
                
                PRINT '? Backup created successfully';
                
                -- ??????? ???????
                CREATE TABLE #FileInfo (
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
                
                -- ?????? ??? ??????? ???????
                DECLARE @fileListSQL NVARCHAR(MAX) = 
                'RESTORE FILELISTONLY FROM DISK = ''' + @backupPath + '''';
                INSERT INTO #FileInfo EXEC(@fileListSQL);
                
                DECLARE @dataLogical NVARCHAR(128);
                DECLARE @logLogical NVARCHAR(128);
                DECLARE @dataFile NVARCHAR(500);
                DECLARE @logFile NVARCHAR(500);
                
                SELECT @dataLogical = LogicalName FROM #FileInfo WHERE Type = 'D';
                SELECT @logLogical = LogicalName FROM #FileInfo WHERE Type = 'L';
                
                SET @dataFile = @dataPath + 'AssetsTest.mdf';
                SET @logFile = @dataPath + 'AssetsTest_Log.ldf';
                
                PRINT 'Data file: ' + @dataFile;
                PRINT 'Log file: ' + @logFile;
                
                -- ??????? ????? ????????
                DECLARE @restoreSQL NVARCHAR(MAX) = 
                'RESTORE DATABASE AssetsTest FROM DISK = ''' + @backupPath + ''' WITH ' +
                'MOVE ''' + @dataLogical + ''' TO ''' + @dataFile + ''', ' +
                'MOVE ''' + @logLogical + ''' TO ''' + @logFile + ''', ' +
                'REPLACE, STATS = 25, CHECKSUM';
                
                PRINT 'Restoring database...';
                EXEC(@restoreSQL);
                
                -- ?????
                DROP TABLE #FileInfo;
                PRINT '? Database restored successfully';
                
                -- ????? ??????? ????? ????????
                ALTER DATABASE AssetsTest SET RECOVERY SIMPLE;
                ALTER DATABASE AssetsTest SET AUTO_SHRINK OFF;
                ALTER DATABASE AssetsTest SET AUTO_UPDATE_STATISTICS ON;
                
                -- ?????? ???????
                USE AssetsTest;
                
                DECLARE @tableCount INT;
                DECLARE @sampleRecords BIGINT = 0;
                
                SELECT @tableCount = COUNT(*) FROM sys.tables WHERE type = 'U';
                
                -- ?? ??? ??????? ??????
                IF OBJECT_ID('SecurityUsers') IS NOT NULL
                    SELECT @sampleRecords = @sampleRecords + COUNT(*) FROM SecurityUsers;
                    
                IF OBJECT_ID('Assets') IS NOT NULL
                    SELECT @sampleRecords = @sampleRecords + COUNT(*) FROM Assets;
                
                USE master;
                
                -- ????? backup ??????
                DECLARE @cleanupPath NVARCHAR(500);
                SET @cleanupPath = 'C:\Temp\Assets_PMC_Fix_' + 
                    FORMAT(GETDATE(), 'yyyyMMdd_HHmmss') + '.bak';
                    
                DECLARE @deleteCmd NVARCHAR(1000) = 'DEL ""' + @cleanupPath + '""';
                EXEC master.dbo.xp_cmdshell @deleteCmd, NO_OUTPUT;
                
                -- ????? ??????
                PRINT '';
                PRINT '?? ================================================';
                PRINT '? Migration completed successfully!';
                PRINT '================================================';
                PRINT 'Tables copied: ' + CAST(@tableCount AS VARCHAR(10));
                PRINT 'Sample records: ' + CAST(@sampleRecords AS VARCHAR(20));
                PRINT 'Connection: AssetsTestConnection';
                PRINT '?? AssetsTest is ready for testing!';
                PRINT '================================================';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // ??? ????? ???????? AssetsTest ??? ???????
            migrationBuilder.Sql(@"
                USE master;
                
                PRINT 'Rolling back - dropping AssetsTest...';
                
                -- ??? ?????????
                DECLARE @killCmd NVARCHAR(MAX) = '';
                SELECT @killCmd = @killCmd + 'KILL ' + CAST(session_id AS VARCHAR(10)) + '; '
                FROM sys.dm_exec_sessions
                WHERE database_id = DB_ID('AssetsTest') 
                  AND session_id <> @@SPID
                  AND is_user_process = 1;
                
                IF LEN(@killCmd) > 0
                    EXEC(@killCmd);
                
                -- ??? ????? ????????
                IF EXISTS (SELECT name FROM sys.databases WHERE name = 'AssetsTest')
                BEGIN
                    ALTER DATABASE AssetsTest SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
                    DROP DATABASE AssetsTest;
                    PRINT '? AssetsTest dropped successfully';
                END
                ELSE
                BEGIN
                    PRINT '?? AssetsTest was not found';
                END
            ");
        }
    }
}
