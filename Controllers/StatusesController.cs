using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Assets.DTOs.Status;
using Assets.DTOs.Common;
using Assets.Services.Interfaces;
using Assets.Attributes;

namespace Assets.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StatusesController : ControllerBase
{
    private readonly IStatusService _statusService;
    private readonly ILogger<StatusesController> _logger;

    public StatusesController(IStatusService statusService, ILogger<StatusesController> logger)
    {
        _statusService = statusService;
        _logger = logger;
    }

    /// <summary>
    /// Get all asset statuses (????? ??????)
    /// ????? ??????? ????? ??? ???????? ???
    /// </summary>
    [HttpGet]
    [RequirePermission("Assets", "view")]
    public async Task<IActionResult> GetStatuses()
    {
        try
        {
            var statuses = await _statusService.GetAllAsync();
            return Ok(ApiResponse<List<StatusDto>>.SuccessResponse(statuses));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting statuses");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ????? ??????"));
        }
    }

    /// <summary>
    /// Get status by ID
    /// </summary>
    [HttpGet("{id}")]
    [RequirePermission("Assets", "view")]
    public async Task<IActionResult> GetStatus(int id)
    {
        try
        {
            var status = await _statusService.GetByIdAsync(id);

            if (status == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("?????? ??? ??????"));
            }

            return Ok(ApiResponse<StatusDto>.SuccessResponse(status));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting status");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ??????"));
        }
    }

    /// <summary>
    /// Create new status (Admin only)
    /// ????? ???? ????? ???: "??? ?????"? "?????"? ???
    /// </summary>
    [HttpPost]
    [RequirePermission("Assets", "insert")]
    public async Task<IActionResult> CreateStatus([FromBody] CreateStatusDto dto)
    {
        try
        {
            var status = await _statusService.CreateAsync(dto);
            return CreatedAtAction(
                nameof(GetStatus),
                new { id = status.Id },
                ApiResponse<StatusDto>.SuccessResponse(status, "?? ????? ?????? ?????")
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating status");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ????? ??????"));
        }
    }

    /// <summary>
    /// Update status (Admin only)
    /// ????? ???? ??????
    /// </summary>
    [HttpPut("{id}")]
    [RequirePermission("Assets", "update")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
    {
        if (id != dto.Id)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("???? ?????? ??? ??????"));
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("???????? ??????? ??? ?????"));
        }

        try
        {
            var status = await _statusService.UpdateAsync(dto);
            return Ok(ApiResponse<StatusDto>.SuccessResponse(status, "?? ????? ?????? ?????"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating status with ID: {Id}", id);
            
            if (ex.Message.Contains("not found"))
            {
                return NotFound(ApiResponse<object>.ErrorResponse("?????? ??? ??????"));
            }
            
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ????? ??????"));
        }
    }

    /// <summary>
    /// Delete status (Admin only - soft delete)
    /// ??? ???? (?? ???? ????? ??? ???? ??????? ?? ????)
    /// </summary>
    [HttpDelete("{id}")]
    [RequirePermission("Assets", "delete")]
    public async Task<IActionResult> DeleteStatus(int id)
    {
        try
        {
            var success = await _statusService.DeleteAsync(id);

            if (!success)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("?????? ??? ??????"));
            }

            return Ok(ApiResponse<object>.SuccessResponse(null, "?? ??? ?????? ?????"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting status");
            
            // Check if it's the "status in use" exception
            if (ex.Message.Contains("???????"))
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
            }
            
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ??????"));
        }
    }

    /// <summary>
    /// Get all active statuses (for dropdowns)
    /// </summary>
    [HttpGet("active")]
    [RequirePermission("Assets", "view")]
    public async Task<IActionResult> GetActiveStatuses()
    {
        try
        {
            var statuses = await _statusService.GetActiveAsync();
            return Ok(ApiResponse<List<StatusDto>>.SuccessResponse(statuses));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active statuses");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ??????? ??????"));
        }
    }
}
