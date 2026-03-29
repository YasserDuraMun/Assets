using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Assets.DTOs.Section;
using Assets.DTOs.Common;
using Assets.Services.Interfaces;

namespace Assets.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SectionsController : ControllerBase
{
    private readonly ISectionService _sectionService;
    private readonly ILogger<SectionsController> _logger;

    public SectionsController(ISectionService sectionService, ILogger<SectionsController> logger)
    {
        _sectionService = sectionService;
        _logger = logger;
    }

    /// <summary>
    /// Get all sections (optionally filtered by department)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,WarehouseKeeper,Viewer")]
    public async Task<IActionResult> GetSections([FromQuery] int? departmentId = null)
    {
        try
        {
            var sections = await _sectionService.GetAllAsync(departmentId);
            return Ok(ApiResponse<List<SectionDto>>.SuccessResponse(sections));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting sections");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ???????"));
        }
    }

    /// <summary>
    /// Get section by ID
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,WarehouseKeeper,Viewer")]
    public async Task<IActionResult> GetSection(int id)
    {
        try
        {
            var section = await _sectionService.GetByIdAsync(id);

            if (section == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("????? ??? ?????"));
            }

            return Ok(ApiResponse<SectionDto>.SuccessResponse(section));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting section");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ?????"));
        }
    }

    /// <summary>
    /// Get sections by department
    /// </summary>
    [HttpGet("by-department/{departmentId}")]
    [Authorize(Roles = "Admin,WarehouseKeeper,Viewer")]
    public async Task<IActionResult> GetSectionsByDepartment(int departmentId)
    {
        try
        {
            var sections = await _sectionService.GetAllAsync(departmentId);
            return Ok(ApiResponse<List<SectionDto>>.SuccessResponse(sections));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting sections by department");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ????? ???????"));
        }
    }

    /// <summary>
    /// Create new section
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,WarehouseKeeper")]
    public async Task<IActionResult> CreateSection([FromBody] CreateSectionDto dto)
    {
        try
        {
            var section = await _sectionService.CreateAsync(dto);
            return CreatedAtAction(
                nameof(GetSection),
                new { id = section.Id },
                ApiResponse<SectionDto>.SuccessResponse(section, "?? ????? ????? ?????")
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating section");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ????? ?????"));
        }
    }

    /// <summary>
    /// Update section
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,WarehouseKeeper")]
    public async Task<IActionResult> UpdateSection(int id, [FromBody] UpdateSectionDto dto)
    {
        if (id != dto.Id)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("???? ????? ??? ??????"));
        }

        try
        {
            var section = await _sectionService.UpdateAsync(dto);
            return Ok(ApiResponse<SectionDto>.SuccessResponse(section, "?? ????? ????? ?????"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating section");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ????? ?????"));
        }
    }

    /// <summary>
    /// Delete section (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteSection(int id)
    {
        try
        {
            var success = await _sectionService.DeleteAsync(id);

            if (!success)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("????? ??? ?????"));
            }

            return Ok(ApiResponse<object>.SuccessResponse(null, "?? ??? ????? ?????"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting section");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ?????"));
        }
    }
}
