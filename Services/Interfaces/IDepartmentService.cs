using Assets.DTOs.Department;

namespace Assets.Services.Interfaces;

public interface IDepartmentService
{
    Task<List<DepartmentDto>> GetAllAsync();
    Task<DepartmentDto?> GetByIdAsync(int id);
    Task<DepartmentDto> CreateAsync(CreateDepartmentDto dto);
    Task<DepartmentDto> UpdateAsync(UpdateDepartmentDto dto);
    Task<bool> DeleteAsync(int id);
}
