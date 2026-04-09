using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Assets.DTOs.Employee;
using Assets.DTOs.Common;
using Assets.Services.Interfaces;

namespace Assets.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _employeeService;
    private readonly ILogger<EmployeesController> _logger;

    public EmployeesController(IEmployeeService employeeService, ILogger<EmployeesController> logger)
    {
        _employeeService = employeeService;
        _logger = logger;
    }

    /// <summary>
    /// Get all employees with pagination
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Super Admin,Admin,Manager,Employee,Viewer")]
    public async Task<IActionResult> GetEmployees(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] int? departmentId = null)
    {
        try
        {
            var result = await _employeeService.GetAllAsync(pageNumber, pageSize, search, departmentId);
            return Ok(ApiResponse<PagedResult<EmployeeDto>>.SuccessResponse(result));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting employees");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ????????"));
        }
    }

    /// <summary>
    /// Get employee by ID
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Roles = "Super Admin,Admin,Manager,Employee,Viewer")]
    public async Task<IActionResult> GetEmployee(int id)
    {
        try
        {
            var employee = await _employeeService.GetByIdAsync(id);

            if (employee == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("?????? ??? ?????"));
            }

            return Ok(ApiResponse<EmployeeDto>.SuccessResponse(employee));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting employee");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ??????"));
        }
    }

    /// <summary>
    /// Get all active employees (for dropdowns)
    /// </summary>
    [HttpGet("active")]
    [Authorize(Roles = "Admin,WarehouseKeeper,Viewer")]
    public async Task<IActionResult> GetActiveEmployees()
    {
        try
        {
            var employees = await _employeeService.GetActiveEmployeesAsync();
            return Ok(ApiResponse<List<EmployeeDto>>.SuccessResponse(employees));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active employees");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ???????? ????????"));
        }
    }

    /// <summary>
    /// Create new employee
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,WarehouseKeeper")]
    public async Task<IActionResult> CreateEmployee([FromBody] CreateEmployeeDto dto)
    {
        try
        {
            var employee = await _employeeService.CreateAsync(dto);
            return CreatedAtAction(
                nameof(GetEmployee),
                new { id = employee.Id },
                ApiResponse<EmployeeDto>.SuccessResponse(employee, "?? ????? ?????? ?????")
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating employee");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ????? ??????"));
        }
    }

    /// <summary>
    /// Update employee
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,WarehouseKeeper")]
    public async Task<IActionResult> UpdateEmployee(int id, [FromBody] UpdateEmployeeDto dto)
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
            var employee = await _employeeService.UpdateAsync(dto);
            return Ok(ApiResponse<EmployeeDto>.SuccessResponse(employee, "?? ????? ?????? ?????"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating employee with ID: {Id}", id);
            
            if (ex.Message.Contains("not found"))
            {
                return NotFound(ApiResponse<object>.ErrorResponse("?????? ??? ?????"));
            }
            
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ????? ??????"));
        }
    }

    /// <summary>
    /// Delete employee (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        try
        {
            var success = await _employeeService.DeleteAsync(id);

            if (!success)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("?????? ??? ?????"));
            }

            return Ok(ApiResponse<object>.SuccessResponse(null, "?? ??? ?????? ?????"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting employee");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ??????"));
        }
    }

    /// <summary>
    /// Generate QR Code for employee
    /// </summary>
    [HttpPost("{id}/generate-qrcode")]
    [Authorize(Roles = "Admin,WarehouseKeeper")]
    public async Task<IActionResult> GenerateQRCode(int id)
    {
        try
        {
            var qrCode = await _employeeService.GenerateQRCodeAsync(id);
            return Ok(ApiResponse<object>.SuccessResponse(new { qrCode }, "?? ????? QR Code ?????"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating QR code");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ????? QR Code"));
        }
    }
}
