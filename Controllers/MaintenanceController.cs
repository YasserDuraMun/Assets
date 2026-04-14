using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Assets.DTOs.Common;
using Assets.DTOs.Maintenance;
using Assets.Enums;
using Assets.Services.Interfaces;
using Assets.Attributes;

namespace Assets.Controllers;

/// <summary>
/// ???? ?? ?????? ????? ?????? ????????
/// </summary>
[ApiController]
[Route("api/maintenance")]
public class MaintenanceController : ControllerBase
{
    private readonly IMaintenanceService _maintenanceService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<MaintenanceController> _logger;

    public MaintenanceController(
        IMaintenanceService maintenanceService, 
        ICurrentUserService currentUserService,
        ILogger<MaintenanceController> logger)
    {
        _maintenanceService = maintenanceService;
        _currentUserService = currentUserService;
        _logger = logger;
        _logger.LogInformation("? MaintenanceController created successfully");
    }

    /// <summary>
    /// Test endpoint ?????? ?? ??? ???????
    /// </summary>
    [HttpGet("test")]
    public IActionResult Test()
    {
        _logger.LogInformation("?? MaintenanceController Test endpoint called");
        return Ok(new
        {
            message = "? MaintenanceController is working!",
            timestamp = DateTime.UtcNow,
            controllerName = "MaintenanceController",
            routes = new[] { "api/maintenance" }
        });
    }

    /// <summary>
    /// ?????? ??? ???? ????? ???????
    /// </summary>
    [HttpGet]
    [RequirePermission("Maintenance", "view")]
    public async Task<IActionResult> GetMaintenance([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null, [FromQuery] int? assetId = null,
        [FromQuery] MaintenanceType? maintenanceType = null, [FromQuery] MaintenanceStatus? status = null,
        [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        try
        {
            _logger.LogInformation("?? Getting maintenance records with filters: search={SearchTerm}, assetId={AssetId}", 
                searchTerm, assetId);

            var result = await _maintenanceService.GetAllAsync(pageNumber, pageSize, searchTerm, assetId, 
                maintenanceType, status, startDate, endDate);

            return Ok(ApiResponse<PagedResult<MaintenanceListDto>>.SuccessResponse(result));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "? Error getting maintenance records");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Error getting maintenance records"));
        }
    }

    /// <summary>
    /// ?????? ??? ??? ????? ???????
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,WarehouseKeeper,Viewer")]
    public async Task<IActionResult> GetMaintenance(int id)
    {
        try
        {
            var maintenance = await _maintenanceService.GetByIdAsync(id);

            if (maintenance == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("??? ??????? ??? ?????"));
            }

            return Ok(ApiResponse<MaintenanceDto>.SuccessResponse(maintenance));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "? Error getting maintenance record {Id}", id);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Error getting maintenance record"));
        }
    }

    /// <summary>
    /// ?????? ??? ????? ????? ??? ????
    /// </summary>
    [HttpGet("asset/{assetId}")]
    [RequirePermission("Maintenance", "view")]
    public async Task<IActionResult> GetMaintenanceByAsset(int assetId)
    {
        try
        {
            var maintenance = await _maintenanceService.GetByAssetIdAsync(assetId);
            return Ok(ApiResponse<List<MaintenanceListDto>>.SuccessResponse(maintenance));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "? Error getting maintenance records for asset {AssetId}", assetId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Error getting asset maintenance records"));
        }
    }

    /// <summary>
    /// ????? ??? ????? ????
    /// </summary>
    [HttpPost]
    [RequirePermission("Maintenance", "insert")]
    public async Task<IActionResult> CreateMaintenance([FromBody] CreateMaintenanceDto dto)
    {
        try
        {
            _logger.LogInformation("🔧 [MAINTENANCE] Starting maintenance creation for Asset ID: {AssetId}", dto.AssetId);
            _logger.LogInformation("🔧 [MAINTENANCE] Request data: {@RequestData}", new { 
                AssetId = dto.AssetId, 
                MaintenanceType = dto.MaintenanceType, 
                Description = dto.Description?.Length > 50 ? dto.Description.Substring(0, 50) + "..." : dto.Description,
                MaintenanceDate = dto.MaintenanceDate
            });

            // Method 1: Try CurrentUserService
            int? userId = null;
            
            try
            {
                userId = _currentUserService?.UserId;
                if (userId.HasValue)
                {
                    _logger.LogInformation("✅ [MAINTENANCE] Method 1 SUCCESS: CurrentUserService.UserId = {UserId}", userId);
                }
                else
                {
                    _logger.LogWarning("⚠️ [MAINTENANCE] Method 1 FAILED: CurrentUserService.UserId is null");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ [MAINTENANCE] Method 1 EXCEPTION: CurrentUserService failed");
            }

            // Method 2: Try GetUserIdFromToken if Method 1 failed
            if (!userId.HasValue)
            {
                try
                {
                    userId = GetUserIdFromToken();
                    if (userId.HasValue)
                    {
                        _logger.LogInformation("✅ [MAINTENANCE] Method 2 SUCCESS: GetUserIdFromToken = {UserId}", userId);
                    }
                    else
                    {
                        _logger.LogWarning("⚠️ [MAINTENANCE] Method 2 FAILED: GetUserIdFromToken returned null");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ [MAINTENANCE] Method 2 EXCEPTION: GetUserIdFromToken failed");
                }
            }

            // Method 3: Try direct token parsing as last resort
            if (!userId.HasValue)
            {
                try
                {
                    var nameIdentifierClaim = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                    var userIdClaim = User?.FindFirst("userId")?.Value;
                    var subClaim = User?.FindFirst("sub")?.Value;
                    
                    _logger.LogInformation("🔍 [MAINTENANCE] Method 3: Direct claims analysis - NameIdentifier: {NameId}, UserId: {UserId}, Sub: {Sub}", 
                        nameIdentifierClaim, userIdClaim, subClaim);
                    
                    var claimValue = nameIdentifierClaim ?? userIdClaim ?? subClaim;
                    if (!string.IsNullOrEmpty(claimValue) && int.TryParse(claimValue, out int parsedUserId))
                    {
                        userId = parsedUserId;
                        _logger.LogInformation("✅ [MAINTENANCE] Method 3 SUCCESS: Direct parsing = {UserId} from claim '{ClaimValue}'", userId, claimValue);
                    }
                    else
                    {
                        _logger.LogError("❌ [MAINTENANCE] Method 3 FAILED: No valid user ID found in claims");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ [MAINTENANCE] Method 3 EXCEPTION: Direct token parsing failed");
                }
            }

            // Final validation
            if (!userId.HasValue)
            {
                _logger.LogError("❌ [MAINTENANCE] ALL METHODS FAILED: Cannot extract user ID - returning 401");
                return Unauthorized(ApiResponse<object>.ErrorResponse("User authentication failed - cannot determine user ID"));
            }

            _logger.LogInformation("🔧 [MAINTENANCE] Final User ID: {UserId}, User Email: {Email}", userId, _currentUserService?.Email ?? "Unknown");

            // Create maintenance record
            _logger.LogInformation("🔧 [MAINTENANCE] Calling MaintenanceService.CreateAsync...");
            var maintenance = await _maintenanceService.CreateAsync(dto, userId.Value);
            
            

_logger.LogInformation("✅ [MAINTENANCE] SUCCESS: Created maintenance record with ID: {MaintenanceId}", maintenance.Id);

            return CreatedAtAction(
                nameof(GetMaintenance),
                new { id = maintenance.Id },
                ApiResponse<MaintenanceDto>.SuccessResponse(maintenance, "تم إنشاء سجل الصيانة بنجاح")
            );
        }
        catch (Exception ex)
        {
            _logger.LogError("❌ [MAINTENANCE] FATAL ERROR creating maintenance record:");
            _logger.LogError("❌ [MAINTENANCE] Main Exception: {Message}", ex.Message);
            _logger.LogError("❌ [MAINTENANCE] Exception Type: {Type}", ex.GetType().Name);
            
            // Log inner exception details
            if (ex.InnerException != null)
            {
                _logger.LogError("❌ [MAINTENANCE] Inner Exception: {InnerMessage}", ex.InnerException.Message);
                _logger.LogError("❌ [MAINTENANCE] Inner Exception Type: {InnerType}", ex.InnerException.GetType().Name);
                
                // Check for specific database exceptions
                var currentException = ex.InnerException;
                while (currentException != null)
                {
                    _logger.LogError("❌ [MAINTENANCE] Exception Level: {Message} ({Type})", 
                        currentException.Message, currentException.GetType().Name);
                    currentException = currentException.InnerException;
                }
            }
            
            // Log stack trace for debugging
            _logger.LogError("❌ [MAINTENANCE] Stack Trace: {StackTrace}", ex.StackTrace);
            
            // Try to extract specific Entity Framework errors
            if (ex is Microsoft.EntityFrameworkCore.DbUpdateException dbUpdateEx)
            {
                _logger.LogError("❌ [MAINTENANCE] DbUpdateException Details:");
                foreach (var entry in dbUpdateEx.Entries)
                {
                    _logger.LogError("❌ [MAINTENANCE] Failed Entity: {EntityType}, State: {State}", 
                        entry.Entity.GetType().Name, entry.State);
                }
            }
            
            return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error creating maintenance record: {ex.Message}. Inner: {ex.InnerException?.Message}"));
        }
    }

    /// <summary>
    /// ????? ??? ????? ?????
    /// </summary>
    [HttpPut("{id}")]
    [RequirePermission("Maintenance", "update")]
    public async Task<IActionResult> UpdateMaintenance(int id, [FromBody] UpdateMaintenanceDto dto)
    {
        if (id != dto.Id)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("ID mismatch"));
        }

        try
        {
            var userId = GetUserIdFromToken() ?? 1;
            var maintenance = await _maintenanceService.UpdateAsync(dto, userId);

            return Ok(ApiResponse<MaintenanceDto>.SuccessResponse(maintenance, "?? ????? ??? ??????? ?????"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "? Error updating maintenance record {Id}: {Message}", id, ex.Message);
            return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error updating maintenance record: {ex.Message}"));
        }
    }

    /// <summary>
    /// ????? ???????
    /// </summary>
    [HttpPost("{id}/complete")]
    [RequirePermission("Maintenance", "update")]
    public async Task<IActionResult> CompleteMaintenance(int id, [FromBody] CompleteMaintenanceDto dto)
    {
        if (id != dto.Id)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("ID mismatch"));
        }

        try
        {
            var userId = GetUserIdFromToken() ?? 1;
            var maintenance = await _maintenanceService.CompleteMaintenanceAsync(dto, userId);

            return Ok(ApiResponse<MaintenanceDto>.SuccessResponse(maintenance, "?? ????? ??????? ?????"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "? Error completing maintenance {Id}: {Message}", id, ex.Message);
            return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error completing maintenance: {ex.Message}"));
        }
    }

    /// <summary>
    /// ????? ??????? ????????
    /// </summary>
    [HttpPost("{id}/cancel")]
    [RequirePermission("Maintenance", "delete")]
    public async Task<IActionResult> CancelMaintenance(int id, [FromBody] CancelMaintenanceRequest request)
    {
        try
        {
            var userId = GetUserIdFromToken() ?? 1;
            var success = await _maintenanceService.CancelMaintenanceAsync(id, userId, request.Reason);

            if (!success)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("??? ??????? ??? ?????"));
            }

            return Ok(ApiResponse<object>.SuccessResponse(null, "?? ????? ??????? ?????"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "? Error cancelling maintenance {Id}: {Message}", id, ex.Message);
            return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error cancelling maintenance: {ex.Message}"));
        }
    }

    /// <summary>
    /// ?????? ??? ???????? ????????
    /// </summary>
    [HttpGet("upcoming")]
    [RequirePermission("Maintenance", "view")]
    public async Task<IActionResult> GetUpcomingMaintenance([FromQuery] int days = 30)
    {
        try
        {
            var maintenance = await _maintenanceService.GetUpcomingMaintenanceAsync(days);
            return Ok(ApiResponse<List<MaintenanceListDto>>.SuccessResponse(maintenance));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "? Error getting upcoming maintenance");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Error getting upcoming maintenance"));
        }
    }

    /// <summary>
    /// ?????? ??? ???????? ????????
    /// </summary>
    [HttpGet("overdue")]
    [RequirePermission("Maintenance", "view")]
    public async Task<IActionResult> GetOverdueMaintenance()
    {
        try
        {
            var maintenance = await _maintenanceService.GetOverdueMaintenanceAsync();
            return Ok(ApiResponse<List<MaintenanceListDto>>.SuccessResponse(maintenance));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "? Error getting overdue maintenance");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Error getting overdue maintenance"));
        }
    }

    /// <summary>
    /// ?????? ??? ???????? ???????
    /// </summary>
    [HttpGet("stats")]
    [RequirePermission("Maintenance", "view")]
    public async Task<IActionResult> GetMaintenanceStats()
    {
        try
        {
            var stats = await _maintenanceService.GetMaintenanceStatsAsync();
            return Ok(ApiResponse<MaintenanceStatsDto>.SuccessResponse(stats));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "? Error getting maintenance statistics");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Error getting maintenance statistics"));
        }
    }

    /// <summary>
    /// ?????? ??? ???????? ????? ??? ????
    /// </summary>
    [HttpGet("stats/asset/{assetId}")]
    [RequirePermission("Maintenance", "view")]
    public async Task<IActionResult> GetAssetMaintenanceStats(int assetId)
    {
        try
        {
            var stats = await _maintenanceService.GetAssetMaintenanceStatsAsync(assetId);
            return Ok(ApiResponse<AssetMaintenanceStatsDto>.SuccessResponse(stats));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "? Error getting asset maintenance statistics for {AssetId}", assetId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Error getting asset maintenance statistics"));
        }
    }

    /// <summary>
    /// ????? ????? ??????
    /// </summary>
    [HttpPost("schedule-preventive")]
    [RequirePermission("Maintenance", "insert")]
    public async Task<IActionResult> SchedulePreventiveMaintenance([FromBody] SchedulePreventiveMaintenanceDto dto)
    {
        try
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
            {
                _logger.LogWarning("⚠️ No user ID found in token for preventive maintenance scheduling");
                return Unauthorized(ApiResponse<object>.ErrorResponse("User not authenticated"));
            }

            var maintenance = await _maintenanceService.SchedulePreventiveMaintenanceAsync(
                dto.AssetId, dto.ScheduledDate, dto.Description, dto.IntervalMonths, userId.Value);

            return CreatedAtAction(
                nameof(GetMaintenance),
                new { id = maintenance.Id },
                ApiResponse<MaintenanceDto>.SuccessResponse(maintenance, "?? ????? ??????? ???????? ?????")
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "? Error scheduling preventive maintenance: {Message}", ex.Message);
            return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error scheduling preventive maintenance: {ex.Message}"));
        }
    }

    /// <summary>
    /// ??? ??? ????? (??????? ???)
    /// </summary>
    [HttpDelete("{id}")]
    [RequirePermission("Maintenance", "delete")]
    public async Task<IActionResult> DeleteMaintenance(int id)
    {
        try
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
            {
                _logger.LogWarning("⚠️ No user ID found in token for maintenance deletion");
                return Unauthorized(ApiResponse<object>.ErrorResponse("User not authenticated"));
            }

            var success = await _maintenanceService.DeleteAsync(id, userId.Value);

            if (!success)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("??? ??????? ??? ?????"));
            }

            return Ok(ApiResponse<object>.SuccessResponse(null, "?? ??? ??? ??????? ?????"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "? Error deleting maintenance record {Id}: {Message}", id, ex.Message);
            return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error deleting maintenance record: {ex.Message}"));
        }
    }

    /// <summary>
    /// ?????? ??? ????? ????? ????
    /// </summary>
    [HttpGet("report/monthly")]
    [RequirePermission("Maintenance", "view")]
    public async Task<IActionResult> GetMonthlyReport([FromQuery] int year, [FromQuery] int month)
    {
        try
        {
            var report = await _maintenanceService.GetMonthlyMaintenanceReportAsync(year, month);
            return Ok(ApiResponse<object>.SuccessResponse(report));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "? Error getting monthly maintenance report for {Year}-{Month}", year, month);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Error generating monthly report"));
        }
    }

    /// <summary>
    /// ?????? ??? ????? ???????
    /// </summary>
    [HttpGet("types")]
    [RequirePermission("Maintenance", "view")]
    public IActionResult GetMaintenanceTypes()
    {
        try
        {
            var types = _maintenanceService.GetMaintenanceTypes();
            return Ok(ApiResponse<List<object>>.SuccessResponse(types));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "? Error getting maintenance types");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Error getting maintenance types"));
        }
    }

    /// <summary>
    /// ?????? ??? ????? ???????
    /// </summary>
    [HttpGet("statuses")]
    [RequirePermission("Maintenance", "view")]
    public IActionResult GetMaintenanceStatuses()
    {
        try
        {
            var statuses = _maintenanceService.GetMaintenanceStatuses();
            return Ok(ApiResponse<List<object>>.SuccessResponse(statuses));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "? Error getting maintenance statuses");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Error getting maintenance statuses"));
        }
    }

    #region Helper Methods

    private int? GetUserIdFromToken()
    {
        try
        {
            // Try multiple claim types for user ID
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                           ?? User.FindFirst("userId")?.Value
                           ?? User.FindFirst("sub")?.Value;

            if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int userId))
            {
                _logger.LogInformation("✅ Successfully extracted user ID: {UserId} from token", userId);
                return userId;
            }

            _logger.LogWarning("⚠️ Could not extract user ID from token. Available claims:");
            foreach (var claim in User.Claims)
            {
                _logger.LogWarning("   Claim: {Type} = {Value}", claim.Type, claim.Value);
            }

            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error extracting user ID from token");
            return null;
        }
    }

    #endregion
}

/// <summary>
/// ??? ????? ???????
/// </summary>
public class CancelMaintenanceRequest
{
    public string? Reason { get; set; }
}

/// <summary>
/// DTO ?????? ??????? ????????
/// </summary>
public class SchedulePreventiveMaintenanceDto
{
    [Required]
    public int AssetId { get; set; }

    [Required]
    public DateTime ScheduledDate { get; set; }

    [Required]
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [System.ComponentModel.DataAnnotations.Range(1, 60, ErrorMessage = "???? ??????? ??? ?? ???? ??? 1 ? 60 ???")]
    public int IntervalMonths { get; set; }
}