using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Assets.DTOs.Disposal;
using Assets.DTOs.Common;
using Assets.Services.Interfaces;

namespace Assets.Controllers;

[ApiController]
[Route("api/disposal")]
[Route("api/disposals")]
[Authorize]
public class DisposalController : ControllerBase
{
    private readonly IDisposalService _disposalService;
    private readonly ILogger<DisposalController> _logger;

    public DisposalController(IDisposalService disposalService, ILogger<DisposalController> logger)
    {
        _disposalService = disposalService;
        _logger = logger;
        _logger.LogInformation("? DisposalController created successfully");
    }

    /// <summary>
    /// Test endpoint to check if controller is working
    /// </summary>
    [HttpGet("test")]
    public IActionResult Test()
    {
        _logger.LogInformation("?? DisposalController Test endpoint called");
        return Ok(new { 
            message = "? DisposalController is working!", 
            timestamp = DateTime.UtcNow,
            controllerName = "DisposalController",
            routes = new[] { "api/disposal", "api/disposals" }
        });
    }

    /// <summary>
    /// Get disposal reasons enum values
    /// </summary>
    [HttpGet("reasons")]
    [Authorize(Roles = "Super Admin,Admin,Manager,Employee,Viewer")]
    public IActionResult GetDisposalReasons()
    {
        try
        {
            _logger.LogInformation("📋 Getting disposal reasons...");
            
            var reasons = Enum.GetValues<Assets.Enums.DisposalReason>()
                .Select(r => new { value = (int)r, label = GetDisposalReasonText(r) })
                .ToList();
            
            _logger.LogInformation($"✅ Found {reasons.Count} disposal reasons");
            
            return Ok(ApiResponse<object>.SuccessResponse(reasons, "Disposal reasons loaded successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error getting disposal reasons: {Message}", ex.Message);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Error getting disposal reasons"));
        }
    }

    private static string GetDisposalReasonText(Assets.Enums.DisposalReason reason)
    {
        return reason switch
        {
            Assets.Enums.DisposalReason.Damaged => "تالف/معطوب",
            Assets.Enums.DisposalReason.Obsolete => "قديم/غير صالح للاستخدام",
            Assets.Enums.DisposalReason.Lost => "مفقود",
            Assets.Enums.DisposalReason.Stolen => "مسروق",
            Assets.Enums.DisposalReason.EndOfLife => "انتهاء العمر الافتراضي",
            Assets.Enums.DisposalReason.Maintenance => "صيانة وإصلاح شامل",
            Assets.Enums.DisposalReason.Replacement => "تم الاستبدال",
            Assets.Enums.DisposalReason.Other => "أخرى",
            _ => reason.ToString()
        };
    }

    /// <summary>
    /// Get all disposal records
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Super Admin,Admin,Manager,Employee,Viewer")]
    public async Task<IActionResult> GetDisposals([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, 
        [FromQuery] string? searchTerm = null, [FromQuery] int? disposalReason = null,
        [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        try 
        {
            var disposals = await _disposalService.GetAllAsync(pageNumber, pageSize, searchTerm, disposalReason, startDate, endDate);
            return Ok(ApiResponse<PagedResult<DisposalDto>>.SuccessResponse(disposals));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting disposals");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Error getting disposals"));
        }
    }

    /// <summary>
    /// Get disposal record by ID
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Roles = "Super Admin,Admin,Manager,Employee,Viewer")]
    public async Task<IActionResult> GetDisposal(int id)
    {
        try
        {
            var disposal = await _disposalService.GetByIdAsync(id);

            if (disposal == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("Disposal record not found"));
            }

            return Ok(ApiResponse<DisposalDto>.SuccessResponse(disposal));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting disposal");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Error getting disposal"));
        }
    }

    /// <summary>
    /// Create disposal
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Super Admin,Admin,Manager")]
    public async Task<IActionResult> CreateDisposal([FromBody] CreateDisposalDto dto)
    {
        try
        {
            _logger.LogInformation($"??? Creating disposal for Asset ID: {dto.AssetId}");
            
            var userId = GetUserIdFromToken() ?? 1; // ??????? ????????
            
            _logger.LogInformation($"?? Using User ID: {userId} for disposal");

            var disposal = await _disposalService.CreateDisposalAsync(dto, userId);
            
            _logger.LogInformation($"? Disposal created successfully with ID: {disposal.Id}");
            
            return CreatedAtAction(
                nameof(GetDisposal),
                new { id = disposal.Id },
                ApiResponse<DisposalDto>.SuccessResponse(disposal, "?? ????? ????? ?????")
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "? Error creating disposal: {Message}", ex.Message);
            return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error creating disposal: {ex.Message}"));
        }
    }

    /// <summary>
    /// Get disposed assets count for dashboard
    /// </summary>
    [HttpGet("count")]
    [Authorize(Roles = "Super Admin,Admin,Manager,Employee,Viewer")]
    public async Task<IActionResult> GetDisposedAssetsCount()
    {
        try
        {
            var count = await _disposalService.GetDisposedAssetsCountAsync();
            return Ok(ApiResponse<int>.SuccessResponse(count));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting disposed assets count");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("Error getting disposed assets count"));
        }
    }

    private int? GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
        {
            return userId;
        }
        return null;
    }
}
