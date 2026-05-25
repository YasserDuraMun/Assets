using Microsoft.AspNetCore.Mvc;
using Assets.Services.Interfaces;

namespace Assets.Controllers
{
    /// <summary>
    /// ???????? ????? ????? ????????
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class DatabaseManagementController : ControllerBase
    {
        private readonly IDatabaseManagementService _databaseService;
        private readonly ILogger<DatabaseManagementController> _logger;

        public DatabaseManagementController(
            IDatabaseManagementService databaseService,
            ILogger<DatabaseManagementController> logger)
        {
            _databaseService = databaseService;
            _logger = logger;
        }

        /// <summary>
        /// ????? ?????? ?????????? ???????
        /// </summary>
        [HttpPost("backup")]
        public async Task<IActionResult> CreateBackup([FromBody] BackupRequest request)
        {
            try
            {
                _logger.LogInformation("?? ??? ????? ???? ????????");

                // Connection Strings
                var sourceConnectionString = "Data Source=10.0.0.17;Initial Catalog=Assets;User ID=sa;Password=Dur@123456;Connect Timeout=30;Encrypt=True;Trust Server Certificate=True;Application Intent=ReadWrite;Multi Subnet Failover=False";
                var backupConnectionString = "Data Source=10.0.0.17;Initial Catalog=AssetsBackup;User ID=sa;Password=Dur@123456;Connect Timeout=30;Encrypt=True;Trust Server Certificate=True;Application Intent=ReadWrite;Multi Subnet Failover=False";

                // ????? ????? ???????? ?????
                var databasesToDelete = new List<string> { "AssetTST" };

                // ????? ???????
                var result = await _databaseService.PerformBackupOperationAsync(
                    sourceConnectionString,
                    backupConnectionString,
                    databasesToDelete);

                if (result.IsSuccess)
                {
                    _logger.LogInformation("? ??? ????? ????? ????????? ?????");
                    return Ok(new
                    {
                        success = true,
                        message = result.Message,
                        executedSteps = result.ExecutedSteps,
                        duration = result.Duration.TotalSeconds,
                        details = result.Details
                    });
                }
                else
                {
                    _logger.LogError("? ???? ????? ????? ?????????");
                    return BadRequest(new
                    {
                        success = false,
                        message = result.Message,
                        errors = result.Errors,
                        executedSteps = result.ExecutedSteps
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "??? ?? API ????? ?????????");
                return StatusCode(500, new
                {
                    success = false,
                    message = "??? ??? ????? ?? ??????",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// ??? ???? ????? ????????
        /// </summary>
        [HttpGet("status")]
        public async Task<IActionResult> GetDatabaseStatus()
        {
            try
            {
                var databases = new Dictionary<string, object>();

                var connectionStrings = new[]
                {
                    ("Assets", "Data Source=10.0.0.17;Initial Catalog=Assets;User ID=sa;Password=Dur@123456;Connect Timeout=30;Encrypt=True;Trust Server Certificate=True"),
                    ("AssetsBackup", "Data Source=10.0.0.17;Initial Catalog=AssetsBackup;User ID=sa;Password=Dur@123456;Connect Timeout=30;Encrypt=True;Trust Server Certificate=True"),
                    ("AssetTST", "Data Source=10.0.0.17;Initial Catalog=AssetTST;User ID=sa;Password=Dur@123456;Connect Timeout=30;Encrypt=True;Trust Server Certificate=True")
                };

                var masterConnection = "Data Source=10.0.0.17;Initial Catalog=master;User ID=sa;Password=Dur@123456;Connect Timeout=30;Encrypt=True;Trust Server Certificate=True";

                foreach (var (dbName, connString) in connectionStrings)
                {
                    var exists = await _databaseService.DatabaseExistsAsync(masterConnection, dbName);
                    databases[dbName] = new { exists = exists };
                }

                return Ok(new
                {
                    success = true,
                    databases = databases,
                    timestamp = DateTime.Now
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "??? ?? ??? ???? ????? ????????");
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        /// <summary>
        /// ??? ????? ?????? ?????
        /// </summary>
        [HttpDelete("delete/{databaseName}")]
        public async Task<IActionResult> DeleteDatabase(string databaseName)
        {
            try
            {
                // ????? ????? ????? ???????? ??????? ?????
                var allowedDatabases = new[] { "AssetTST", "AssetsBackup" };
                if (!allowedDatabases.Contains(databaseName))
                {
                    return BadRequest(new { success = false, message = $"??? ????? ??? ????? ????????: {databaseName}" });
                }

                var masterConnection = "Data Source=10.0.0.17;Initial Catalog=master;User ID=sa;Password=Dur@123456;Connect Timeout=30;Encrypt=True;Trust Server Certificate=True";

                var deleted = await _databaseService.SafeDeleteDatabaseAsync(masterConnection, databaseName);

                return Ok(new
                {
                    success = deleted,
                    message = deleted ? $"?? ??? ????? ???????? {databaseName}" : $"????? ???????? {databaseName} ??? ??????",
                    databaseName = databaseName
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"??? ?? ??? ????? ???????? {databaseName}");
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }
    }

    /// <summary>
    /// ????? ??? ?????? ??????????
    /// </summary>
    public class BackupRequest
    {
        public string? SourceDatabase { get; set; } = "Assets";
        public string? BackupDatabase { get; set; } = "AssetsBackup";
        public List<string>? DatabasesToDelete { get; set; }
    }
}