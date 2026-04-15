using Assets.Data;
using Assets.DTOs.Common;
using Assets.DTOs.Maintenance;
using Assets.Enums;
using Assets.Models;
using Assets.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Assets.Services.Implementations;

/// <summary>
/// خدمة إدارة صيانة الأصول الثابتة
/// </summary>
public class MaintenanceService : IMaintenanceService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<MaintenanceService> _logger;

    public MaintenanceService(ApplicationDbContext context, ILogger<MaintenanceService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<PagedResult<MaintenanceListDto>> GetAllAsync(
        int pageNumber = 1, 
        int pageSize = 10, 
        string? searchTerm = null, 
        int? assetId = null, 
        MaintenanceType? maintenanceType = null, 
        MaintenanceStatus? status = null, 
        DateTime? startDate = null, 
        DateTime? endDate = null)
    {
        var query = _context.AssetMaintenances
            .Include(m => m.Asset)
            .Include(m => m.Creator)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(m => 
                m.Asset.Name.Contains(searchTerm) ||
                m.Asset.SerialNumber.Contains(searchTerm) ||
                m.Description.Contains(searchTerm) ||
                (m.PerformedBy != null && m.PerformedBy.Contains(searchTerm)) ||
                (m.TechnicianName != null && m.TechnicianName.Contains(searchTerm)) ||
                (m.CompanyName != null && m.CompanyName.Contains(searchTerm)));
        }

        if (assetId.HasValue)
        {
            query = query.Where(m => m.AssetId == assetId.Value);
        }

        if (maintenanceType.HasValue)
        {
            query = query.Where(m => m.MaintenanceType == maintenanceType.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(m => m.Status == status.Value);
        }

        if (startDate.HasValue)
        {
            query = query.Where(m => m.MaintenanceDate >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(m => m.MaintenanceDate <= endDate.Value);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(m => m.MaintenanceDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new MaintenanceListDto
            {
                Id = m.Id,
                AssetId = m.AssetId,
                AssetName = m.Asset.Name,
                AssetSerialNumber = m.Asset.SerialNumber,
                MaintenanceType = m.MaintenanceType,
                MaintenanceTypeText = GetMaintenanceTypeText(m.MaintenanceType),
                MaintenanceDate = m.MaintenanceDate,
                Description = m.Description,
                Cost = m.Cost,
                Currency = m.Currency,
                Status = m.Status,
                StatusText = GetStatusText(m.Status),
                StatusColor = GetStatusColor(m.Status),
                NextMaintenanceDate = m.NextMaintenanceDate,
                IsOverdue = m.NextMaintenanceDate.HasValue && m.NextMaintenanceDate < DateTime.Now,
                IsUpcoming = m.NextMaintenanceDate.HasValue && m.NextMaintenanceDate <= DateTime.Now.AddDays(30),
                PerformedBy = m.PerformedBy,
                CreatedAt = m.CreatedAt
            })
            .ToListAsync();

        return new PagedResult<MaintenanceListDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<MaintenanceDto?> GetByIdAsync(int id)
    {
        var maintenance = await _context.AssetMaintenances
            .Include(m => m.Asset)
            .Include(m => m.Creator)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (maintenance == null)
            return null;

        return new MaintenanceDto
        {
            Id = maintenance.Id,
            AssetId = maintenance.AssetId,
            AssetName = maintenance.Asset.Name,
            AssetSerialNumber = maintenance.Asset.SerialNumber,
            MaintenanceType = maintenance.MaintenanceType,
            MaintenanceTypeText = GetMaintenanceTypeText(maintenance.MaintenanceType),
            MaintenanceDate = maintenance.MaintenanceDate,
            Description = maintenance.Description,
            Cost = maintenance.Cost,
            Currency = maintenance.Currency,
            PerformedBy = maintenance.PerformedBy,
            TechnicianName = maintenance.TechnicianName,
            CompanyName = maintenance.CompanyName,
            Status = maintenance.Status,
            StatusText = GetStatusText(maintenance.Status),
            ScheduledDate = maintenance.ScheduledDate,
            CompletedDate = maintenance.CompletedDate,
            NextMaintenanceDate = maintenance.NextMaintenanceDate,
            WarrantyUsed = maintenance.WarrantyUsed,
            Notes = maintenance.Notes,
            CreatedBy = maintenance.CreatedBy,
            CreatedByName = maintenance.Creator?.FullName ?? "Unknown",
            CreatedAt = maintenance.CreatedAt
        };
    }

    public async Task<List<MaintenanceListDto>> GetByAssetIdAsync(int assetId)
    {
        return await _context.AssetMaintenances
            .Include(m => m.Asset)
            .Where(m => m.AssetId == assetId)
            .OrderByDescending(m => m.MaintenanceDate)
            .Select(m => new MaintenanceListDto
            {
                Id = m.Id,
                AssetId = m.AssetId,
                AssetName = m.Asset.Name,
                AssetSerialNumber = m.Asset.SerialNumber,
                MaintenanceType = m.MaintenanceType,
                MaintenanceTypeText = GetMaintenanceTypeText(m.MaintenanceType),
                MaintenanceDate = m.MaintenanceDate,
                Description = m.Description,
                Cost = m.Cost,
                Currency = m.Currency,
                Status = m.Status,
                StatusText = GetStatusText(m.Status),
                StatusColor = GetStatusColor(m.Status),
                NextMaintenanceDate = m.NextMaintenanceDate,
                IsOverdue = m.NextMaintenanceDate.HasValue && m.NextMaintenanceDate < DateTime.Now,
                IsUpcoming = m.NextMaintenanceDate.HasValue && m.NextMaintenanceDate <= DateTime.Now.AddDays(30),
                PerformedBy = m.PerformedBy,
                CreatedAt = m.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<MaintenanceDto> CreateAsync(CreateMaintenanceDto dto, int userId)
    {
        // Verify asset exists
        var asset = await _context.Assets.FindAsync(dto.AssetId);
        if (asset == null)
            throw new Exception("الأصل غير موجود");

        // Verify user exists in SecurityUsers
        var user = await _context.SecurityUsers.FindAsync(userId);
        if (user == null)
            throw new Exception("المستخدم غير موجود");

        var maintenance = new AssetMaintenance
        {
            AssetId = dto.AssetId,
            MaintenanceType = dto.MaintenanceType,
            MaintenanceDate = dto.MaintenanceDate,
            Description = dto.Description,
            Cost = dto.Cost,
            Currency = dto.Currency,
            PerformedBy = dto.PerformedBy,
            TechnicianName = dto.TechnicianName,
            CompanyName = dto.CompanyName,
            Status = MaintenanceStatus.Scheduled,
            ScheduledDate = dto.ScheduledDate,
            NextMaintenanceDate = dto.NextMaintenanceDate,
            WarrantyUsed = dto.WarrantyUsed,
            Notes = dto.Notes,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow
        };

        // If maintenance date is today or in the past, mark as completed
        if (maintenance.MaintenanceDate <= DateTime.Today)
        {
            maintenance.Status = MaintenanceStatus.Completed;
            maintenance.CompletedDate = maintenance.MaintenanceDate;
        }

        _context.AssetMaintenances.Add(maintenance);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created maintenance record {Id} for asset {AssetId} by user {UserId}", 
            maintenance.Id, dto.AssetId, userId);

        var result = await GetByIdAsync(maintenance.Id);
        if (result == null)
        {
            _logger.LogError("Failed to retrieve maintenance record {Id} after creation", maintenance.Id);
            throw new Exception($"فشل في استرجاع سجل الصيانة بعد الإنشاء. ID: {maintenance.Id}");
        }
        
        return result;
    }

    public async Task<MaintenanceDto> UpdateAsync(UpdateMaintenanceDto dto, int userId)
    {
        var maintenance = await _context.AssetMaintenances.FindAsync(dto.Id);
        if (maintenance == null)
            throw new Exception("سجل الصيانة غير موجود");

        // Update fields
        maintenance.MaintenanceType = dto.MaintenanceType;
        maintenance.MaintenanceDate = dto.MaintenanceDate;
        maintenance.Description = dto.Description;
        maintenance.Cost = dto.Cost;
        maintenance.Currency = dto.Currency;
        maintenance.PerformedBy = dto.PerformedBy;
        maintenance.TechnicianName = dto.TechnicianName;
        maintenance.CompanyName = dto.CompanyName;
        maintenance.Status = dto.Status;
        maintenance.ScheduledDate = dto.ScheduledDate;
        maintenance.CompletedDate = dto.CompletedDate;
        maintenance.NextMaintenanceDate = dto.NextMaintenanceDate;
        maintenance.WarrantyUsed = dto.WarrantyUsed;
        maintenance.Notes = dto.Notes;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated maintenance record {Id} by user {UserId}", dto.Id, userId);

        var result = await GetByIdAsync(maintenance.Id);
        if (result == null)
        {
            _logger.LogError("Failed to retrieve maintenance record {Id} after update", maintenance.Id);
            throw new Exception($"فشل في استرجاع سجل الصيانة بعد التحديث. ID: {maintenance.Id}");
        }
        
        return result;
    }

    public async Task<MaintenanceDto> CompleteMaintenanceAsync(CompleteMaintenanceDto dto, int userId)
    {
        var maintenance = await _context.AssetMaintenances.FindAsync(dto.Id);
        if (maintenance == null)
            throw new Exception("سجل الصيانة غير موجود");

        maintenance.Status = MaintenanceStatus.Completed;
        maintenance.CompletedDate = dto.CompletedDate;
        
        if (dto.ActualCost.HasValue)
        {
            maintenance.Cost = dto.ActualCost.Value;
        }

        if (dto.NextMaintenanceDate.HasValue)
        {
            maintenance.NextMaintenanceDate = dto.NextMaintenanceDate.Value;
        }

        if (!string.IsNullOrWhiteSpace(dto.CompletionNotes))
        {
            maintenance.Notes = string.IsNullOrWhiteSpace(maintenance.Notes)
                ? dto.CompletionNotes
                : maintenance.Notes + "\n\nملاحظات الإكمال: " + dto.CompletionNotes;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Completed maintenance record {Id} by user {UserId}", dto.Id, userId);

        var result = await GetByIdAsync(maintenance.Id);
        if (result == null)
        {
            _logger.LogError("Failed to retrieve maintenance record {Id} after completion", maintenance.Id);
            throw new Exception($"فشل في استرجاع سجل الصيانة بعد الإكمال. ID: {maintenance.Id}");
        }
        
        return result;
    }

    public async Task<bool> CancelMaintenanceAsync(int id, int userId, string? cancellationReason = null)
    {
        var maintenance = await _context.AssetMaintenances.FindAsync(id);
        if (maintenance == null)
            return false;

        maintenance.Status = MaintenanceStatus.Cancelled;
        
        if (!string.IsNullOrWhiteSpace(cancellationReason))
        {
            maintenance.Notes = string.IsNullOrWhiteSpace(maintenance.Notes)
                ? "السبب: " + cancellationReason
                : maintenance.Notes + "\n\nالسبب: " + cancellationReason;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Cancelled maintenance record {Id} by user {UserId}", id, userId);

        return true;
    }

    public async Task<List<MaintenanceListDto>> GetUpcomingMaintenanceAsync(int days = 30)
    {
        var cutoffDate = DateTime.Now.AddDays(days);

        return await _context.AssetMaintenances
            .Include(m => m.Asset)
            .Where(m => m.NextMaintenanceDate.HasValue && 
                       m.NextMaintenanceDate <= cutoffDate &&
                       m.Status != MaintenanceStatus.Cancelled)
            .OrderBy(m => m.NextMaintenanceDate)
            .Select(m => new MaintenanceListDto
            {
                Id = m.Id,
                AssetId = m.AssetId,
                AssetName = m.Asset.Name,
                AssetSerialNumber = m.Asset.SerialNumber,
                MaintenanceType = m.MaintenanceType,
                MaintenanceTypeText = GetMaintenanceTypeText(m.MaintenanceType),
                MaintenanceDate = m.MaintenanceDate,
                Description = m.Description,
                Cost = m.Cost,
                Currency = m.Currency,
                Status = m.Status,
                StatusText = GetStatusText(m.Status),
                StatusColor = GetStatusColor(m.Status),
                NextMaintenanceDate = m.NextMaintenanceDate,
                IsOverdue = m.NextMaintenanceDate.HasValue && m.NextMaintenanceDate < DateTime.Now,
                IsUpcoming = true,
                PerformedBy = m.PerformedBy,
                CreatedAt = m.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<List<MaintenanceListDto>> GetOverdueMaintenanceAsync()
    {
        return await _context.AssetMaintenances
            .Include(m => m.Asset)
            .Where(m => m.NextMaintenanceDate.HasValue && 
                       m.NextMaintenanceDate < DateTime.Now &&
                       m.Status != MaintenanceStatus.Cancelled &&
                       m.Status != MaintenanceStatus.Completed)
            .OrderBy(m => m.NextMaintenanceDate)
            .Select(m => new MaintenanceListDto
            {
                Id = m.Id,
                AssetId = m.AssetId,
                AssetName = m.Asset.Name,
                AssetSerialNumber = m.Asset.SerialNumber,
                MaintenanceType = m.MaintenanceType,
                MaintenanceTypeText = GetMaintenanceTypeText(m.MaintenanceType),
                MaintenanceDate = m.MaintenanceDate,
                Description = m.Description,
                Cost = m.Cost,
                Currency = m.Currency,
                Status = m.Status,
                StatusText = GetStatusText(m.Status),
                StatusColor = GetStatusColor(m.Status),
                NextMaintenanceDate = m.NextMaintenanceDate,
                IsOverdue = true,
                IsUpcoming = false,
                PerformedBy = m.PerformedBy,
                CreatedAt = m.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<MaintenanceStatsDto> GetMaintenanceStatsAsync()
    {
        var now = DateTime.Now;
        var startOfMonth = new DateTime(now.Year, now.Month, 1);
        var startOfYear = new DateTime(now.Year, 1, 1);

        var totalCount = await _context.AssetMaintenances.CountAsync();
        var pendingCount = await _context.AssetMaintenances
            .CountAsync(m => m.Status == MaintenanceStatus.Scheduled || m.Status == MaintenanceStatus.InProgress);
        var overdueCount = await _context.AssetMaintenances
            .CountAsync(m => m.NextMaintenanceDate.HasValue && 
                           m.NextMaintenanceDate < now &&
                           m.Status != MaintenanceStatus.Cancelled &&
                           m.Status != MaintenanceStatus.Completed);
        var completedThisMonth = await _context.AssetMaintenances
            .CountAsync(m => m.Status == MaintenanceStatus.Completed && m.CompletedDate >= startOfMonth);

        var costThisMonth = await _context.AssetMaintenances
            .Where(m => m.CompletedDate >= startOfMonth && m.Cost.HasValue)
            .SumAsync(m => m.Cost ?? 0);

        var costThisYear = await _context.AssetMaintenances
            .Where(m => m.CompletedDate >= startOfYear && m.Cost.HasValue)
            .SumAsync(m => m.Cost ?? 0);

        var preventiveCount = await _context.AssetMaintenances
            .CountAsync(m => m.MaintenanceType == MaintenanceType.Preventive);
        var correctiveCount = await _context.AssetMaintenances
            .CountAsync(m => m.MaintenanceType == MaintenanceType.Corrective);
        var emergencyCount = await _context.AssetMaintenances
            .CountAsync(m => m.MaintenanceType == MaintenanceType.Emergency);

        // Top assets by maintenance count
        var topAssetsByCount = await _context.AssetMaintenances
            .Include(m => m.Asset)
            .GroupBy(m => new { m.AssetId, m.Asset.Name, m.Asset.SerialNumber })
            .Select(g => new AssetMaintenanceStatsDto
            {
                AssetId = g.Key.AssetId,
                AssetName = g.Key.Name,
                AssetSerialNumber = g.Key.SerialNumber,
                MaintenanceCount = g.Count(),
                TotalCost = g.Sum(m => m.Cost ?? 0),
                Currency = "ILS",
                LastMaintenanceDate = g.Max(m => m.MaintenanceDate),
                NextMaintenanceDate = g.Where(m => m.NextMaintenanceDate.HasValue)
                                      .Max(m => m.NextMaintenanceDate)
            })
            .OrderByDescending(a => a.MaintenanceCount)
            .Take(10)
            .ToListAsync();

        // Top assets by maintenance cost
        var topAssetsByCost = await _context.AssetMaintenances
            .Include(m => m.Asset)
            .Where(m => m.Cost.HasValue)
            .GroupBy(m => new { m.AssetId, m.Asset.Name, m.Asset.SerialNumber })
            .Select(g => new AssetMaintenanceStatsDto
            {
                AssetId = g.Key.AssetId,
                AssetName = g.Key.Name,
                AssetSerialNumber = g.Key.SerialNumber,
                MaintenanceCount = g.Count(),
                TotalCost = g.Sum(m => m.Cost ?? 0),
                Currency = "ILS",
                LastMaintenanceDate = g.Max(m => m.MaintenanceDate),
                NextMaintenanceDate = g.Where(m => m.NextMaintenanceDate.HasValue)
                                      .Max(m => m.NextMaintenanceDate)
            })
            .OrderByDescending(a => a.TotalCost)
            .Take(10)
            .ToListAsync();

        return new MaintenanceStatsDto
        {
            TotalMaintenanceRecords = totalCount,
            PendingMaintenance = pendingCount,
            OverdueMaintenance = overdueCount,
            CompletedThisMonth = completedThisMonth,
            TotalCostThisMonth = costThisMonth,
            TotalCostThisYear = costThisYear,
            Currency = "ILS",
            PreventiveMaintenanceCount = preventiveCount,
            CorrectiveMaintenanceCount = correctiveCount,
            EmergencyMaintenanceCount = emergencyCount,
            TopAssetsByMaintenanceCount = topAssetsByCount,
            TopAssetsByMaintenanceCost = topAssetsByCost
        };
    }

    public async Task<AssetMaintenanceStatsDto> GetAssetMaintenanceStatsAsync(int assetId)
    {
        var asset = await _context.Assets.FindAsync(assetId);
        if (asset == null)
            throw new Exception("الأصل غير موجود");

        var maintenanceRecords = await _context.AssetMaintenances
            .Where(m => m.AssetId == assetId)
            .ToListAsync();

        return new AssetMaintenanceStatsDto
        {
            AssetId = assetId,
            AssetName = asset.Name,
            AssetSerialNumber = asset.SerialNumber,
            MaintenanceCount = maintenanceRecords.Count,
            TotalCost = maintenanceRecords.Where(m => m.Cost.HasValue).Sum(m => m.Cost ?? 0),
            Currency = "ILS",
            LastMaintenanceDate = maintenanceRecords.Any() ? maintenanceRecords.Max(m => m.MaintenanceDate) : null,
            NextMaintenanceDate = maintenanceRecords
                .Where(m => m.NextMaintenanceDate.HasValue)
                .Max(m => m.NextMaintenanceDate)
        };
    }

    public async Task<MaintenanceDto> SchedulePreventiveMaintenanceAsync(
        int assetId, 
        DateTime scheduledDate, 
        string description, 
        int intervalMonths, 
        int userId)
    {
        var createDto = new CreateMaintenanceDto
        {
            AssetId = assetId,
            MaintenanceType = MaintenanceType.Preventive,
            MaintenanceDate = scheduledDate,
            Description = description,
            ScheduledDate = scheduledDate,
            NextMaintenanceDate = scheduledDate.AddMonths(intervalMonths),
            Currency = "ILS"
        };

        return await CreateAsync(createDto, userId);
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var maintenance = await _context.AssetMaintenances.FindAsync(id);
        if (maintenance == null)
            return false;

        _context.AssetMaintenances.Remove(maintenance);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted maintenance record {Id} by user {UserId}", id, userId);

        return true;
    }

    public async Task<object> GetMonthlyMaintenanceReportAsync(int year, int month)
    {
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        var maintenanceRecords = await _context.AssetMaintenances
            .Include(m => m.Asset)
            .Where(m => m.MaintenanceDate >= startDate && m.MaintenanceDate <= endDate)
            .ToListAsync();

        return new
        {
            Year = year,
            Month = month,
            TotalRecords = maintenanceRecords.Count,
            TotalCost = maintenanceRecords.Where(m => m.Cost.HasValue).Sum(m => m.Cost ?? 0),
            Currency = "ILS",
            ByType = maintenanceRecords.GroupBy(m => m.MaintenanceType)
                .Select(g => new { Type = g.Key.ToString(), Count = g.Count(), Cost = g.Sum(m => m.Cost ?? 0) }),
            ByStatus = maintenanceRecords.GroupBy(m => m.Status)
                .Select(g => new { Status = g.Key.ToString(), Count = g.Count() }),
            Records = maintenanceRecords.Select(m => new
            {
                m.Id,
                AssetName = m.Asset.Name,
                m.MaintenanceType,
                m.MaintenanceDate,
                m.Description,
                m.Cost,
                m.Status
            }).ToList()
        };
    }

    public List<object> GetMaintenanceTypes()
    {
        return Enum.GetValues<MaintenanceType>()
            .Select(t => new { value = (int)t, label = GetMaintenanceTypeText(t) })
            .ToList<object>();
    }

    public List<object> GetMaintenanceStatuses()
    {
        return Enum.GetValues<MaintenanceStatus>()
            .Select(s => new { value = (int)s, label = GetStatusText(s), color = GetStatusColor(s) })
            .ToList<object>();
    }

    #region Helper Methods

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

    private static string GetStatusText(MaintenanceStatus status)
    {
        return status switch
        {
            MaintenanceStatus.Scheduled => "مجدولة",
            MaintenanceStatus.InProgress => "قيد التنفيذ",
            MaintenanceStatus.Completed => "مكتملة",
            MaintenanceStatus.Cancelled => "ملغاة",
            _ => status.ToString()
        };
    }

    private static string GetStatusColor(MaintenanceStatus status)
    {
        return status switch
        {
            MaintenanceStatus.Scheduled => "blue",
            MaintenanceStatus.InProgress => "orange",
            MaintenanceStatus.Completed => "green",
            MaintenanceStatus.Cancelled => "red",
            _ => "default"
        };
    }

    #endregion
}
