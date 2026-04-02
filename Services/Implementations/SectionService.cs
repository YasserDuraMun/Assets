using Microsoft.EntityFrameworkCore;
using Assets.Data;
using Assets.DTOs.Section;
using Assets.Services.Interfaces;
using Assets.Models;

namespace Assets.Services.Implementations;

public class SectionService : ISectionService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<SectionService> _logger;

    public SectionService(ApplicationDbContext context, ILogger<SectionService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<SectionDto>> GetAllAsync(int? departmentId = null)
    {
        var query = _context.Sections
            .Where(s => s.IsActive)
            .Include(s => s.Department)
            .Include(s => s.Employees)
            .Include(s => s.Assets)
            .AsQueryable();

        if (departmentId.HasValue)
        {
            query = query.Where(s => s.DepartmentId == departmentId.Value);
        }

        return await query
            .Select(s => new SectionDto
            {
                Id = s.Id,
                Name = s.Name,
                Code = s.Code,
                Description = s.Description,
                DepartmentId = s.DepartmentId,
                DepartmentName = s.Department.Name,
                ManagerEmployeeId = null,
                ManagerEmployeeName = null,
                IsActive = s.IsActive,
                EmployeesCount = s.Employees.Count,
                AssetsCount = s.Assets.Count,
                CreatedAt = s.CreatedAt
            })
            .OrderBy(s => s.DepartmentName)
            .ThenBy(s => s.Name)
            .ToListAsync();
    }

    public async Task<SectionDto?> GetByIdAsync(int id)
    {
        var section = await _context.Sections
            .Include(s => s.Department)
            .Include(s => s.Employees)
            .Include(s => s.Assets)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (section == null)
            return null;

        return new SectionDto
        {
            Id = section.Id,
            Name = section.Name,
            Code = section.Code,
            Description = section.Description,
            DepartmentId = section.DepartmentId,
            DepartmentName = section.Department.Name,
            ManagerEmployeeId = null,
            ManagerEmployeeName = null,
            IsActive = section.IsActive,
            EmployeesCount = section.Employees.Count,
            AssetsCount = section.Assets.Count,
            CreatedAt = section.CreatedAt
        };
    }

    public async Task<SectionDto> CreateAsync(CreateSectionDto dto)
    {
        var section = new Section
        {
            Name = dto.Name,
            Code = GenerateSectionCode(dto.Name, dto.DepartmentId), // Auto-generate code
            Description = dto.Description,
            DepartmentId = dto.DepartmentId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Sections.Add(section);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(section.Id))!;
    }

    public async Task<SectionDto> UpdateAsync(UpdateSectionDto dto)
    {
        var section = await _context.Sections.FindAsync(dto.Id);
        
        if (section == null)
            throw new Exception("Section not found");

        section.Name = dto.Name;
        section.Code = GenerateSectionCodeForUpdate(dto.Name, dto.DepartmentId, dto.Id); // Update code
        section.Description = dto.Description;
        section.DepartmentId = dto.DepartmentId;
        section.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();

        return (await GetByIdAsync(section.Id))!;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var section = await _context.Sections.FindAsync(id);
        
        if (section == null)
            return false;

        // Soft delete
        section.IsActive = false;

        await _context.SaveChangesAsync();
        return true;
    }

    #region Code Generation Methods

    private string GenerateSectionCode(string name, int departmentId)
    {
        // Get department code for prefix
        var departmentCode = _context.Departments
            .Where(d => d.Id == departmentId)
            .Select(d => d.Code)
            .FirstOrDefault() ?? "DEPT";

        var baseCode = GenerateBaseCode(name);
        var fullCode = $"{departmentCode}-{baseCode}";
        
        return EnsureUniqueSectionCode(fullCode);
    }

    private string GenerateSectionCodeForUpdate(string name, int departmentId, int excludeId)
    {
        // Get department code for prefix
        var departmentCode = _context.Departments
            .Where(d => d.Id == departmentId)
            .Select(d => d.Code)
            .FirstOrDefault() ?? "DEPT";

        var baseCode = GenerateBaseCode(name);
        var fullCode = $"{departmentCode}-{baseCode}";
        
        return EnsureUniqueSectionCodeForUpdate(fullCode, excludeId);
    }

    private string GenerateBaseCode(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return "SEC";

        var cleanName = name.Trim().Replace(" ", "");
        return cleanName.Length > 6 ? cleanName.Substring(0, 6).ToUpper() : cleanName.ToUpper();
    }

    private string EnsureUniqueSectionCode(string baseCode)
    {
        var existingCodes = _context.Sections
            .Where(s => s.Code.StartsWith(baseCode))
            .Select(s => s.Code)
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

    private string EnsureUniqueSectionCodeForUpdate(string baseCode, int excludeId)
    {
        var existingCodes = _context.Sections
            .Where(s => s.Id != excludeId && s.Code.StartsWith(baseCode))
            .Select(s => s.Code)
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
