using Microsoft.EntityFrameworkCore;
using Assets.Data;
using Assets.Services.Interfaces;
using Assets.Enums;

namespace Assets.Services.Implementations;

/// <summary>
/// Implementation of reports service for municipal asset management
/// </summary>
public class ReportsService : IReportsService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ReportsService> _logger;

    public ReportsService(ApplicationDbContext context, ILogger<ReportsService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<object> GetAssetsSummaryReportAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        _logger.LogInformation("?? Generating assets summary report with dates: {StartDate} to {EndDate}", startDate, endDate);

        var query = _context.Assets.AsQueryable();
        var originalCount = await query.CountAsync();
        _logger.LogInformation("?? Total assets in database: {Count}", originalCount);

        if (startDate.HasValue)
        {
            query = query.Where(a => a.CreatedAt >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(a => a.CreatedAt <= endDate.Value);
        }

        var totalAssets = await query.CountAsync();
        var activeAssets = await query.Where(a => !a.IsDeleted).CountAsync();
        var disposedAssets = await query.Where(a => a.IsDeleted).CountAsync();

        _logger.LogInformation("?? Final counts - Total: {Total}, Active: {Active}, Disposed: {Disposed}", 
            totalAssets, activeAssets, disposedAssets);

        var assetsByCategory = await query
            .Include(a => a.Category)
            .GroupBy(a => a.Category.Name)
            .Select(g => new { Category = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .ToListAsync();

        var assetsByStatus = await query
            .Include(a => a.Status)
            .Where(a => !a.IsDeleted)
            .GroupBy(a => a.Status.Name)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .ToListAsync();

        var totalValue = await query
            .Where(a => a.PurchasePrice.HasValue && !a.IsDeleted)
            .SumAsync(a => a.PurchasePrice ?? 0);

        return new
        {
            reportTitle = "Assets Summary Report",
            generatedAt = DateTime.UtcNow,
            period = new { startDate, endDate },
            summary = new
            {
                totalAssets,
                activeAssets,
                disposedAssets,
                totalValue,
                currency = "ILS"
            },
            assetsByCategory = assetsByCategory.Take(10).Select(x => new { category = TranslateToEnglish(x.Category), count = x.Count }),
            assetsByStatus = assetsByStatus.Select(x => new { status = TranslateToEnglish(x.Status), count = x.Count }),
            charts = new
            {
                categoryDistribution = assetsByCategory.Select(x => new { label = TranslateToEnglish(x.Category), value = x.Count }),
                statusDistribution = assetsByStatus.Select(x => new { label = TranslateToEnglish(x.Status), value = x.Count })
            }
        };
    }

    public async Task<object> GetDisposalReportAsync(DateTime? startDate = null, DateTime? endDate = null, int? disposalReason = null, string? categoryFilter = null)
    {
        _logger.LogInformation("??? Generating disposal report");

        var query = _context.AssetDisposals
            .Include(d => d.Asset)
            .ThenInclude(a => a.Category)
            .Include(d => d.PerformedByUser)
            .AsQueryable();

        if (startDate.HasValue)
            query = query.Where(d => d.DisposalDate >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(d => d.DisposalDate <= endDate.Value);

        var disposals = await query.ToListAsync();

        return new
        {
            reportTitle = "Disposal Report",
            generatedAt = DateTime.UtcNow,
            period = new { startDate, endDate },
            summary = new
            {
                totalDisposals = disposals.Count,
                periodCovered = GetPeriodDescription(startDate, endDate)
            },
            disposalsByReason = disposals
                .GroupBy(d => d.DisposalReason)
                .Select(g => new
                {
                    reason = (int)g.Key,
                    reasonText = g.Key.ToString(),
                    count = g.Count()
                }),
            recentDisposals = disposals
                .Take(20)
                .Select(d => new
                {
                    id = d.Id,
                    assetName = d.Asset.Name,
                    assetSerialNumber = d.Asset.SerialNumber,
                    category = d.Asset.Category?.Name,
                    disposalDate = d.DisposalDate,
                    reason = d.DisposalReason.ToString(),
                    notes = d.Notes,
                    performedBy = d.PerformedByUser?.Username ?? "System"
                })
        };
    }

    public async Task<object> GetMaintenanceReportAsync(DateTime? startDate = null, DateTime? endDate = null, int? maintenanceType = null, int? status = null, string? categoryFilter = null)
    {
        _logger.LogInformation("?? Generating maintenance report");

        var query = _context.AssetMaintenances
            .Include(m => m.Asset)
            .ThenInclude(a => a.Category)
            .AsQueryable();

        if (startDate.HasValue)
            query = query.Where(m => m.MaintenanceDate >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(m => m.MaintenanceDate <= endDate.Value);

        var maintenances = await query.ToListAsync();

        return new
        {
            reportTitle = "Maintenance Report",
            generatedAt = DateTime.UtcNow,
            period = new { startDate, endDate },
            summary = new
            {
                totalMaintenance = maintenances.Count,
                totalCost = maintenances.Sum(m => m.Cost ?? 0),
                currency = "ILS",
                periodCovered = GetPeriodDescription(startDate, endDate)
            },
            maintenanceByType = maintenances
                .GroupBy(m => m.MaintenanceType)
                .Select(g => new
                {
                    type = g.Key.ToString(),
                    typeText = g.Key.ToString(),
                    count = g.Count(),
                    totalCost = g.Sum(x => x.Cost ?? 0)
                }),
            upcomingMaintenance = maintenances
                .Where(m => m.Status == MaintenanceStatus.Scheduled && m.ScheduledDate.HasValue && m.ScheduledDate > DateTime.UtcNow)
                .Take(10)
                .Select(m => new
                {
                    assetName = m.Asset.Name,
                    assetSerialNumber = m.Asset.SerialNumber,
                    nextMaintenanceDate = m.ScheduledDate!.Value,
                    type = m.MaintenanceType.ToString(),
                    daysUntilDue = (m.ScheduledDate!.Value - DateTime.UtcNow).Days
                })
        };
    }

    public async Task<object> GetTransfersReportAsync(DateTime? startDate = null, DateTime? endDate = null, string? fromLocation = null, string? toLocation = null, string? categoryFilter = null)
    {
        _logger.LogInformation("?? Generating transfers report");

        var query = _context.AssetMovements
            .Include(m => m.Asset)
            .ThenInclude(a => a.Category)
            .Include(m => m.FromEmployee)
            .Include(m => m.ToEmployee)
            .Include(m => m.FromWarehouse)
            .Include(m => m.ToWarehouse)
            .Include(m => m.FromDepartment)
            .Include(m => m.ToDepartment)
            .Include(m => m.PerformedByUser)
            .Where(m => m.MovementType == MovementType.Transfer)
            .AsQueryable();

        if (startDate.HasValue)
            query = query.Where(m => m.CreatedAt >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(m => m.CreatedAt <= endDate.Value);

        var transfers = await query.ToListAsync();

        return new
        {
            reportTitle = "Transfers Report",
            generatedAt = DateTime.UtcNow,
            period = new { startDate, endDate },
            summary = new
            {
                totalTransfers = transfers.Count,
                periodCovered = GetPeriodDescription(startDate, endDate)
            },
            recentTransfers = transfers
                .Take(20)
                .Select(t => new
                {
                    id = t.Id,
                    assetName = t.Asset.Name,
                    assetSerialNumber = t.Asset.SerialNumber,
                    category = t.Asset.Category?.Name,
                    movementDate = t.CreatedAt,
                    fromLocation = GetMovementLocationText(t, true),
                    toLocation = GetMovementLocationText(t, false),
                    reason = t.Notes ?? "Transfer",
                    performedBy = t.PerformedByUser?.Username ?? "System"
                })
        };
    }

    public async Task<object> GetMonthlySummaryReportAsync(int year, int month)
    {
        _logger.LogInformation("?? Generating monthly summary for {Year}-{Month}", year, month);

        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        var assetsCreated = await _context.Assets
            .Where(a => a.CreatedAt >= startDate && a.CreatedAt <= endDate)
            .CountAsync();

        var disposals = await _context.AssetDisposals
            .Where(d => d.DisposalDate >= startDate && d.DisposalDate <= endDate)
            .CountAsync();

        var maintenanceRecords = await _context.AssetMaintenances
            .Where(m => m.CreatedAt >= startDate && m.CreatedAt <= endDate)
            .CountAsync();

        var transfers = await _context.AssetMovements
            .Where(m => m.MovementType == MovementType.Transfer && 
                       m.CreatedAt >= startDate && m.CreatedAt <= endDate)
            .CountAsync();

        return new
        {
            reportTitle = "Monthly Summary Report",
            generatedAt = DateTime.UtcNow,
            period = new { year, month, startDate, endDate },
            summary = new
            {
                assetsCreated,
                disposals,
                maintenanceRecords,
                transfers
            }
        };
    }

    public async Task<object> GetAssetsByStatusReportAsync()
    {
        _logger.LogInformation("?? Generating assets by status report");

        var statusData = await _context.Assets
            .Where(a => !a.IsDeleted)
            .Include(a => a.Status)
            .GroupBy(a => new { a.Status.Id, a.Status.Name, a.Status.Color })
            .Select(g => new
            {
                statusId = g.Key.Id,
                statusName = g.Key.Name,
                color = g.Key.Color ?? "#1890ff",
                assetsCount = g.Count()
            })
            .OrderByDescending(x => x.assetsCount)
            .ToListAsync();

        var result = statusData.Select(s => new
        {
            statusId = s.statusId,
            statusName = TranslateToEnglish(s.statusName),
            color = s.color,
            assetsCount = s.assetsCount
        }).ToList();

        return new
        {
            reportTitle = "Assets by Status Report",
            generatedAt = DateTime.UtcNow,
            data = result
        };
    }

    public async Task<object> GetAssetsByCategoryReportAsync()
    {
        _logger.LogInformation("?? Generating assets by category report");

        var categoryData = await _context.Assets
            .Where(a => !a.IsDeleted)
            .Include(a => a.Category)
            .GroupBy(a => new { a.Category.Id, a.Category.Name, a.Category.Color })
            .Select(g => new
            {
                categoryId = g.Key.Id,
                categoryName = g.Key.Name,
                color = g.Key.Color ?? "#52c41a",
                assetsCount = g.Count()
            })
            .OrderByDescending(x => x.assetsCount)
            .ToListAsync();

        var result = categoryData.Select(c => new
        {
            categoryId = c.categoryId,
            categoryName = TranslateToEnglish(c.categoryName),
            color = c.color,
            assetsCount = c.assetsCount
        }).ToList();

        return new
        {
            reportTitle = "Assets by Category Report",
            generatedAt = DateTime.UtcNow,
            data = result
        };
    }

    public async Task<object> GetAssetsByLocationReportAsync()
    {
        _logger.LogInformation("?? Generating assets by location report");

        var result = new List<object>();

        // Assets by Employee
        var employeeAssets = await _context.Assets
            .Where(a => !a.IsDeleted && a.CurrentEmployeeId.HasValue)
            .Include(a => a.CurrentEmployee)
            .GroupBy(a => new { a.CurrentEmployee!.Id, a.CurrentEmployee.FullName })
            .Select(g => new
            {
                locationType = "Employee",
                locationName = g.Key.FullName,
                assetsCount = g.Count()
            })
            .ToListAsync();

        result.AddRange(employeeAssets);

        return new
        {
            reportTitle = "Assets by Location Report",
            generatedAt = DateTime.UtcNow,
            data = result.OrderByDescending(x => ((dynamic)x).assetsCount)
        };
    }

    public async Task<object> GenerateCustomReportAsync(CustomReportRequest request)
    {
        _logger.LogInformation("?? Generating custom report");

        var results = new Dictionary<string, object>();

        foreach (var reportType in request.ReportTypes)
        {
            switch (reportType.ToLower())
            {
                case "assets":
                    results["assets"] = await GetAssetsSummaryReportAsync(request.StartDate, request.EndDate);
                    break;
                case "disposals":
                    results["disposals"] = await GetDisposalReportAsync(request.StartDate, request.EndDate);
                    break;
                case "maintenance":
                    results["maintenance"] = await GetMaintenanceReportAsync(request.StartDate, request.EndDate);
                    break;
                case "transfers":
                    results["transfers"] = await GetTransfersReportAsync(request.StartDate, request.EndDate);
                    break;
            }
        }

        return new
        {
            reportTitle = "Custom Report",
            generatedAt = DateTime.UtcNow,
            period = new { request.StartDate, request.EndDate },
            format = request.ReportFormat,
            reports = results
        };
    }

    private static string GetMovementLocationText(Assets.Models.AssetMovement movement, bool isFromLocation)
    {
        if (isFromLocation)
        {
            return movement.FromLocationType switch
            {
                LocationType.Employee => movement.FromEmployee?.FullName ?? "Unknown Employee",
                LocationType.Warehouse => movement.FromWarehouse?.Name ?? "Unknown Warehouse",
                LocationType.Department => movement.FromDepartment?.Name ?? "Unknown Department",
                LocationType.Section => movement.FromSection?.Name ?? "Unknown Section",
                _ => "Unknown Location"
            };
        }
        else
        {
            return movement.ToLocationType switch
            {
                LocationType.Employee => movement.ToEmployee?.FullName ?? "Unknown Employee",
                LocationType.Warehouse => movement.ToWarehouse?.Name ?? "Unknown Warehouse",
                LocationType.Department => movement.ToDepartment?.Name ?? "Unknown Department",
                LocationType.Section => movement.ToSection?.Name ?? "Unknown Section",
                _ => "Unknown Location"
            };
        }
    }

    private static string GetPeriodDescription(DateTime? startDate, DateTime? endDate)
    {
        if (startDate.HasValue && endDate.HasValue)
        {
            return $"From {startDate.Value:dd/MM/yyyy} to {endDate.Value:dd/MM/yyyy}";
        }
        else if (startDate.HasValue)
        {
            return $"From {startDate.Value:dd/MM/yyyy}";
        }
        else if (endDate.HasValue)
        {
            return $"Until {endDate.Value:dd/MM/yyyy}";
        }
        else
        {
            return "All Periods";
        }
    }

    private static string TranslateToEnglish(string? arabicText)
    {
        if (string.IsNullOrEmpty(arabicText))
            return "Unknown";

        var lowerText = arabicText.ToLower();
        
        // Categories translation
        if (lowerText.Contains("?????") || lowerText.Contains("???????") || lowerText.Contains("?????"))
            return "Computers & IT";
        if (lowerText.Contains("????") || lowerText.Contains("????"))
            return "Office Furniture";
        if (lowerText.Contains("??????") || lowerText.Contains("?????"))
            return "Vehicles";
        if (lowerText.Contains("????") || lowerText.Contains("?????"))
            return "Electrical Equipment";
        if (lowerText.Contains("?????"))
            return "Tools & Equipment";
        if (lowerText.Contains("?????") || lowerText.Contains("????"))
            return "Buildings & Infrastructure";

        // Statuses translation
        if (lowerText.Contains("???") && !lowerText.Contains("???"))
            return "Active";
        if (lowerText.Contains("??? ???"))
            return "Inactive";
        if (lowerText.Contains("?????"))
            return "Under Maintenance";
        if (lowerText.Contains("????") || lowerText.Contains("????"))
            return "Disposed";
        if (lowerText.Contains("?????"))
            return "Reserved";
        if (lowerText.Contains("?????"))
            return "Lost";

        // Check if contains Arabic characters
        if (arabicText.Any(c => c >= '\u0600' && c <= '\u06FF'))
            return "General Category";

        // Return as-is if already in English
        return arabicText;
    }
}