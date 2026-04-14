using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Assets.DTOs.Common;
using Assets.Services.Interfaces;
using Assets.Attributes;

namespace Assets.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(IDashboardService dashboardService, ILogger<DashboardController> logger)
    {
        _dashboardService = dashboardService;
        _logger = logger;
    }

    /// <summary>
    /// Get main dashboard statistics
    /// </summary>
    [HttpGet("statistics")]
    [RequirePermission("Dashboard", "view")]
    public async Task<IActionResult> GetStatistics()
    {
        try
        {
            var stats = await _dashboardService.GetStatisticsAsync();
            return Ok(ApiResponse<object>.SuccessResponse(stats));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting dashboard statistics");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ???????? ???? ??????"));
        }
    }

    /// <summary>
    /// Get assets grouped by category
    /// </summary>
    [HttpGet("assets-by-category")]
    [RequirePermission("Dashboard", "view")]
    public async Task<IActionResult> GetAssetsByCategory()
    {
        try
        {
            var data = await _dashboardService.GetAssetsByCategoryAsync();
            return Ok(ApiResponse<object>.SuccessResponse(data));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting assets by category");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ?????? ??? ?????"));
        }
    }

    /// <summary>
    /// Get assets grouped by status
    /// </summary>
    [HttpGet("assets-by-status")]
    [RequirePermission("Dashboard", "view")]
    public async Task<IActionResult> GetAssetsByStatus()
    {
        try
        {
            var data = await _dashboardService.GetAssetsByStatusAsync();
            return Ok(ApiResponse<object>.SuccessResponse(data));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting assets by status");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ?????? ??? ??????"));
        }
    }

    /// <summary>
    /// Get recent activities
    /// </summary>
    [HttpGet("recent-activities")]
    [RequirePermission("Dashboard", "view")]
    public async Task<IActionResult> GetRecentActivities([FromQuery] int limit = 10)
    {
        try
        {
            var activities = await _dashboardService.GetRecentActivitiesAsync(limit);
            return Ok(ApiResponse<object>.SuccessResponse(activities));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recent activities");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ??????? ???????"));
        }
    }

    /// <summary>
    /// Get dashboard alerts
    /// </summary>
    [HttpGet("alerts")]
    [Authorize(Roles = "Super Admin,Admin,Manager,Employee,Viewer")]
    public async Task<IActionResult> GetAlerts()
    {
        try
        {
            var alerts = await _dashboardService.GetAlertsAsync();
            return Ok(ApiResponse<object>.SuccessResponse(alerts));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting dashboard alerts");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ??????? ???? ??????"));
        }
    }
}