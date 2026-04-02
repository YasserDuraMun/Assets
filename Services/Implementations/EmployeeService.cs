using Microsoft.EntityFrameworkCore;
using Assets.Data;
using Assets.DTOs.Employee;
using Assets.DTOs.Common;
using Assets.Services.Interfaces;
using Assets.Models;

namespace Assets.Services.Implementations;

public class EmployeeService : IEmployeeService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<EmployeeService> _logger;

    public EmployeeService(ApplicationDbContext context, ILogger<EmployeeService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<PagedResult<EmployeeDto>> GetAllAsync(int pageNumber, int pageSize, string? searchTerm = null, int? departmentId = null)
    {
        var query = _context.Employees
            .Where(e => e.IsActive)
            .Include(e => e.Department)
            .Include(e => e.Section)
            .Include(e => e.Assets)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(e => 
                e.FullName.Contains(searchTerm) || 
                e.EmployeeNumber.Contains(searchTerm) ||
                e.Email!.Contains(searchTerm));
        }

        if (departmentId.HasValue)
        {
            query = query.Where(e => e.DepartmentId == departmentId.Value);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(e => e.FullName)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(e => new EmployeeDto
            {
                Id = e.Id,
                FullName = e.FullName,
                EmployeeNumber = e.EmployeeNumber,
                NationalId = e.NationalId,
                Phone = e.Phone,
                Email = e.Email,
                JobTitle = e.JobTitle,
                DepartmentName = e.Department.Name,
                SectionName = e.Section != null ? e.Section.Name : null,
                QRCode = e.QRCode,
                AssetsCount = e.Assets.Count,
                IsActive = e.IsActive,
                CreatedAt = e.CreatedAt
            })
            .ToListAsync();

        return new PagedResult<EmployeeDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<EmployeeDto?> GetByIdAsync(int id)
    {
        var employee = await _context.Employees
            .Include(e => e.Department)
            .Include(e => e.Section)
            .Include(e => e.Assets)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee == null)
            return null;

        return new EmployeeDto
        {
            Id = employee.Id,
            FullName = employee.FullName,
            EmployeeNumber = employee.EmployeeNumber,
            NationalId = employee.NationalId,
            Phone = employee.Phone,
            Email = employee.Email,
            JobTitle = employee.JobTitle,
            DepartmentName = employee.Department.Name,
            SectionName = employee.Section?.Name,
            QRCode = employee.QRCode,
            AssetsCount = employee.Assets.Count,
            IsActive = employee.IsActive,
            CreatedAt = employee.CreatedAt
        };
    }

    public async Task<EmployeeDto> CreateAsync(CreateEmployeeDto dto)
    {
        var employee = new Employee
        {
            FullName = dto.FullName,
            EmployeeNumber = dto.EmployeeNumber, // Use user-provided employee number
            NationalId = dto.NationalId,
            Phone = dto.Phone,
            Email = dto.Email,
            JobTitle = dto.JobTitle,
            SectionId = dto.SectionId,
            DepartmentId = dto.DepartmentId,
            HireDate = dto.HireDate,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(employee.Id))!;
    }

    public async Task<EmployeeDto> UpdateAsync(UpdateEmployeeDto dto)
    {
        var employee = await _context.Employees.FindAsync(dto.Id);
        
        if (employee == null)
            throw new Exception("Employee not found");

        employee.FullName = dto.FullName;
        employee.EmployeeNumber = dto.EmployeeNumber; // Use user-provided employee number
        employee.NationalId = dto.NationalId;
        employee.Phone = dto.Phone;
        employee.Email = dto.Email;
        employee.JobTitle = dto.JobTitle;
        employee.SectionId = dto.SectionId;
        employee.DepartmentId = dto.DepartmentId;
        employee.HireDate = dto.HireDate;
        employee.IsActive = dto.IsActive;
        employee.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return (await GetByIdAsync(employee.Id))!;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var employee = await _context.Employees.FindAsync(id);
        
        if (employee == null)
            return false;

        // Soft delete
        employee.IsActive = false;
        employee.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<string> GenerateQRCodeAsync(int employeeId)
    {
        var employee = await _context.Employees.FindAsync(employeeId);
        
        if (employee == null)
            throw new Exception("Employee not found");

        // TODO: Implement actual QR Code generation
        var qrCode = $"QR-EMP-{employeeId}-{Guid.NewGuid().ToString().Substring(0, 8)}";
        
        employee.QRCode = qrCode;
        await _context.SaveChangesAsync();

        return qrCode;
    }

    public async Task<List<EmployeeDto>> GetActiveEmployeesAsync()
    {
        return await _context.Employees
            .Where(e => e.IsActive)
            .Include(e => e.Department)
            .Include(e => e.Section)
            .OrderBy(e => e.FullName)
            .Select(e => new EmployeeDto
            {
                Id = e.Id,
                FullName = e.FullName,
                EmployeeNumber = e.EmployeeNumber,
                NationalId = e.NationalId,
                Phone = e.Phone,
                Email = e.Email,
                JobTitle = e.JobTitle,
                DepartmentName = e.Department.Name,
                SectionName = e.Section != null ? e.Section.Name : null,
                QRCode = e.QRCode,
                AssetsCount = e.Assets.Count,
                IsActive = e.IsActive,
                CreatedAt = e.CreatedAt
            })
            .ToListAsync();
    }
}
