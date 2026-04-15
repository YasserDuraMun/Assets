using Assets.Enums;
using Assets.Models.Security;

namespace Assets.Models;

public class AssetMovement
{
    public int Id { get; set; }
    public int AssetId { get; set; }
    public MovementType MovementType { get; set; }
    public DateTime MovementDate { get; set; }

    // From Location (???? ????? ???????)
    public LocationType? FromLocationType { get; set; }
    public int? FromEmployeeId { get; set; }
    public int? FromWarehouseId { get; set; }
    public int? FromDepartmentId { get; set; }
    public int? FromSectionId { get; set; }

    // To Location (???? ????? ???????)
    public LocationType? ToLocationType { get; set; }
    public int? ToEmployeeId { get; set; }
    public int? ToWarehouseId { get; set; }
    public int? ToDepartmentId { get; set; }
    public int? ToSectionId { get; set; }

    // Additional Info
    public string? Reason { get; set; }
    public string? Notes { get; set; }
    public string? DocumentPath { get; set; }

    // Audit Fields
    public int PerformedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties (???? ????? ???????)
    public Asset Asset { get; set; } = null!;
    
    // From Navigation Properties
    public Employee? FromEmployee { get; set; }
    public Warehouse? FromWarehouse { get; set; }
    public Department? FromDepartment { get; set; }
    public Section? FromSection { get; set; }
    
    // To Navigation Properties
    public Employee? ToEmployee { get; set; }
    public Warehouse? ToWarehouse { get; set; }
    public Department? ToDepartment { get; set; }
    public Section? ToSection { get; set; }
    
    
    public Security.User PerformedByUser { get; set; } = null!;  // SecurityUser
}
