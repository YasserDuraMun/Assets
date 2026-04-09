using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Assets.DTOs.Department;
using Assets.DTOs.Common;
using Assets.Services.Interfaces;

namespace Assets.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DepartmentsController : ControllerBase
{
    private readonly IDepartmentService _departmentService;
    private readonly ILogger<DepartmentsController> _logger;

    public DepartmentsController(IDepartmentService departmentService, ILogger<DepartmentsController> logger)
    {
        _departmentService = departmentService;
        _logger = logger;
    }

    /// <summary>
    /// Get all departments
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Super Admin,Admin,Manager,Employee,Viewer")]
    public async Task<IActionResult> GetDepartments()
    {
        try
        {
            var departments = await _departmentService.GetAllAsync();
            return Ok(ApiResponse<List<DepartmentDto>>.SuccessResponse(departments));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting departments");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ???????"));
        }
    }

    /// <summary>
    /// Get department by ID
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Roles = "Super Admin,Admin,Manager,Employee,Viewer")]
    public async Task<IActionResult> GetDepartment(int id)
    {
        try
        {
            var department = await _departmentService.GetByIdAsync(id);

            if (department == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("??????? ??? ??????"));
            }

            return Ok(ApiResponse<DepartmentDto>.SuccessResponse(department));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting department");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ???????"));
        }
    }

    /// <summary>
    /// Create new department
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,WarehouseKeeper")]
    public async Task<IActionResult> CreateDepartment([FromBody] CreateDepartmentDto dto)
    {
        try
        {
            var department = await _departmentService.CreateAsync(dto);
            return CreatedAtAction(
                nameof(GetDepartment), 
                new { id = department.Id }, 
                ApiResponse<DepartmentDto>.SuccessResponse(department, "?? ????? ??????? ?????")
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating department");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ????? ???????"));
        }
    }

    /// <summary>
    /// Update department
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,WarehouseKeeper")]
    public async Task<IActionResult> UpdateDepartment(int id, [FromBody] UpdateDepartmentDto dto)
    {
        if (id != dto.Id)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("???? ??????? ??? ??????"));
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("???????? ??????? ??? ?????"));
        }

        try
        {
            var department = await _departmentService.UpdateAsync(dto);
            return Ok(ApiResponse<DepartmentDto>.SuccessResponse(department, "?? ????? ??????? ?????"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating department with ID: {Id}", id);
            
            if (ex.Message.Contains("not found"))
            {
                return NotFound(ApiResponse<object>.ErrorResponse("??????? ??? ??????"));
            }
            
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ????? ???????"));
        }
    }

    /// <summary>
    /// Delete department (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteDepartment(int id)
    {
        try
        {
            var success = await _departmentService.DeleteAsync(id);

            if (!success)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("??????? ??? ??????"));
            }

            return Ok(ApiResponse<object>.SuccessResponse(null, "?? ??? ??????? ?????"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting department");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ???????"));
        }
    }
}
