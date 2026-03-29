using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Assets.DTOs.Common;
using Assets.DTOs.Maintenance;
using Assets.Enums;
using Assets.Services.Interfaces;

namespace Assets.Controllers;

/// <summary>
/// ???? ?? ?????? ????? ?????? ????????
/// </summary>
[ApiController]
[Route("api/maintenance")]
public class MaintenanceController : ControllerBase
{
    private readonly IMaintenanceService _maintenanceService;
    private readonly ILogger<MaintenanceController> _logger;

    public MaintenanceController(IMaintenanceService maintenanceService, ILogger<MaintenanceController> logger)
    {
        _maintenanceService = maintenanceService;
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
    [Authorize(Roles = "Admin,WarehouseKeeper,Viewer")]
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
    [Authorize(Roles = "Admin,WarehouseKeeper,Viewer")]
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
    [Authorize(Roles = "Admin,WarehouseKeeper")]
    public async Task<IActionResult> CreateMaintenance([FromBody] CreateMaintenanceDto dto)
    {
        try
        {
            _logger.LogInformation("?? Creating maintenance record for Asset ID: {AssetId}", dto.AssetId);

            var userId = GetUserIdFromToken() ?? 1; // ??????? ????????
            _logger.LogInformation("?? Using User ID: {UserId} for maintenance", userId);

            var maintenance = await _maintenanceService.CreateAsync(dto, userId);

            _logger.LogInformation("? Maintenance record created successfully with ID: {Id}", maintenance.Id);

            return CreatedAtAction(
                nameof(GetMaintenance),
                new { id = maintenance.Id },
                ApiResponse<MaintenanceDto>.SuccessResponse(maintenance, "?? ????? ??? ??????? ?????")
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "? Error creating maintenance record: {Message}", ex.Message);
            return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error creating maintenance record: {ex.Message}"));
        }
    }

    /// <summary>
    /// ????? ??? ????? ?????
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,WarehouseKeeper")]
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
    [Authorize(Roles = "Admin,WarehouseKeeper")]
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
    [Authorize(Roles = "Admin,WarehouseKeeper")]
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
    [Authorize(Roles = "Admin,WarehouseKeeper,Viewer")]
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
    [Authorize(Roles = "Admin,WarehouseKeeper,Viewer")]
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
    [Authorize(Roles = "Admin,WarehouseKeeper,Viewer")]
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
    [Authorize(Roles = "Admin,WarehouseKeeper,Viewer")]
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
    [Authorize(Roles = "Admin,WarehouseKeeper")]
    public async Task<IActionResult> SchedulePreventiveMaintenance([FromBody] SchedulePreventiveMaintenanceDto dto)
    {
        try
        {
            var userId = GetUserIdFromToken() ?? 1;
            var maintenance = await _maintenanceService.SchedulePreventiveMaintenanceAsync(
                dto.AssetId, dto.ScheduledDate, dto.Description, dto.IntervalMonths, userId);

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
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteMaintenance(int id)
    {
        try
        {
            var userId = GetUserIdFromToken() ?? 1;
            var success = await _maintenanceService.DeleteAsync(id, userId);

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
    [Authorize(Roles = "Admin,WarehouseKeeper,Viewer")]
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
    [Authorize(Roles = "Admin,WarehouseKeeper,Viewer")]
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
    [Authorize(Roles = "Admin,WarehouseKeeper,Viewer")]
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
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
        {
            return userId;
        }
        return null;
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