using Microsoft.EntityFrameworkCore;
using Assets.Data;
using Assets.DTOs.Status;
using Assets.Services.Interfaces;
using Assets.Models;

namespace Assets.Services.Implementations;

public class StatusService : IStatusService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<StatusService> _logger;

    public StatusService(ApplicationDbContext context, ILogger<StatusService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<StatusDto>> GetAllAsync()
    {
        var statuses = await _context.AssetStatuses
            .Where(s => s.IsActive)
            .Include(s => s.Assets)
            .OrderBy(s => s.Name)
            .ToListAsync();

        return statuses.Select(s => new StatusDto
        {
            Id = s.Id,
            Name = s.Name,
            Description = s.Description,
            Color = s.Color,
            Icon = s.Icon,
            IsActive = s.IsActive,
            AssetsCount = s.Assets.Count(a => !a.IsDeleted),
            CreatedAt = s.CreatedAt
        }).ToList();
    }

    public async Task<StatusDto?> GetByIdAsync(int id)
    {
        var status = await _context.AssetStatuses
            .Include(s => s.Assets)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (status == null)
            return null;

        return new StatusDto
        {
            Id = status.Id,
            Name = status.Name,
            Description = status.Description,
            Color = status.Color,
            Icon = status.Icon,
            IsActive = status.IsActive,
            AssetsCount = status.Assets.Count(a => !a.IsDeleted),
            CreatedAt = status.CreatedAt
        };
    }

    public async Task<StatusDto> CreateAsync(CreateStatusDto dto)
    {
        var status = new AssetStatus
        {
            Name = dto.Name,
            Code = GenerateCode(dto.Name),
            Description = dto.Description,
            Color = dto.Color,
            Icon = dto.Icon,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.AssetStatuses.Add(status);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(status.Id))!;
    }

    public async Task<StatusDto> UpdateAsync(UpdateStatusDto dto)
    {
        var status = await _context.AssetStatuses.FindAsync(dto.Id);
        
        if (status == null)
            throw new Exception("Status not found");

        status.Name = dto.Name;
        status.Description = dto.Description;
        status.Color = dto.Color;
        status.Icon = dto.Icon;
        status.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();

        return (await GetByIdAsync(status.Id))!;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var status = await _context.AssetStatuses.FindAsync(id);
        
        if (status == null)
            return false;

        // Check if any assets are using this status
        var hasAssets = await _context.Assets.AnyAsync(a => a.StatusId == id && !a.IsDeleted);
        
        if (hasAssets)
        {
            throw new Exception("?? ???? ??? ?????? ????? ??????? ?? ??? ????");
        }

        // Soft delete
        status.IsActive = false;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<StatusDto>> GetActiveAsync()
    {
        return await _context.AssetStatuses
            .Where(s => s.IsActive)
            .Include(s => s.Assets)
            .OrderBy(s => s.Name)
            .Select(s => new StatusDto
            {
                Id = s.Id,
                Name = s.Name,
                Color = s.Color,
                Description = s.Description,
                AssetsCount = s.Assets.Count,
                IsActive = s.IsActive,
                CreatedAt = s.CreatedAt
            })
            .ToListAsync();
    }

    private string GenerateCode(string name)
    {
        return name.Length > 5 ? name.Substring(0, 5).ToUpper() : name.ToUpper();
    }
}
