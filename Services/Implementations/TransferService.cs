using Microsoft.EntityFrameworkCore;
using Assets.Data;
using Assets.DTOs.Transfer;
using Assets.Services.Interfaces;
using Assets.Models;
using Assets.Enums;

namespace Assets.Services.Implementations;

public class TransferService : ITransferService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<TransferService> _logger;

    public TransferService(ApplicationDbContext context, ILogger<TransferService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<TransferDto> CreateTransferAsync(CreateTransferDto dto, int userId)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        
        try
        {
            var asset = await _context.Assets
                .Include(a => a.CurrentEmployee)
                .Include(a => a.CurrentWarehouse)
                .FirstOrDefaultAsync(a => a.Id == dto.AssetId);

            if (asset == null)
                throw new Exception("Asset not found");

            // Determine primary ToLocationType based on priority: Employee > Section > Department > Warehouse
            LocationType toLocationType = LocationType.Warehouse; // default
            if (dto.ToEmployeeId.HasValue) 
                toLocationType = LocationType.Employee;
            else if (dto.ToSectionId.HasValue) 
                toLocationType = LocationType.Section;
            else if (dto.ToDepartmentId.HasValue) 
                toLocationType = LocationType.Department;
            else if (dto.ToWarehouseId.HasValue) 
                toLocationType = LocationType.Warehouse;

            // Create movement record - ???? ????? ???????
            var movement = new AssetMovement
            {
                AssetId = dto.AssetId,
                MovementType = MovementType.Transfer,
                MovementDate = dto.TransferDate,
                
                // From location (current asset location) - ???? ???????
                FromEmployeeId = asset.CurrentEmployeeId,
                FromWarehouseId = asset.CurrentWarehouseId,
                FromDepartmentId = asset.CurrentDepartmentId,
                FromSectionId = asset.CurrentSectionId,
                FromLocationType = asset.CurrentLocationType,
                
                // To location (new location from DTO) - ???? ???????  
                ToEmployeeId = dto.ToEmployeeId,
                ToWarehouseId = dto.ToWarehouseId,
                ToDepartmentId = dto.ToDepartmentId,
                ToSectionId = dto.ToSectionId,
                ToLocationType = toLocationType,
                
                Reason = dto.Reason,
                Notes = dto.Notes,
                PerformedBy = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.AssetMovements.Add(movement);

            // Update asset location - ???? ????? ???????
            asset.CurrentEmployeeId = dto.ToEmployeeId;
            asset.CurrentWarehouseId = dto.ToWarehouseId;
            asset.CurrentDepartmentId = dto.ToDepartmentId;
            asset.CurrentSectionId = dto.ToSectionId;
            asset.CurrentLocationType = toLocationType;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return (await GetByIdAsync(movement.Id))!;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<TransferDto?> GetByIdAsync(int id)
    {
        var movement = await _context.AssetMovements
            .Include(m => m.Asset)
            .Include(m => m.FromEmployee)
            .Include(m => m.ToEmployee)
            .Include(m => m.FromWarehouse)
            .Include(m => m.ToWarehouse)
            .Include(m => m.FromDepartment)
            .Include(m => m.ToDepartment)
            .Include(m => m.FromSection)
            .Include(m => m.ToSection)
            .Include(m => m.PerformedByUser)
            .FirstOrDefaultAsync(m => m.Id == id && m.MovementType == MovementType.Transfer);

        if (movement == null)
            return null;

        return new TransferDto
        {
            Id = movement.Id,
            AssetId = movement.AssetId,
            AssetName = movement.Asset.Name,
            AssetSerialNumber = movement.Asset.SerialNumber,
            TransferDate = movement.MovementDate,
            FromLocation = GetLocationName(movement.FromLocationType, movement.FromEmployee, movement.FromWarehouse),
            ToLocation = GetLocationName(movement.ToLocationType, movement.ToEmployee, movement.ToWarehouse),
            Reason = movement.Reason,
            Notes = movement.Notes,
            PerformedBy = movement.PerformedByUser?.FullName ?? "System",
            CreatedAt = movement.CreatedAt
        };
    }

    public async Task<List<TransferDto>> GetAllAsync(int? assetId = null, int? employeeId = null)
    {
        var query = _context.AssetMovements
            .Where(m => m.MovementType == MovementType.Transfer)
            .Include(m => m.Asset)
            .Include(m => m.FromEmployee)
            .Include(m => m.ToEmployee)
            .Include(m => m.FromWarehouse)
            .Include(m => m.ToWarehouse)
            .Include(m => m.PerformedByUser)
            .AsQueryable();

        if (assetId.HasValue)
        {
            query = query.Where(m => m.AssetId == assetId.Value);
        }

        if (employeeId.HasValue)
        {
            query = query.Where(m => m.FromEmployeeId == employeeId.Value || m.ToEmployeeId == employeeId.Value);
        }

        var movements = await query
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();

        return movements.Select(m => new TransferDto
        {
            Id = m.Id,
            AssetId = m.AssetId,
            AssetName = m.Asset.Name,
            AssetSerialNumber = m.Asset.SerialNumber,
            TransferDate = m.MovementDate,
            FromLocation = GetLocationName(m.FromLocationType, m.FromEmployee, m.FromWarehouse),
            ToLocation = GetLocationName(m.ToLocationType, m.ToEmployee, m.ToWarehouse),
            Reason = m.Reason,
            Notes = m.Notes,
            PerformedBy = m.PerformedByUser?.FullName ?? "System",
            CreatedAt = m.CreatedAt
        }).ToList();
    }

    public async Task<List<TransferDto>> GetTransferHistoryByAssetAsync(int assetId)
    {
        return await GetAllAsync(assetId: assetId);
    }

    private string? GetLocationName(LocationType? locationType, Employee? employee, Warehouse? warehouse)
    {
        return locationType switch
        {
            LocationType.Employee => employee?.FullName,
            LocationType.Warehouse => warehouse?.Name,
            _ => "Unknown Location"
        };
    }
}
