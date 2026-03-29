using Microsoft.EntityFrameworkCore;
using Assets.Data;
using Assets.Services.Interfaces;

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
        var totalEmployees = await _context.Employees.CountAsync(e => e.IsActive);
        var totalDepartments = await _context.Departments.CountAsync(d => d.IsActive);
        var totalWarehouses = await _context.Warehouses.CountAsync(w => w.IsActive);
        
        var activeAssets = await _context.Assets.CountAsync(a => !a.IsDeleted && a.Status.IsActive);
        var inactiveAssets = totalAssets - activeAssets;
        
        var assetsWithWarranty = await _context.Assets.CountAsync(a => !a.IsDeleted && a.HasWarranty);
        
        var thirtyDaysFromNow = DateTime.UtcNow.AddDays(30);
        var expiringWarranties = await _context.Assets
            .CountAsync(a => !a.IsDeleted && 
                           a.HasWarranty && 
                           a.WarrantyExpiryDate.HasValue && 
                           a.WarrantyExpiryDate.Value <= thirtyDaysFromNow &&
                           a.WarrantyExpiryDate.Value >= DateTime.UtcNow);

        // Get disposed assets count
        var disposedAssets = await _context.AssetDisposals.CountAsync();

        return new
        {
            totalAssets,
            totalEmployees,
            totalDepartments,
            totalWarehouses,
            activeAssets,
            inactiveAssets,
            assetsWithWarranty,
            expiringWarranties,
            disposedAssets
        };
    }

    public async Task<object> GetAssetsByCategoryAsync()
    {
        return await _context.Assets
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
    }

    public async Task<object> GetAssetsByStatusAsync()
    {
        return await _context.Assets
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
                description = $"?? ????? ?????: {a.Name}",
                assetName = a.Name,
                userName = "System", // Since we don't have CreatedBy field yet
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
                title = "????? ????? ??????",
                description = $"????? ????? '{a.Name}' ????? ?? {a.WarrantyExpiryDate:yyyy-MM-dd}",
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
                title = "??? ???? ????",
                description = $"????? '{a.Name}' ??? ???? ????? ????",
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