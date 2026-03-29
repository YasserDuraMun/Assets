using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Assets.DTOs.Warehouse;
using Assets.DTOs.Common;
using Assets.Services.Interfaces;

namespace Assets.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WarehousesController : ControllerBase
{
    private readonly IWarehouseService _warehouseService;
    private readonly ILogger<WarehousesController> _logger;

    public WarehousesController(IWarehouseService warehouseService, ILogger<WarehousesController> logger)
    {
        _warehouseService = warehouseService;
        _logger = logger;
    }

    /// <summary>
    /// Get all warehouses
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,WarehouseKeeper,Viewer")]
    public async Task<IActionResult> GetWarehouses()
    {
        try
        {
            var warehouses = await _warehouseService.GetAllAsync();
            return Ok(ApiResponse<List<WarehouseDto>>.SuccessResponse(warehouses));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting warehouses");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ??????????"));
        }
    }

    /// <summary>
    /// Get warehouse by ID
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,WarehouseKeeper,Viewer")]
    public async Task<IActionResult> GetWarehouse(int id)
    {
        try
        {
            var warehouse = await _warehouseService.GetByIdAsync(id);

            if (warehouse == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("???????? ??? ?????"));
            }

            return Ok(ApiResponse<WarehouseDto>.SuccessResponse(warehouse));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting warehouse");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ????????"));
        }
    }

    /// <summary>
    /// Create new warehouse
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,WarehouseKeeper")]
    public async Task<IActionResult> CreateWarehouse([FromBody] CreateWarehouseDto dto)
    {
        try
        {
            var warehouse = await _warehouseService.CreateAsync(dto);
            return CreatedAtAction(
                nameof(GetWarehouse),
                new { id = warehouse.Id },
                ApiResponse<WarehouseDto>.SuccessResponse(warehouse, "?? ????? ???????? ?????")
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating warehouse");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ????? ????????"));
        }
    }

    /// <summary>
    /// Update warehouse
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,WarehouseKeeper")]
    public async Task<IActionResult> UpdateWarehouse(int id, [FromBody] UpdateWarehouseDto dto)
    {
        if (id != dto.Id)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("???? ???????? ??? ??????"));
        }

        try
        {
            var warehouse = await _warehouseService.UpdateAsync(dto);
            return Ok(ApiResponse<WarehouseDto>.SuccessResponse(warehouse, "?? ????? ???????? ?????"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating warehouse");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ????? ????????"));
        }
    }

    /// <summary>
    /// Delete warehouse (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteWarehouse(int id)
    {
        try
        {
            var success = await _warehouseService.DeleteAsync(id);

            if (!success)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("???????? ??? ?????"));
            }

            return Ok(ApiResponse<object>.SuccessResponse(null, "?? ??? ???????? ?????"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting warehouse");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ????????"));
        }
    }

    /// <summary>
    /// Get all active warehouses (for dropdowns)
    /// </summary>
    [HttpGet("active")]
    [Authorize(Roles = "Admin,WarehouseKeeper,Viewer")]
    public async Task<IActionResult> GetActiveWarehouses()
    {
        try
        {
            var warehouses = await _warehouseService.GetActiveAsync();
            return Ok(ApiResponse<List<WarehouseDto>>.SuccessResponse(warehouses));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active warehouses");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ????????? ????????"));
        }
    }
}
