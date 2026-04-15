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
            .Where(a => a.Category != null)
            .GroupBy(a => a.Category.Name)
            .Select(g => new { Category = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .ToListAsync();

        var assetsByStatus = await query
            .Include(a => a.Status)
            .Where(a => !a.IsDeleted && a.Status != null)
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
            assetsByCategory = assetsByCategory.Take(10).Select(x => new { category = x.Category, count = x.Count }),
            assetsByStatus = assetsByStatus.Select(x => new { status = x.Status, count = x.Count }),
            charts = new
            {
                categoryDistribution = assetsByCategory.Select(x => new { label = x.Category, value = x.Count }),
                statusDistribution = assetsByStatus.Select(x => new { label = x.Status, value = x.Count })
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
                    reasonText = GetDisposalReasonText(g.Key),
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
                    reasonText = GetDisposalReasonText(d.DisposalReason),
                    notes = d.Notes,
                    performedBy = d.PerformedByUser?.FullName ?? "غير معروف"
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
                    typeText = GetMaintenanceTypeText(g.Key),
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
                    type = GetMaintenanceTypeText(m.MaintenanceType),
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
                    performedBy = t.PerformedByUser?.FullName ?? t.PerformedByUser?.Email ?? "System"
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
            .Where(a => !a.IsDeleted && a.Status != null)
            .Include(a => a.Status)
            .GroupBy(a => new { a.Status!.Id, a.Status.Name, a.Status.Color })
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
            statusName = s.statusName,
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
            .Where(a => !a.IsDeleted && a.Category != null)
            .Include(a => a.Category)
            .GroupBy(a => new { a.Category!.Id, a.Category.Name, a.Category.Color })
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
            categoryName = c.categoryName,
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

    private static string GetDisposalReasonText(DisposalReason reason)
    {
        return reason switch
        {
            DisposalReason.Damaged => "تالف/معطوب",
            DisposalReason.Obsolete => "قديم/غير صالح للاستخدام",
            DisposalReason.Lost => "مفقود",
            DisposalReason.Stolen => "مسروق",
            DisposalReason.EndOfLife => "انتهاء العمر الافتراضي",
            DisposalReason.Maintenance => "صيانة وإصلاح شامل",
            DisposalReason.Replacement => "تم الاستبدال",
            DisposalReason.Other => "أخرى",
            _ => reason.ToString()
        };
    }

    private static string GetMaintenanceTypeText(MaintenanceType type)
    {
        return type switch
        {
            MaintenanceType.Preventive => "صيانة وقائية",
            MaintenanceType.Corrective => "صيانة إصلاحية",
            MaintenanceType.Emergency => "صيانة طارئة",
            MaintenanceType.Routine => "صيانة دورية",
            MaintenanceType.Upgrade => "ترقية/تحسين",
            _ => type.ToString()
        };
    }

    /// <summary>
    /// الحصول على الأصول حسب الدائرة/القسم مع تفاصيل QR code للطباعة
    /// </summary>
    public async Task<object> GetAssetsByLocationDetailAsync(int? departmentId = null, int? sectionId = null)
    {
        _logger.LogInformation("Getting assets by location detail - DepartmentId: {DeptId}, SectionId: {SectId}", 
            departmentId, sectionId);

        var query = _context.Assets
            .Where(a => !a.IsDeleted)
            .Include(a => a.Category)
            .Include(a => a.Status)
            .Include(a => a.CurrentEmployee)
            .Include(a => a.CurrentWarehouse)
            .Include(a => a.CurrentDepartment)
            .Include(a => a.CurrentSection)
            .AsQueryable();

        // Filter by department if provided
        if (departmentId.HasValue)
        {
            query = query.Where(a => a.CurrentDepartmentId == departmentId.Value);
        }

        // Filter by section if provided
        if (sectionId.HasValue)
        {
            query = query.Where(a => a.CurrentSectionId == sectionId.Value);
        }

        var assets = await query
            .OrderBy(a => a.Name)
            .Select(a => new
            {
                Id = a.Id,
                Name = a.Name,
                SerialNumber = a.SerialNumber,
                Barcode = a.Barcode,
                QRCode = a.QRCode,
                CategoryName = a.Category.Name,
                StatusName = a.Status.Name,
                StatusColor = a.Status.Color,
                CurrentLocationType = (int)a.CurrentLocationType,
                CurrentEmployeeName = a.CurrentEmployee != null ? a.CurrentEmployee.FullName : null,
                CurrentWarehouseName = a.CurrentWarehouse!= null ? a.CurrentWarehouse.Name : null,
                CurrentDepartmentName = a.CurrentDepartment != null ? a.CurrentDepartment.Name : null,
                CurrentSectionName = a.CurrentSection != null ? a.CurrentSection.Name : null,
                PurchaseDate = a.PurchaseDate,
                PurchasePrice = a.PurchasePrice,
                Notes = a.Notes
            })
            .ToListAsync();

        // Get location information
        string? locationFilter = null;
        string? departmentName = null;
        string? sectionName = null;

        if (departmentId.HasValue)
        {
            var dept = await _context.Departments.FindAsync(departmentId.Value);
            departmentName = dept?.Name;
            locationFilter = $"الدائرة: {departmentName}";
        }

        if (sectionId.HasValue)
        {
            var sect = await _context.Sections.FindAsync(sectionId.Value);
            sectionName = sect?.Name;
            if (locationFilter != null)
                locationFilter += $" - القسم: {sectionName}";
            else
                locationFilter = $"القسم: {sectionName}";
        }

        if (locationFilter == null)
        {
            locationFilter = "جميع المواقع";
        }

        return new
        {
            Summary = new
            {
                TotalAssets = assets.Count,
                LocationFilter = locationFilter,
                DepartmentName = departmentName,
                SectionName = sectionName,
                GeneratedAt = DateTime.Now
            },
            Assets = assets
        };
    }
}