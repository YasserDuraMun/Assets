using Assets.DTOs.Employee;
using Assets.DTOs.Common;

namespace Assets.Services.Interfaces;

public interface IEmployeeService
{
    Task<PagedResult<EmployeeDto>> GetAllAsync(int pageNumber, int pageSize, string? searchTerm = null, int? departmentId = null);
    Task<EmployeeDto?> GetByIdAsync(int id);
    Task<EmployeeDto> CreateAsync(CreateEmployeeDto dto);
    Task<EmployeeDto> UpdateAsync(UpdateEmployeeDto dto);
    Task<bool> DeleteAsync(int id);
    Task<string> GenerateQRCodeAsync(int employeeId);
    Task<List<EmployeeDto>> GetActiveEmployeesAsync();
}
