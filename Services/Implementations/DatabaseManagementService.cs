using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using Assets.Services.Interfaces;
using System.Diagnostics;

namespace Assets.Services.Implementations
{
    /// <summary>
    /// ????? ???? ????? ????? ????????
    /// </summary>
    public class DatabaseManagementService : IDatabaseManagementService
    {
        private readonly ILogger<DatabaseManagementService> _logger;

        public DatabaseManagementService(ILogger<DatabaseManagementService> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// ????? ??????? ??????? ????? ?????????
        /// </summary>
        public async Task<DatabaseOperationResult> PerformBackupOperationAsync(
            string sourceConnectionString,
            string backupConnectionString,
            IList<string> databasesToDelete = null)
        {
            var stopwatch = Stopwatch.StartNew();
            var result = new DatabaseOperationResult();

            try
            {
                _logger.LogInformation("?? ??? ????? ????? ?????????");

                // ?????? 1: ??? ????? ???????? ???????
                if (databasesToDelete?.Any() == true)
                {
                    foreach (var dbName in databasesToDelete)
                    {
                        var masterConnectionString = GetMasterConnectionString(sourceConnectionString);
                        var deleted = await SafeDeleteDatabaseAsync(masterConnectionString, dbName);
                        
                        if (deleted)
                        {
                            result.ExecutedSteps.Add($"? ?? ??? ????? ????????: {dbName}");
                            _logger.LogInformation($"?? ??? ????? ???????? {dbName} ?????");
                        }
                        else
                        {
                            result.ExecutedSteps.Add($"?? ????? ???????? {dbName} ??? ?????? ?? ?? ????");
                        }
                    }
                }

                // ?????? 2: ?????? ?? ???? ????? ???????? ??????
                var sourceDbName = GetDatabaseNameFromConnectionString(sourceConnectionString);
                var sourceMasterConn = GetMasterConnectionString(sourceConnectionString);
                
                if (!await DatabaseExistsAsync(sourceMasterConn, sourceDbName))
                {
                    throw new InvalidOperationException($"????? ???????? ?????? ??? ??????: {sourceDbName}");
                }

                result.ExecutedSteps.Add($"? ?? ?????? ?? ???? ????? ???????? ??????: {sourceDbName}");

                // ?????? 3: ????? ?????? ??????????
                var backupCreated = await CreateDatabaseBackupAsync(sourceConnectionString, backupConnectionString);

                if (backupCreated)
                {
                    var backupDbName = GetDatabaseNameFromConnectionString(backupConnectionString);
                    result.ExecutedSteps.Add($"? ?? ????? ?????? ??????????: {backupDbName}");
                    
                    // ?????? ?? ???????? ?? ?????? ??????????
                    var dataValidation = await ValidateBackupDataAsync(sourceConnectionString, backupConnectionString);
                    result.Details.Add("DataValidation", dataValidation);
                    
                    if (dataValidation["TablesMatch"] as bool? == true)
                    {
                        result.ExecutedSteps.Add("? ?? ?????? ?? ????? ???????? ?? ?????? ??????????");
                    }
                }

                stopwatch.Stop();
                result.Duration = stopwatch.Elapsed;
                result.IsSuccess = true;
                result.Message = "??? ????? ????? ????????? ?????";

                _logger.LogInformation($"?? ??? ????? ????? ????????? ????? ?? {result.Duration.TotalSeconds:F2} ?????");
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                result.Duration = stopwatch.Elapsed;
                result.IsSuccess = false;
                result.Message = $"??? ?? ????? ????? ?????????: {ex.Message}";
                result.Errors.Add(ex.ToString());

                _logger.LogError(ex, "? ??? ?? ????? ????? ?????????");
            }

            return result;
        }

        /// <summary>
        /// ??? ????? ?????? ?????? ????
        /// </summary>
        public async Task<bool> SafeDeleteDatabaseAsync(string masterConnectionString, string databaseName)
        {
            try
            {
                _logger.LogInformation($"??? ?????? ??? ????? ????????: {databaseName}");

                using var connection = new SqlConnection(masterConnectionString);
                await connection.OpenAsync();

                // ?????? ?? ???? ????? ????????
                var checkSql = "SELECT COUNT(*) FROM sys.databases WHERE name = @DatabaseName";
                using var checkCommand = new SqlCommand(checkSql, connection);
                checkCommand.Parameters.AddWithValue("@DatabaseName", databaseName);
                
                var exists = (int)await checkCommand.ExecuteScalarAsync() > 0;
                
                if (!exists)
                {
                    _logger.LogInformation($"????? ???????? {databaseName} ??? ??????");
                    return false;
                }

                // ??? ????????? ??????
                var killConnectionsSql = $@"
                    DECLARE @sql NVARCHAR(MAX) = '';
                    SELECT @sql = @sql + 'KILL ' + CAST(session_id AS VARCHAR) + ';' + CHAR(13)
                    FROM sys.dm_exec_sessions 
                    WHERE database_id = DB_ID('{databaseName}') AND session_id != @@SPID;
                    IF LEN(@sql) > 0 EXEC sp_executesql @sql;";

                using var killCommand = new SqlCommand(killConnectionsSql, connection);
                await killCommand.ExecuteNonQueryAsync();

                // ?????? ????
                await Task.Delay(1000);

                // ??? ????? ????????
                var dropSql = $@"
                    IF EXISTS(SELECT name FROM sys.databases WHERE name = '{databaseName}')
                    BEGIN
                        ALTER DATABASE [{databaseName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
                        DROP DATABASE [{databaseName}];
                    END";

                using var dropCommand = new SqlCommand(dropSql, connection);
                await dropCommand.ExecuteNonQueryAsync();

                _logger.LogInformation($"? ?? ??? ????? ???????? {databaseName} ?????");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"? ??? ?? ??? ????? ???????? {databaseName}");
                return false;
            }
        }

        /// <summary>
        /// ????? ???? ???????? ????? ?? ????? ????????
        /// </summary>
        public async Task<bool> CreateDatabaseBackupAsync(string sourceConnectionString, string backupConnectionString)
        {
            try
            {
                var sourceDbName = GetDatabaseNameFromConnectionString(sourceConnectionString);
                var backupDbName = GetDatabaseNameFromConnectionString(backupConnectionString);

                _logger.LogInformation($"?? ????? ???? ???????? ?? {sourceDbName} ??? {backupDbName}");

                var masterConnectionString = GetMasterConnectionString(sourceConnectionString);

                using var connection = new SqlConnection(masterConnectionString);
                await connection.OpenAsync();

                // ??? ????? ???????? ?????????? ?? ????
                await SafeDeleteDatabaseAsync(masterConnectionString, backupDbName);

                // ????? ????? ???????? ??????????
                var createDbSql = $"CREATE DATABASE [{backupDbName}]";
                using var createCommand = new SqlCommand(createDbSql, connection);
                await createCommand.ExecuteNonQueryAsync();

                _logger.LogInformation($"? ?? ????? ????? ???????? {backupDbName}");

                // ??? ????????
                await CopyDatabaseStructureAndDataAsync(sourceConnectionString, backupConnectionString);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "? ??? ?? ????? ?????? ??????????");
                return false;
            }
        }

        /// <summary>
        /// ??? ?????? ????????? ?? ????? ?????? ??? ????
        /// </summary>
        private async Task CopyDatabaseStructureAndDataAsync(string sourceConnectionString, string targetConnectionString)
        {
            var sourceDbName = GetDatabaseNameFromConnectionString(sourceConnectionString);
            var targetDbName = GetDatabaseNameFromConnectionString(targetConnectionString);

            _logger.LogInformation($"?? ??? ???????? ?? {sourceDbName} ??? {targetDbName}");

            var masterConnectionString = GetMasterConnectionString(sourceConnectionString);

            using var connection = new SqlConnection(masterConnectionString);
            await connection.OpenAsync();

            // ?????? ??? ????? ???????
            var tablesSql = $@"
                SELECT TABLE_NAME 
                FROM [{sourceDbName}].INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_TYPE = 'BASE TABLE' 
                AND TABLE_NAME NOT LIKE 'sys%'
                ORDER BY TABLE_NAME";

            var tables = new List<string>();
            using (var tablesCommand = new SqlCommand(tablesSql, connection))
            {
                using var reader = await tablesCommand.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    tables.Add(reader.GetString("TABLE_NAME"));
                }
            }

            _logger.LogInformation($"?? ??? ??????? ?????? ?????: {tables.Count}");

            // ??? ?? ????
            foreach (var tableName in tables)
            {
                try
                {
                    var copySql = $@"
                        USE [{targetDbName}];
                        SELECT * INTO [{tableName}] FROM [{sourceDbName}].[dbo].[{tableName}];";

                    using var copyCommand = new SqlCommand(copySql, connection);
                    copyCommand.CommandTimeout = 300; // 5 ?????
                    var rowsAffected = await copyCommand.ExecuteNonQueryAsync();

                    _logger.LogInformation($"? ?? ??? ?????? {tableName} - {rowsAffected} ??");
                }
                catch (Exception ex)
                {
                    _logger.LogWarning($"?? ????? ?? ??? ?????? {tableName}: {ex.Message}");
                }
            }
        }

        /// <summary>
        /// ?????? ?? ??? ???????? ?? ?????? ??????????
        /// </summary>
        private async Task<Dictionary<string, object>> ValidateBackupDataAsync(string sourceConnectionString, string backupConnectionString)
        {
            var result = new Dictionary<string, object>();

            try
            {
                var sourceDbName = GetDatabaseNameFromConnectionString(sourceConnectionString);
                var backupDbName = GetDatabaseNameFromConnectionString(backupConnectionString);

                var masterConnectionString = GetMasterConnectionString(sourceConnectionString);

                using var connection = new SqlConnection(masterConnectionString);
                await connection.OpenAsync();

                // ??? ??????? ?? ?? ????? ??????
                var sourceTableCountSql = $@"
                    SELECT COUNT(*) FROM [{sourceDbName}].INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_TYPE = 'BASE TABLE'";
                
                var backupTableCountSql = $@"
                    SELECT COUNT(*) FROM [{backupDbName}].INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_TYPE = 'BASE TABLE'";

                using var sourceCommand = new SqlCommand(sourceTableCountSql, connection);
                using var backupCommand = new SqlCommand(backupTableCountSql, connection);

                var sourceTableCount = (int)await sourceCommand.ExecuteScalarAsync();
                var backupTableCount = (int)await backupCommand.ExecuteScalarAsync();

                result["SourceTableCount"] = sourceTableCount;
                result["BackupTableCount"] = backupTableCount;
                result["TablesMatch"] = sourceTableCount == backupTableCount;

                // ???? ?? ??? ????????
                var sampleDataSql = $@"
                    SELECT 
                        (SELECT COUNT(*) FROM [{sourceDbName}].[dbo].[SecurityUsers]) as SourceUsers,
                        (SELECT COUNT(*) FROM [{backupDbName}].[dbo].[SecurityUsers]) as BackupUsers";

                using var sampleCommand = new SqlCommand(sampleDataSql, connection);
                using var sampleReader = await sampleCommand.ExecuteReaderAsync();
                
                if (await sampleReader.ReadAsync())
                {
                    result["SourceUsersCount"] = sampleReader["SourceUsers"];
                    result["BackupUsersCount"] = sampleReader["BackupUsers"];
                }

                _logger.LogInformation($"?? ??????: ?????? {sourceTableCount} ????? ?????? ?????????? {backupTableCount} ????");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "??? ?? ?????? ?? ??? ????????");
                result["ValidationError"] = ex.Message;
            }

            return result;
        }

        /// <summary>
        /// ?????? ?? ???? ????? ??????
        /// </summary>
        public async Task<bool> DatabaseExistsAsync(string connectionString, string databaseName)
        {
            try
            {
                using var connection = new SqlConnection(connectionString);
                await connection.OpenAsync();

                var sql = "SELECT COUNT(*) FROM sys.databases WHERE name = @DatabaseName";
                using var command = new SqlCommand(sql, connection);
                command.Parameters.AddWithValue("@DatabaseName", databaseName);

                var count = (int)await command.ExecuteScalarAsync();
                return count > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"??? ?? ?????? ?? ???? ????? ???????? {databaseName}");
                return false;
            }
        }

        /// <summary>
        /// ?????? ??? connection string ?????? master
        /// </summary>
        private string GetMasterConnectionString(string connectionString)
        {
            var builder = new SqlConnectionStringBuilder(connectionString)
            {
                InitialCatalog = "master"
            };
            return builder.ConnectionString;
        }

        /// <summary>
        /// ??????? ??? ????? ???????? ?? connection string
        /// </summary>
        private string GetDatabaseNameFromConnectionString(string connectionString)
        {
            var builder = new SqlConnectionStringBuilder(connectionString);
            return builder.InitialCatalog;
        }
    }
}