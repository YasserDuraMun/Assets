using Assets.Enums;
using Assets.Models.Security;

namespace Assets.Models;

public class AssetMaintenance
{
    public int Id { get; set; }
    public int AssetId { get; set; }
    public MaintenanceType MaintenanceType { get; set; }
    public DateTime MaintenanceDate { get; set; }
    public string Description { get; set; } = string.Empty;

    // ??????? ???????
    public decimal? Cost { get; set; }
    public string Currency { get; set; } = "ILS";

    // ??????? ??????
    public string? PerformedBy { get; set; }
    public string? TechnicianName { get; set; }
    public string? CompanyName { get; set; }

    // ??????
    public MaintenanceStatus Status { get; set; }
    public DateTime? ScheduledDate { get; set; }
    public DateTime? CompletedDate { get; set; }

    // ????????
    public DateTime? NextMaintenanceDate { get; set; }
    public bool WarrantyUsed { get; set; }

    public string? Notes { get; set; }
    public int CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Asset Asset { get; set; } = null!;
    public Security.User Creator { get; set; } = null!;  // SecurityUser
}
