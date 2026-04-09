using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Assets.DTOs.Transfer;
using Assets.DTOs.Common;
using Assets.Services.Interfaces;

namespace Assets.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransfersController : ControllerBase
{
    private readonly ITransferService _transferService;
    private readonly ILogger<TransfersController> _logger;

    public TransfersController(ITransferService transferService, ILogger<TransfersController> logger)
    {
        _transferService = transferService;
        _logger = logger;
    }

    /// <summary>
    /// Get all transfers
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Super Admin,Admin,Manager,Employee,Viewer")]
    public async Task<IActionResult> GetTransfers(
        [FromQuery] int? assetId = null,
        [FromQuery] int? employeeId = null)
    {
        try
        {
            var transfers = await _transferService.GetAllAsync(assetId, employeeId);
            return Ok(ApiResponse<List<TransferDto>>.SuccessResponse(transfers));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting transfers");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ?????? ?????"));
        }
    }

    /// <summary>
    /// Get transfer by ID
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Roles = "Super Admin,Admin,Manager,Employee,Viewer")]
    public async Task<IActionResult> GetTransfer(int id)
    {
        try
        {
            var transfer = await _transferService.GetByIdAsync(id);

            if (transfer == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("????? ????? ??? ??????"));
            }

            return Ok(ApiResponse<TransferDto>.SuccessResponse(transfer));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting transfer");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ????? ?????"));
        }
    }

    /// <summary>
    /// Create new transfer (Direct execution - no approval needed)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,WarehouseKeeper")]
    public async Task<IActionResult> CreateTransfer([FromBody] CreateTransferDto dto)
    {
        try
        {
            var userId = GetUserIdFromToken();
            if (!userId.HasValue)
                return Unauthorized();

            var transfer = await _transferService.CreateTransferAsync(dto, userId.Value);
            return CreatedAtAction(
                nameof(GetTransfer),
                new { id = transfer.Id },
                ApiResponse<TransferDto>.SuccessResponse(transfer, "?? ??? ????? ?????")
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating transfer");
            return StatusCode(500, ApiResponse<object>.ErrorResponse($"??? ?? ??? ?????: {ex.Message}"));
        }
    }

    /// <summary>
    /// Get transfer history for specific asset
    /// </summary>
    [HttpGet("asset/{assetId}/history")]
    [Authorize(Roles = "Admin,WarehouseKeeper,Viewer")]
    public async Task<IActionResult> GetAssetTransferHistory(int assetId)
    {
        try
        {
            var history = await _transferService.GetTransferHistoryByAssetAsync(assetId);
            return Ok(ApiResponse<List<TransferDto>>.SuccessResponse(history));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting asset transfer history");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ??? ?????"));
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
