using Microsoft.AspNetCore.Mvc;
using Assets.DTOs.Common;

namespace Assets.Controllers;

[ApiController]
[Route("api/debug")]
public class DebugController : ControllerBase
{
    private readonly ILogger<DebugController> _logger;

    public DebugController(ILogger<DebugController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Test all available controllers and their routes
    /// </summary>
    [HttpGet("controllers")]
    public IActionResult GetAvailableControllers()
    {
        _logger.LogInformation("?? Debug: Getting available controllers");

        var controllers = new[]
        {
            new { name = "Assets", baseRoute = "api/assets", testUrl = "/api/assets" },
            new { name = "Disposals", baseRoute = "api/disposals", testUrl = "/api/disposals/test" },
            new { name = "Departments", baseRoute = "api/departments", testUrl = "/api/departments" },
            new { name = "Employees", baseRoute = "api/employees", testUrl = "/api/employees" },
            new { name = "Categories", baseRoute = "api/categories", testUrl = "/api/categories" },
            new { name = "Warehouses", baseRoute = "api/warehouses", testUrl = "/api/warehouses" },
            new { name = "Transfers", baseRoute = "api/transfers", testUrl = "/api/transfers" },
            new { name = "Dashboard", baseRoute = "api/dashboard", testUrl = "/api/dashboard/statistics" },
            new { name = "Auth", baseRoute = "api/auth", testUrl = "/api/auth/login" }
        };

        return Ok(ApiResponse<object>.SuccessResponse(new
        {
            message = "Available controllers and test URLs",
            timestamp = DateTime.UtcNow,
            environment = Environment.MachineName,
            controllers = controllers
        }));
    }

    /// <summary>
    /// Test disposal enum directly
    /// </summary>
    [HttpGet("disposal-reasons")]
    public IActionResult GetDisposalReasonsDebug()
    {
        _logger.LogInformation("?? Debug: Testing disposal reasons enum directly");

        try
        {
            var reasons = Enum.GetValues<Assets.Enums.DisposalReason>()
                .Select(r => new { 
                    value = (int)r, 
                    label = r.ToString(),
                    description = GetDisposalReasonDescription(r)
                })
                .ToList();

            return Ok(ApiResponse<object>.SuccessResponse(new
            {
                message = "Disposal reasons enum test successful",
                count = reasons.Count,
                reasons = reasons
            }));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error testing disposal reasons");
            return BadRequest(ApiResponse<object>.ErrorResponse($"Error: {ex.Message}"));
        }
    }

    private string GetDisposalReasonDescription(Assets.Enums.DisposalReason reason)
    {
        return reason switch
        {
            Assets.Enums.DisposalReason.Damaged => "????",
            Assets.Enums.DisposalReason.Obsolete => "????",
            Assets.Enums.DisposalReason.Lost => "?????",
            Assets.Enums.DisposalReason.Stolen => "?????",
            Assets.Enums.DisposalReason.EndOfLife => "?????? ?????",
            Assets.Enums.DisposalReason.Maintenance => "????? ?????",
            Assets.Enums.DisposalReason.Replacement => "?? ????????",
            Assets.Enums.DisposalReason.Other => "????",
            _ => "??? ?????"
        };
    }

    /// <summary>
    /// Simple health check
    /// </summary>
    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new
        {
            status = "? Healthy",
            timestamp = DateTime.UtcNow,
            version = "1.0.0",
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development"
        });
    }
}