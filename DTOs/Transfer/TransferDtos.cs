using System.ComponentModel.DataAnnotations;
using Assets.Enums;

namespace Assets.DTOs.Transfer;

public class CreateTransferDto
{
    [Required(ErrorMessage = "????? ?????")]
    public int AssetId { get; set; }

    [Required(ErrorMessage = "????? ????? ?????")]
    public DateTime TransferDate { get; set; }

    public int? FromEmployeeId { get; set; }
    public int? FromWarehouseId { get; set; }
    public int? FromDepartmentId { get; set; }
    public int? FromSectionId { get; set; }

    public int? ToEmployeeId { get; set; }
    public int? ToWarehouseId { get; set; }
    public int? ToDepartmentId { get; set; }
    public int? ToSectionId { get; set; }

    public string? Reason { get; set; }
    public string? Notes { get; set; }
}

public class LocationDetailsDto
{
    public LocationType? Type { get; set; }
    public string? EmployeeName { get; set; }
    public string? WarehouseName { get; set; }
    public string? DepartmentName { get; set; }
    public string? SectionName { get; set; }
}

public class TransferDto
{
    public int Id { get; set; }
    public int AssetId { get; set; }
    public string AssetName { get; set; } = string.Empty;
    public string AssetSerialNumber { get; set; } = string.Empty;
    public DateTime TransferDate { get; set; }
    
    public string? FromLocation { get; set; }
    public string? ToLocation { get; set; }
    
    // تفاصيل الموقع الكاملة
    public LocationDetailsDto? FromLocationDetails { get; set; }
    public LocationDetailsDto? ToLocationDetails { get; set; }
    
    public string? Reason { get; set; }
    public string? Notes { get; set; }
    
    public string PerformedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
