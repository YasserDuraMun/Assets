using System.ComponentModel.DataAnnotations;
using Assets.Enums;

namespace Assets.DTOs.Maintenance;

/// <summary>
/// DTO ?????? ????? ?????
/// </summary>
public class CreateMaintenanceDto
{
    [Required(ErrorMessage = "???? ????? ?????")]
    public int AssetId { get; set; }

    [Required(ErrorMessage = "??? ??????? ?????")]
    public MaintenanceType MaintenanceType { get; set; }

    [Required(ErrorMessage = "????? ??????? ?????")]
    public DateTime MaintenanceDate { get; set; }

    [Required(ErrorMessage = "??? ??????? ?????")]
    [StringLength(500, ErrorMessage = "??? ??????? ??? ?? ???? ??? ?? 500 ???")]
    public string Description { get; set; } = string.Empty;

    [Range(0, double.MaxValue, ErrorMessage = "??????? ??? ?? ???? ???? ?????")]
    public decimal? Cost { get; set; }

    [StringLength(3)]
    public string Currency { get; set; } = "ILS";

    [StringLength(200)]
    public string? PerformedBy { get; set; }

    [StringLength(200)]
    public string? TechnicianName { get; set; }

    [StringLength(200)]
    public string? CompanyName { get; set; }

    public DateTime? ScheduledDate { get; set; }
    public DateTime? NextMaintenanceDate { get; set; }
    public bool WarrantyUsed { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }
}

/// <summary>
/// DTO ?????? ?????? ???????
/// </summary>
public class UpdateMaintenanceDto
{
    [Required]
    public int Id { get; set; }

    [Required(ErrorMessage = "??? ??????? ?????")]
    public MaintenanceType MaintenanceType { get; set; }

    [Required(ErrorMessage = "????? ??????? ?????")]
    public DateTime MaintenanceDate { get; set; }

    [Required(ErrorMessage = "??? ??????? ?????")]
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;

    [Range(0, double.MaxValue, ErrorMessage = "??????? ??? ?? ???? ???? ?????")]
    public decimal? Cost { get; set; }

    [StringLength(3)]
    public string Currency { get; set; } = "ILS";

    [StringLength(200)]
    public string? PerformedBy { get; set; }

    [StringLength(200)]
    public string? TechnicianName { get; set; }

    [StringLength(200)]
    public string? CompanyName { get; set; }

    public MaintenanceStatus Status { get; set; }
    public DateTime? ScheduledDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public DateTime? NextMaintenanceDate { get; set; }
    public bool WarrantyUsed { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }
}

/// <summary>
/// DTO ???? ?????? ??????? ???????
/// </summary>
public class MaintenanceDto
{
    public int Id { get; set; }
    public int AssetId { get; set; }
    public string AssetName { get; set; } = string.Empty;
    public string AssetSerialNumber { get; set; } = string.Empty;

    public MaintenanceType MaintenanceType { get; set; }
    public string MaintenanceTypeText { get; set; } = string.Empty;

    public DateTime MaintenanceDate { get; set; }
    public string Description { get; set; } = string.Empty;

    public decimal? Cost { get; set; }
    public string Currency { get; set; } = "ILS";

    public string? PerformedBy { get; set; }
    public string? TechnicianName { get; set; }
    public string? CompanyName { get; set; }

    public MaintenanceStatus Status { get; set; }
    public string StatusText { get; set; } = string.Empty;

    public DateTime? ScheduledDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public DateTime? NextMaintenanceDate { get; set; }

    public bool WarrantyUsed { get; set; }
    public string? Notes { get; set; }

    public int CreatedBy { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    // ????? ?????? ???????
    public bool IsOverdue => NextMaintenanceDate.HasValue && NextMaintenanceDate < DateTime.Now;
    public bool IsUpcoming => NextMaintenanceDate.HasValue && NextMaintenanceDate <= DateTime.Now.AddDays(30);
    public int DaysUntilNextMaintenance => NextMaintenanceDate.HasValue 
        ? (int)(NextMaintenanceDate.Value - DateTime.Now).TotalDays 
        : int.MaxValue;
}

/// <summary>
/// DTO ?????? ??????? ????????
/// </summary>
public class MaintenanceListDto
{
    public int Id { get; set; }
    public int AssetId { get; set; }
    public string AssetName { get; set; } = string.Empty;
    public string AssetSerialNumber { get; set; } = string.Empty;

    public MaintenanceType MaintenanceType { get; set; }
    public string MaintenanceTypeText { get; set; } = string.Empty;

    public DateTime MaintenanceDate { get; set; }
    public string Description { get; set; } = string.Empty;

    public decimal? Cost { get; set; }
    public string Currency { get; set; } = "ILS";

    public MaintenanceStatus Status { get; set; }
    public string StatusText { get; set; } = string.Empty;
    public string? StatusColor { get; set; }

    public DateTime? NextMaintenanceDate { get; set; }
    public bool IsOverdue { get; set; }
    public bool IsUpcoming { get; set; }

    public string? PerformedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO ?????? ???????
/// </summary>
public class CompleteMaintenanceDto
{
    [Required]
    public int Id { get; set; }

    [Required]
    public DateTime CompletedDate { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "??????? ??? ?? ???? ???? ?????")]
    public decimal? ActualCost { get; set; }

    public DateTime? NextMaintenanceDate { get; set; }

    [StringLength(1000)]
    public string? CompletionNotes { get; set; }
}

/// <summary>
/// DTO ????????? ???????
/// </summary>
public class MaintenanceStatsDto
{
    public int TotalMaintenanceRecords { get; set; }
    public int PendingMaintenance { get; set; }
    public int OverdueMaintenance { get; set; }
    public int CompletedThisMonth { get; set; }
    
    public decimal TotalCostThisMonth { get; set; }
    public decimal TotalCostThisYear { get; set; }
    public string Currency { get; set; } = "ILS";

    public int PreventiveMaintenanceCount { get; set; }
    public int CorrectiveMaintenanceCount { get; set; }
    public int EmergencyMaintenanceCount { get; set; }

    // ?????? ?????? ?????
    public List<AssetMaintenanceStatsDto> TopAssetsByMaintenanceCount { get; set; } = new();
    
    // ???? ?????? ????? ?? ???????
    public List<AssetMaintenanceStatsDto> TopAssetsByMaintenanceCost { get; set; } = new();
}

/// <summary>
/// DTO ????????? ????? ??????
/// </summary>
public class AssetMaintenanceStatsDto
{
    public int AssetId { get; set; }
    public string AssetName { get; set; } = string.Empty;
    public string AssetSerialNumber { get; set; } = string.Empty;
    public int MaintenanceCount { get; set; }
    public decimal TotalCost { get; set; }
    public string Currency { get; set; } = "ILS";
    public DateTime? LastMaintenanceDate { get; set; }
    public DateTime? NextMaintenanceDate { get; set; }
}