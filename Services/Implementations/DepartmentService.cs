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
            Code = GenerateCode(dto.Name), // Auto-generate code from name
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
        department.Code = GenerateUniqueCodeForUpdate(dto.Name, dto.Id); // Update code when name changes
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

    #region Code Generation Methods

    private string GenerateCode(string name)
    {
        var baseCode = GenerateBaseCode(name);
        return EnsureUniqueCode(baseCode);
    }

    private string GenerateUniqueCodeForUpdate(string name, int excludeId)
    {
        var baseCode = GenerateBaseCode(name);
        
        var existingCodes = _context.Departments
            .Where(d => d.Id != excludeId && d.Code.StartsWith(baseCode))
            .Select(d => d.Code)
            .AsEnumerable()
            .ToList();

        if (!existingCodes.Contains(baseCode))
            return baseCode;

        int counter = 1;
        string uniqueCode;
        do
        {
            uniqueCode = $"{baseCode}{counter}";
            counter++;
        } while (existingCodes.Contains(uniqueCode));

        return uniqueCode;
    }

    private string GenerateBaseCode(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return "DEPT";

        var cleanName = name.Trim().Replace(" ", "");
        return cleanName.Length > 6 ? cleanName.Substring(0, 6).ToUpper() : cleanName.ToUpper();
    }

    private string EnsureUniqueCode(string baseCode)
    {
        var existingCodes = _context.Departments
            .Where(d => d.Code.StartsWith(baseCode))
            .Select(d => d.Code)
            .AsEnumerable()
            .ToList();

        if (!existingCodes.Contains(baseCode))
            return baseCode;

        int counter = 1;
        string uniqueCode;
        do
        {
            uniqueCode = $"{baseCode}{counter}";
            counter++;
        } while (existingCodes.Contains(uniqueCode));

        return uniqueCode;
    }

    #endregion
}
