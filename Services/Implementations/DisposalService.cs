using Microsoft.EntityFrameworkCore;
using Assets.Data;
using Assets.DTOs.Disposal;
using Assets.DTOs.Common;
using Assets.Services.Interfaces;
using Assets.Models;
using Assets.Enums;

namespace Assets.Services.Implementations;

public class DisposalService : IDisposalService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DisposalService> _logger;

    public DisposalService(ApplicationDbContext context, ILogger<DisposalService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<DisposalDto> CreateDisposalAsync(CreateDisposalDto dto, int userId)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        
        try
        {
            var asset = await _context.Assets.FindAsync(dto.AssetId);

            if (asset == null)
                throw new Exception("Asset not found");

            // Check if already disposed
            var existingDisposal = await _context.AssetDisposals
                .FirstOrDefaultAsync(d => d.AssetId == dto.AssetId);

            if (existingDisposal != null)
                throw new Exception("Asset already disposed");

            // Create disposal record
            var disposal = new AssetDisposal
            {
                AssetId = dto.AssetId,
                DisposalDate = dto.DisposalDate,
                DisposalReason = dto.DisposalReason,
                Notes = dto.Notes,
                PerformedBy = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.AssetDisposals.Add(disposal);

            // Create movement record
            var movement = new AssetMovement
            {
                AssetId = dto.AssetId,
                MovementType = MovementType.Disposal,
                MovementDate = dto.DisposalDate,
                FromEmployeeId = asset.CurrentEmployeeId,
                FromWarehouseId = asset.CurrentWarehouseId,
                FromLocationType = asset.CurrentLocationType,
                Reason = $"Disposal: {dto.DisposalReason}",
                Notes = dto.Notes,
                PerformedBy = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.AssetMovements.Add(movement);

            // Update asset - mark as deleted (soft delete)
            asset.IsDeleted = true;
            asset.DeletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return (await GetByIdAsync(disposal.Id))!;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<DisposalDto?> GetByIdAsync(int id)
    {
        var disposal = await _context.AssetDisposals
            .Include(d => d.Asset)
            .Include(d => d.PerformedByUser)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (disposal == null)
            return null;

        return new DisposalDto
        {
            Id = disposal.Id,
            AssetId = disposal.AssetId,
            AssetName = disposal.Asset.Name,
            AssetSerialNumber = disposal.Asset.SerialNumber,
            DisposalDate = disposal.DisposalDate,
            DisposalReason = disposal.DisposalReason.ToString(),
            Notes = disposal.Notes,
            PerformedBy = disposal.PerformedByUser.FullName,
            CreatedAt = disposal.CreatedAt
        };
    }

    public async Task<PagedResult<DisposalDto>> GetAllAsync(int pageNumber = 1, int pageSize = 10, 
        string? searchTerm = null, int? disposalReason = null, 
        DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _context.AssetDisposals
            .Include(d => d.Asset)
            .Include(d => d.PerformedByUser)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(d => d.Asset.Name.Contains(searchTerm) || 
                                   d.Asset.SerialNumber.Contains(searchTerm));
        }

        if (disposalReason.HasValue)
        {
            query = query.Where(d => (int)d.DisposalReason == disposalReason.Value);
        }

        if (startDate.HasValue)
        {
            query = query.Where(d => d.DisposalDate >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(d => d.DisposalDate <= endDate.Value);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(d => d.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(d => new DisposalDto
            {
                Id = d.Id,
                AssetId = d.AssetId,
                AssetName = d.Asset.Name,
                AssetSerialNumber = d.Asset.SerialNumber,
                DisposalDate = d.DisposalDate,
                DisposalReason = d.DisposalReason.ToString(),
                Notes = d.Notes,
                PerformedBy = d.PerformedByUser.FullName,
                CreatedAt = d.CreatedAt
            })
            .ToListAsync();

        return new PagedResult<DisposalDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<int> GetDisposedAssetsCountAsync()
    {
        return await _context.AssetDisposals.CountAsync();
    }

    public async Task<string> UploadDocumentAsync(int disposalId, string documentPath)
    {
        // Not implemented for simplified version
        throw new NotImplementedException("Document upload not available in simplified version");
    }
}
