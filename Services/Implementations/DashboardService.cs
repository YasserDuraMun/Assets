using Microsoft.EntityFrameworkCore;
using Assets.Data;
using Assets.Services.Interfaces;
using Assets.Enums;

namespace Assets.Services.Implementations;

public class DashboardService : IDashboardService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DashboardService> _logger;

    public DashboardService(ApplicationDbContext context, ILogger<DashboardService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<object> GetStatisticsAsync()
    {
        var totalAssets = await _context.Assets.CountAsync(a => !a.IsDeleted);
        var activeAssets = await _context.Assets.CountAsync(a => !a.IsDeleted && a.Status.IsActive);
        
        // Count assets under maintenance
        var assetsUnderMaintenance = await _context.AssetMaintenances
            .CountAsync(m => m.Status == Enums.MaintenanceStatus.Scheduled || 
                           m.Status == Enums.MaintenanceStatus.InProgress);
        
        // Count disposed assets
        var disposedAssets = await _context.AssetDisposals.CountAsync();
        
        // Count recent transfers (last 30 days)
        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
        var recentTransfers = await _context.AssetMovements
            .CountAsync(m => m.MovementType == Enums.MovementType.Transfer && 
                           m.CreatedAt >= thirtyDaysAgo);
        
        // Count recent disposals (last 30 days)
        var recentDisposals = await _context.AssetDisposals
            .CountAsync(d => d.CreatedAt >= thirtyDaysAgo);

        return new
        {
            totalAssets,
            activeAssets,
            assetsUnderMaintenance,
            disposedAssets,
            recentTransfers,
            recentDisposals
        };
    }

    public async Task<object> GetAssetsByCategoryAsync()
    {
        var result = await _context.Assets
            .Where(a => !a.IsDeleted)
            .Include(a => a.Category)
            .GroupBy(a => new { a.Category.Id, a.Category.Name, a.Category.Color })
            .Select(g => new
            {
                categoryName = g.Key.Name,
                categoryId = g.Key.Id,
                assetsCount = g.Count(),
                color = g.Key.Color ?? "#1890ff"
            })
            .OrderByDescending(x => x.assetsCount)
            .ToListAsync();

        return new
        {
            categoryDistribution = result.Select(r => new
            {
                name = r.categoryName,
                value = r.assetsCount,
                fill = r.color
            }),
            categories = result
        };
    }

    public async Task<object> GetAssetsByStatusAsync()
    {
        var result = await _context.Assets
            .Where(a => !a.IsDeleted)
            .Include(a => a.Status)
            .GroupBy(a => new { a.Status.Id, a.Status.Name, a.Status.Color })
            .Select(g => new
            {
                statusName = g.Key.Name,
                statusId = g.Key.Id,
                assetsCount = g.Count(),
                color = g.Key.Color ?? "#52c41a"
            })
            .OrderByDescending(x => x.assetsCount)
            .ToListAsync();

        return new
        {
            statusDistribution = result.Select(r => new
            {
                name = r.statusName,
                value = r.assetsCount,
                fill = r.color
            }),
            statuses = result
        };
    }

    public async Task<object> GetRecentActivitiesAsync(int limit = 10)
    {
        // Get recent asset creations
        var recentAssets = await _context.Assets
            .Where(a => !a.IsDeleted)
            .OrderByDescending(a => a.CreatedAt)
            .Take(limit)
            .Select(a => new
            {
                id = a.Id,
                type = "asset_created",
                description = $"Asset Created: {a.Name}",
                assetName = a.Name,
                userName = "System",
                createdAt = a.CreatedAt
            })
            .ToListAsync();

        return recentAssets;
    }

    public async Task<object> GetAlertsAsync()
    {
        var alerts = new List<object>();

        // Warranty expiring alerts (next 30 days)
        var thirtyDaysFromNow = DateTime.UtcNow.AddDays(30);
        var expiringWarrantyAssets = await _context.Assets
            .Where(a => !a.IsDeleted && 
                       a.HasWarranty && 
                       a.WarrantyExpiryDate.HasValue && 
                       a.WarrantyExpiryDate.Value <= thirtyDaysFromNow &&
                       a.WarrantyExpiryDate.Value >= DateTime.UtcNow)
            .Select(a => new
            {
                id = a.Id,
                type = "warranty_expiring",
                title = "Warranty Expiring Soon",
                description = $"Asset '{a.Name}' warranty expires on {a.WarrantyExpiryDate:yyyy-MM-dd}",
                assetId = a.Id,
                priority = a.WarrantyExpiryDate!.Value <= DateTime.UtcNow.AddDays(7) ? "high" : 
                          a.WarrantyExpiryDate.Value <= DateTime.UtcNow.AddDays(15) ? "medium" : "low",
                createdAt = DateTime.UtcNow
            })
            .ToListAsync();

        alerts.AddRange(expiringWarrantyAssets);

        // Assets without location alerts
        var assetsWithoutLocation = await _context.Assets
            .Where(a => !a.IsDeleted && 
                       !a.CurrentEmployeeId.HasValue && 
                       !a.CurrentWarehouseId.HasValue && 
                       !a.CurrentDepartmentId.HasValue &&
                       !a.CurrentSectionId.HasValue)
            .Select(a => new
            {
                id = a.Id + 10000, // Different ID range
                type = "no_location",
                title = "No Location Assigned",
                description = $"Asset '{a.Name}' has no assigned location",
                assetId = a.Id,
                priority = "medium",
                createdAt = DateTime.UtcNow
            })
            .Take(5) // Limit to 5 alerts
            .ToListAsync();

        alerts.AddRange(assetsWithoutLocation);

        return alerts.OrderByDescending(a => ((dynamic)a).priority == "high" ? 3 : 
                                           ((dynamic)a).priority == "medium" ? 2 : 1)
                    .ThenByDescending(a => ((dynamic)a).createdAt)
                    .ToList();
    }
}