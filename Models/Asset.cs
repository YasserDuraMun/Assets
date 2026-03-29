using Assets.Enums;

namespace Assets.Models;

public class Asset
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string SerialNumber { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public string? QRCode { get; set; }

    // ?????
    public int CategoryId { get; set; }
    public int? SubCategoryId { get; set; }

    // ???? ?????
    public int StatusId { get; set; }
    public LocationType CurrentLocationType { get; set; }
    public int? CurrentEmployeeId { get; set; }
    public int? CurrentWarehouseId { get; set; }
    public int? CurrentDepartmentId { get; set; }
    public int? CurrentSectionId { get; set; }

    // ??? ??????
    public string? ImagePath { get; set; }
    public bool HasImage { get; set; }

    // ?????? ??????
    public int? PurchaseOrderId { get; set; }
    public DateTime? PurchaseDate { get; set; }
    public decimal? PurchasePrice { get; set; }
    public int? SupplierId { get; set; }

    // ???????
    public bool HasWarranty { get; set; }
    public int? WarrantyMonths { get; set; }
    public DateTime? WarrantyExpiryDate { get; set; }

    // ????? ?????????
    public int? AcquisitionYear { get; set; }
    public int? LifespanYears { get; set; }
    public DateTime? LifespanEndDate { get; set; }

    // ???????
    public DateTime? NextAuditDate { get; set; }
    public DateTime? LastAuditDate { get; set; }

    // ???????
    public string? Notes { get; set; }

    // Audit fields
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // Navigation properties
    public AssetCategory Category { get; set; } = null!;
    public AssetSubCategory? SubCategory { get; set; }
    public AssetStatus Status { get; set; } = null!;
    public Employee? CurrentEmployee { get; set; }
    public Warehouse? CurrentWarehouse { get; set; }
    public Department? CurrentDepartment { get; set; }
    public Section? CurrentSection { get; set; }
    public Supplier? Supplier { get; set; }
    public PurchaseOrder? PurchaseOrder { get; set; }
    public User? Creator { get; set; }
    public User? Updater { get; set; }

    public ICollection<AssetMovement> Movements { get; set; } = new List<AssetMovement>();
    public ICollection<AssetMaintenance> MaintenanceRecords { get; set; } = new List<AssetMaintenance>();
    public AssetDisposal? Disposal { get; set; }
}
