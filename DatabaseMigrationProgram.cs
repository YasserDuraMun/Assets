using Microsoft.Data.SqlClient;

namespace DatabaseCopyTool
{
    internal class DatabaseMigrationProgram
    {
        private static readonly string ConnectionString = 
            "Data Source=10.0.0.17;Initial Catalog=master;User ID=sa;Password=Dur@123456;Connect Timeout=300;Encrypt=True;Trust Server Certificate=True;";

        static async Task Main(string[] args)
        {
            Console.WriteLine("?? ???? ??? ????? ???????? Assets ??? AssetsTest");
            Console.WriteLine("=================================================");
            Console.WriteLine();

            Console.WriteLine("?? ??? ?????? ????? ??:");
            Console.WriteLine("   • ??? ????? ?????? Assets ?????");
            Console.WriteLine("   • ????? ????? ?????? AssetsTest ??????");
            Console.WriteLine("   • ?????? ??? ???? ???????? ?????????");
            Console.WriteLine();

            Console.Write("?? ???? ????????? (y/N): ");
            var input = Console.ReadLine();
            
            if (input?.ToLower() != "y")
            {
                Console.WriteLine("? ?? ????? ???????");
                return;
            }

            Console.WriteLine();
            Console.WriteLine("?? ??? ?????...");

            try
            {
                await ExecuteDatabaseCopyAsync();
                Console.WriteLine("? ?? ????? ?????!");
                
                await VerifyDatabaseAsync();
                
                Console.WriteLine();
                Console.WriteLine("?? AssetsTest ????? ?????????!");
                Console.WriteLine();
                Console.WriteLine("?? Connection String:");
                Console.WriteLine("Data Source=10.0.0.17;Initial Catalog=AssetsTest;User ID=sa;Password=Dur@123456;...");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"? ???: {ex.Message}");
            }

            Console.WriteLine();
            Console.WriteLine("???? ?? ????? ??????...");
            Console.ReadKey();
        }

        private static async Task ExecuteDatabaseCopyAsync()
        {
            using var connection = new SqlConnection(ConnectionString);
            await connection.OpenAsync();

            Console.WriteLine("? ?? ??????? ???????");

            // ??? ??????
            var checkSource = new SqlCommand("SELECT CASE WHEN DB_ID('Assets') IS NOT NULL THEN 1 ELSE 0 END", connection);
            var sourceExists = (int)await checkSource.ExecuteScalarAsync();

            if (sourceExists == 0)
            {
                throw new Exception("????? ???????? Assets ??? ??????");
            }

            Console.WriteLine("? ????? ???????? Assets ??????");

            // ????? ?????
            var copyScript = @"
-- ??? ?????????
DECLARE @SQL NVARCHAR(MAX) = '';
SELECT @SQL = @SQL + 'KILL ' + CAST(session_id AS VARCHAR) + '; '
FROM sys.dm_exec_sessions 
WHERE database_id IN (DB_ID('Assets'), DB_ID('AssetsTest'))
  AND session_id != @@SPID;

IF @SQL != '' EXEC(@SQL);
WAITFOR DELAY '00:00:02';

-- ??? ?????
IF DB_ID('AssetsTest') IS NOT NULL
BEGIN
    PRINT '??? AssetsTest ????????...';
    ALTER DATABASE AssetsTest SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE AssetsTest;
END

-- ????? ????????
DECLARE @BackupFile NVARCHAR(500) = 'C:\Temp\Assets_Tool_' + 
    FORMAT(GETDATE(), 'yyyyMMdd_HHmmss') + '.bak';
DECLARE @DataPath NVARCHAR(500);
DECLARE @LogPath NVARCHAR(500);

SELECT TOP 1
    @DataPath = LEFT(physical_name, LEN(physical_name) - CHARINDEX('\', REVERSE(physical_name)) + 1)
FROM sys.master_files 
WHERE database_id = DB_ID('Assets') AND type = 0;

SET @LogPath = @DataPath;

DECLARE @DataFile NVARCHAR(500) = @DataPath + 'AssetsTest.mdf';
DECLARE @LogFile NVARCHAR(500) = @LogPath + 'AssetsTest_Log.ldf';

-- ????? ????
EXEC xp_cmdshell 'md C:\Temp', NO_OUTPUT;

PRINT '????? backup...';
BACKUP DATABASE Assets TO DISK = @BackupFile
WITH FORMAT, COMPRESSION, CHECKSUM, STATS = 25;

-- ?????? ??? ????? ??????? ????????
CREATE TABLE #Files (
    LogicalName NVARCHAR(128),
    PhysicalName NVARCHAR(260), 
    Type CHAR(1),
    FileGroupName NVARCHAR(128),
    Size NUMERIC(20,0),
    MaxSize NUMERIC(20,0),
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

INSERT INTO #Files EXEC('RESTORE FILELISTONLY FROM DISK = ''' + @BackupFile + '''');

DECLARE @DataLogical NVARCHAR(128), @LogLogical NVARCHAR(128);
SELECT @DataLogical = LogicalName FROM #Files WHERE Type = 'D';
SELECT @LogLogical = LogicalName FROM #Files WHERE Type = 'L';

DROP TABLE #Files;

PRINT '??????? ????? ????????...';
DECLARE @RestoreCmd NVARCHAR(MAX) = 
'RESTORE DATABASE AssetsTest FROM DISK = ''' + @BackupFile + ''' WITH ' +
'MOVE ''' + @DataLogical + ''' TO ''' + @DataFile + ''', ' +
'MOVE ''' + @LogLogical + ''' TO ''' + @LogFile + ''', ' +
'REPLACE, STATS = 25';

EXEC(@RestoreCmd);

-- ?????
EXEC('DEL ""' + @BackupFile + '""');

-- ???????
ALTER DATABASE AssetsTest SET RECOVERY SIMPLE;
ALTER DATABASE AssetsTest SET AUTO_UPDATE_STATISTICS ON;

PRINT '?? ????? ?????!';
";

            Console.WriteLine("?? ????? backup ?????? ?????...");
            
            var copyCommand = new SqlCommand(copyScript, connection)
            {
                CommandTimeout = 1800 // 30 minutes
            };

            await copyCommand.ExecuteNonQueryAsync();
            
            Console.WriteLine("? ????? ?????");
        }

        private static async Task VerifyDatabaseAsync()
        {
            var verifyConnectionString = ConnectionString.Replace("Initial Catalog=master", "Initial Catalog=AssetsTest");
            
            using var connection = new SqlConnection(verifyConnectionString);
            await connection.OpenAsync();

            Console.WriteLine();
            Console.WriteLine("?? ?????? ?? ???????...");

            // ?? ???????
            var tableCmd = new SqlCommand("SELECT COUNT(*) FROM sys.tables WHERE type = 'U'", connection);
            var tableCount = (int)await tableCmd.ExecuteScalarAsync();
            
            Console.WriteLine($"?? ??? ???????: {tableCount}");

            // ?? ??? ???????? ??????
            var queries = new Dictionary<string, string>
            {
                ["??????????"] = "SELECT COUNT(*) FROM SecurityUsers",
                ["??????"] = "SELECT COUNT(*) FROM Assets", 
                ["???????"] = "SELECT COUNT(*) FROM Departments",
                ["??????"] = "SELECT COUNT(*) FROM AssetCategories"
            };

            Console.WriteLine("?? ???????? ????????:");

            foreach (var query in queries)
            {
                try
                {
                    var cmd = new SqlCommand(query.Value, connection);
                    var count = (int)await cmd.ExecuteScalarAsync();
                    Console.WriteLine($"   {query.Key}: {count:N0}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"   {query.Key}: ??? ({ex.Message})");
                }
            }
        }
    }
}