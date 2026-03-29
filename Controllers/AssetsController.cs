using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Assets.DTOs.Asset;
using Assets.DTOs.Common;
using Assets.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Assets.Data;

namespace Assets.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AssetsController : ControllerBase
{
    private readonly IAssetService _assetService;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AssetsController> _logger;

    public AssetsController(IAssetService assetService, ApplicationDbContext context, ILogger<AssetsController> logger)
    {
        _assetService = assetService;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// ?????? ??????? ?????? ????????
    /// </summary>
    [HttpGet("test-connection")]
    [AllowAnonymous]
    public async Task<IActionResult> TestConnection()
    {
        try
        {
            var canConnect = await _context.Database.CanConnectAsync();
            
            if (canConnect)
            {
                return Ok(new 
                { 
                    success = true,
                    message = "?? ??????? ?????? ???????? ?????!",
                    database = _context.Database.GetDbConnection().Database,
                    server = _context.Database.GetDbConnection().DataSource
                });
            }
            else
            {
                return BadRequest(new 
                { 
                    success = false,
                    message = "??? ??????? ?????? ????????"
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "??? ?? ??????? ?????? ????????");
            return StatusCode(500, new 
            { 
                success = false,
                message = "??? ?? ??????? ?????? ????????",
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// ?????? ??? ???? ?????? ?? pagination ??????
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,WarehouseKeeper,Viewer")]
    public async Task<IActionResult> GetAssets(
        [FromQuery] int pageNumber = 1, 
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] int? categoryId = null,
        [FromQuery] int? statusId = null)
    {
        try
        {
            var result = await _assetService.GetAllAsync(pageNumber, pageSize, search, categoryId, statusId);
            return Ok(ApiResponse<PagedResult<AssetListDto>>.SuccessResponse(result));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "??? ?? ??? ??????");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ??????"));
        }
    }

    /// <summary>
    /// ?????? ??? ??? ????
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,WarehouseKeeper,Viewer")]
    public async Task<IActionResult> GetAsset(int id, [FromQuery] bool includeDeleted = false)
    {
        try
        {
            var asset = await _assetService.GetByIdAsync(id, includeDeleted);

            if (asset == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("????? ??? ?????"));
            }

            return Ok(ApiResponse<AssetDto>.SuccessResponse(asset));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "??? ?? ??? ?????");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ?????"));
        }
    }

    /// <summary>
    /// ????? ??? ????
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,WarehouseKeeper")]
    public async Task<IActionResult> CreateAsset([FromBody] CreateAssetDto dto)
    {
        try
        {
            _logger.LogInformation("Creating asset with data: {@Dto}", dto);
            
            var userId = GetUserIdFromToken();
            if (!userId.HasValue)
                return Unauthorized();

            var asset = await _assetService.CreateAsync(dto, userId.Value);
            return CreatedAtAction(nameof(GetAsset), new { id = asset.Id }, ApiResponse<AssetDto>.SuccessResponse(asset, "?? ????? ????? ?????"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating asset. DTO: {@Dto}", dto);
            return BadRequest(ApiResponse<object>.ErrorResponse($"??? ?? ????? ?????: {ex.Message}"));
        }
    }

    /// <summary>
    /// ????? ??? ?????
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,WarehouseKeeper")]
    public async Task<IActionResult> UpdateAsset(int id, [FromBody] UpdateAssetDto dto)
    {
        if (id != dto.Id)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("???? ????? ??? ??????"));
        }

        try
        {
            var userId = GetUserIdFromToken();
            if (!userId.HasValue)
                return Unauthorized();

            var asset = await _assetService.UpdateAsync(dto, userId.Value);
            return Ok(ApiResponse<AssetDto>.SuccessResponse(asset, "?? ????? ????? ?????"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "??? ?? ????? ?????");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ????? ?????"));
        }
    }

    /// <summary>
    /// ??? ???
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,WarehouseKeeper")]
    public async Task<IActionResult> DeleteAsset(int id)
    {
        try
        {
            var userId = GetUserIdFromToken();
            if (!userId.HasValue)
                return Unauthorized();

            var success = await _assetService.DeleteAsync(id, userId.Value);

            if (!success)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("????? ??? ?????"));
            }

            return Ok(ApiResponse<object>.SuccessResponse(null, "?? ??? ????? ?????"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "??? ?? ??? ?????");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ?????"));
        }
    }

    /// <summary>
    /// ?????? ??? ???? ???? ????
    /// </summary>
    [HttpGet("by-employee/{employeeId}")]
    [Authorize(Roles = "Admin,WarehouseKeeper,Viewer")]
    public async Task<IActionResult> GetAssetsByEmployee(int employeeId)
    {
        try
        {
            var assets = await _assetService.GetByEmployeeAsync(employeeId);
            return Ok(ApiResponse<List<AssetListDto>>.SuccessResponse(assets));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "??? ?? ??? ???? ??????");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ???? ??????"));
        }
    }

    /// <summary>
    /// ?????? ??? ???? ?????? ????
    /// </summary>
    [HttpGet("by-warehouse/{warehouseId}")]
    [Authorize(Roles = "Admin,WarehouseKeeper,Viewer")]
    public async Task<IActionResult> GetAssetsByWarehouse(int warehouseId)
    {
        try
        {
            var assets = await _assetService.GetByWarehouseAsync(warehouseId);
            return Ok(ApiResponse<List<AssetListDto>>.SuccessResponse(assets));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "??? ?? ??? ???? ????????");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ???? ????????"));
        }
    }

    /// <summary>
    /// ?????? ??? ???? ????? ?????
    /// </summary>
    [HttpGet("by-department/{departmentId}")]
    [Authorize(Roles = "Admin,WarehouseKeeper,Viewer")]
    public async Task<IActionResult> GetAssetsByDepartment(int departmentId)
    {
        try
        {
            var assets = await _assetService.GetByDepartmentAsync(departmentId);
            return Ok(ApiResponse<List<AssetListDto>>.SuccessResponse(assets));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "??? ?? ??? ???? ???????");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ???? ???????"));
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
