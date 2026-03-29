using Microsoft.EntityFrameworkCore;
using Assets.Data;
using Assets.DTOs.Warehouse;
using Assets.Services.Interfaces;
using Assets.Models;

namespace Assets.Services.Implementations;

public class WarehouseService : IWarehouseService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<WarehouseService> _logger;

    public WarehouseService(ApplicationDbContext context, ILogger<WarehouseService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<WarehouseDto>> GetAllAsync()
    {
        return await _context.Warehouses
            .Where(w => w.IsActive)
            .Include(w => w.ResponsibleEmployee)
            .Include(w => w.Assets)
            .Select(w => new WarehouseDto
            {
                Id = w.Id,
                Name = w.Name,
                Code = w.Code,
                Location = w.Location,
                ResponsibleEmployeeId = w.ResponsibleEmployeeId,
                ResponsibleEmployeeName = w.ResponsibleEmployee != null ? w.ResponsibleEmployee.FullName : null,
                Capacity = w.Capacity,
                CurrentAssetsCount = w.Assets.Count,
                Notes = w.Notes,
                IsActive = w.IsActive,
                CreatedAt = w.CreatedAt
            })
            .OrderBy(w => w.Name)
            .ToListAsync();
    }

    public async Task<WarehouseDto?> GetByIdAsync(int id)
    {
        var warehouse = await _context.Warehouses
            .Include(w => w.ResponsibleEmployee)
            .Include(w => w.Assets)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (warehouse == null)
            return null;

        return new WarehouseDto
        {
            Id = warehouse.Id,
            Name = warehouse.Name,
            Code = warehouse.Code,
            Location = warehouse.Location,
            ResponsibleEmployeeId = warehouse.ResponsibleEmployeeId,
            ResponsibleEmployeeName = warehouse.ResponsibleEmployee?.FullName,
            Capacity = warehouse.Capacity,
            CurrentAssetsCount = warehouse.Assets.Count,
            Notes = warehouse.Notes,
            IsActive = warehouse.IsActive,
            CreatedAt = warehouse.CreatedAt
        };
    }

    public async Task<WarehouseDto> CreateAsync(CreateWarehouseDto dto)
    {
        var warehouse = new Warehouse
        {
            Name = dto.Name,
            Code = dto.Code,
            Location = dto.Location,
            ResponsibleEmployeeId = dto.ResponsibleEmployeeId,
            Capacity = dto.Capacity,
            Notes = dto.Notes,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Warehouses.Add(warehouse);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(warehouse.Id))!;
    }

    public async Task<WarehouseDto> UpdateAsync(UpdateWarehouseDto dto)
    {
        var warehouse = await _context.Warehouses.FindAsync(dto.Id);
        
        if (warehouse == null)
            throw new Exception("Warehouse not found");

        warehouse.Name = dto.Name;
        warehouse.Code = dto.Code;
        warehouse.Location = dto.Location;
        warehouse.ResponsibleEmployeeId = dto.ResponsibleEmployeeId;
        warehouse.Capacity = dto.Capacity;
        warehouse.Notes = dto.Notes;
        warehouse.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();

        return (await GetByIdAsync(warehouse.Id))!;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var warehouse = await _context.Warehouses.FindAsync(id);
        
        if (warehouse == null)
            return false;

        // Soft delete
        warehouse.IsActive = false;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<WarehouseDto>> GetActiveAsync()
    {
        return await _context.Warehouses
            .Where(w => w.IsActive)
            .Include(w => w.ResponsibleEmployee)
            .Include(w => w.Assets)
            .OrderBy(w => w.Name)
            .Select(w => new WarehouseDto
            {
                Id = w.Id,
                Name = w.Name,
                Code = w.Code,
                Location = w.Location,
                ResponsibleEmployeeId = w.ResponsibleEmployeeId,
                ResponsibleEmployeeName = w.ResponsibleEmployee != null ? w.ResponsibleEmployee.FullName : null,
                Capacity = w.Capacity,
                CurrentAssetsCount = w.Assets.Count,
                IsActive = w.IsActive,
                CreatedAt = w.CreatedAt
            })
            .ToListAsync();
    }
}
