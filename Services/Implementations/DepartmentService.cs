using Microsoft.EntityFrameworkCore;
using Assets.Data;
using Assets.DTOs.Department;
using Assets.Services.Interfaces;
using Assets.Models;

namespace Assets.Services.Implementations;

public class DepartmentService : IDepartmentService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DepartmentService> _logger;

    public DepartmentService(ApplicationDbContext context, ILogger<DepartmentService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<DepartmentDto>> GetAllAsync()
    {
        return await _context.Departments
            .Where(d => d.IsActive)
            .Select(d => new DepartmentDto
            {
                Id = d.Id,
                Name = d.Name,
                Code = d.Code,
                Description = d.Description,
                IsActive = d.IsActive,
                SectionsCount = d.Sections.Count,
                EmployeesCount = d.Employees.Count,
                AssetsCount = d.Assets.Count,
                CreatedAt = d.CreatedAt
            })
            .OrderBy(d => d.Name)
            .ToListAsync();
    }

    public async Task<DepartmentDto?> GetByIdAsync(int id)
    {
        var department = await _context.Departments
            .Include(d => d.Sections)
            .Include(d => d.Employees)
            .Include(d => d.Assets)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (department == null)
            return null;

        return new DepartmentDto
        {
            Id = department.Id,
            Name = department.Name,
            Code = department.Code,
            Description = department.Description,
            IsActive = department.IsActive,
            SectionsCount = department.Sections.Count,
            EmployeesCount = department.Employees.Count,
            AssetsCount = department.Assets.Count,
            CreatedAt = department.CreatedAt
        };
    }

    public async Task<DepartmentDto> CreateAsync(CreateDepartmentDto dto)
    {
        var department = new Department
        {
            Name = dto.Name,
            Code = dto.Code,
            Description = dto.Description,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Departments.Add(department);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(department.Id))!;
    }

    public async Task<DepartmentDto> UpdateAsync(UpdateDepartmentDto dto)
    {
        var department = await _context.Departments.FindAsync(dto.Id);
        
        if (department == null)
            throw new Exception("Department not found");

        department.Name = dto.Name;
        department.Code = dto.Code;
        department.Description = dto.Description;
        department.IsActive = dto.IsActive;
        department.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return (await GetByIdAsync(department.Id))!;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var department = await _context.Departments.FindAsync(id);
        
        if (department == null)
            return false;

        // Soft delete
        department.IsActive = false;
        department.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }
}
