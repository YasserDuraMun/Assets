using System.ComponentModel.DataAnnotations;
using Assets.Enums;

namespace Assets.DTOs.Asset;

public class CreateAssetDto
{
    [Required(ErrorMessage = "??? ????? ?????")]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required(ErrorMessage = "????? ???????? ?????")]
    [StringLength(100)]
    public string SerialNumber { get; set; } = string.Empty;

    public string? Barcode { get; set; }

    [Required(ErrorMessage = "??????? ?????")]
    public int CategoryId { get; set; }

    public int? SubCategoryId { get; set; }

    [Required(ErrorMessage = "?????? ??????")]
    public int StatusId { get; set; }

    [Required(ErrorMessage = "??? ?????? ?????")]
    public LocationType CurrentLocationType { get; set; }

    public int? CurrentEmployeeId { get; set; }
    public int? CurrentWarehouseId { get; set; }
    public int? CurrentDepartmentId { get; set; }
    public int? CurrentSectionId { get; set; }

    public DateTime? PurchaseDate { get; set; }
    public decimal? PurchasePrice { get; set; }
    public int? SupplierId { get; set; }

    public bool HasWarranty { get; set; }
    public int? WarrantyMonths { get; set; }

    public int? AcquisitionYear { get; set; }
    public int? LifespanYears { get; set; }

    public string? Notes { get; set; }
}

public class UpdateAssetDto
{
    [Required]
    public int Id { get; set; }

    [Required(ErrorMessage = "??? ????? ?????")]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required(ErrorMessage = "????? ???????? ?????")]
    [StringLength(100)]
    public string SerialNumber { get; set; } = string.Empty;

    public string? Barcode { get; set; }

    [Required]
    public int CategoryId { get; set; }

    public int? SubCategoryId { get; set; }

    [Required]
    public int StatusId { get; set; }

    public string? Notes { get; set; }
}

public class AssetDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string SerialNumber { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public string? QRCode { get; set; }
    
    // IDs for form editing
    public int CategoryId { get; set; }
    public int? SubCategoryId { get; set; }
    public int StatusId { get; set; }
    
    // Names for display
    public string CategoryName { get; set; } = string.Empty;
    public string? SubCategoryName { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public string? StatusColor { get; set; }
    
    // Location information
    public int CurrentLocationType { get; set; } // Send as number for consistency
    public string LocationType { get; set; } = string.Empty;
    public string? CurrentLocationName { get; set; }
    
    // Location IDs for pre-filling forms
    public int? CurrentEmployeeId { get; set; }
    public int? CurrentWarehouseId { get; set; }
    public int? CurrentDepartmentId { get; set; }
    public int? CurrentSectionId { get; set; }
    
    // Individual location details for transfers
    public string? CurrentEmployeeName { get; set; }
    public string? CurrentWarehouseName { get; set; }
    public string? CurrentDepartmentName { get; set; }
    public string? CurrentSectionName { get; set; }
    
    public DateTime? PurchaseDate { get; set; }
    public decimal? PurchasePrice { get; set; }
    
    public bool HasWarranty { get; set; }
    public int? WarrantyMonths { get; set; }
    public DateTime? WarrantyExpiryDate { get; set; }
    
    public string? ImagePath { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}

public class AssetListDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string SerialNumber { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string StatusName { get; set; } = string.Empty;
    public string? StatusColor { get; set; }
    public string? CurrentLocationName { get; set; }
    public DateTime? PurchaseDate { get; set; }
}
