using System.ComponentModel.DataAnnotations;

namespace Assets.DTOs.Warehouse;

public class CreateWarehouseDto
{
    [Required(ErrorMessage = "??? ???????? ?????")]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    public string? Location { get; set; }
    public int? ResponsibleEmployeeId { get; set; }
    public string? Notes { get; set; }
}

public class UpdateWarehouseDto
{
    [Required]
    public int Id { get; set; }

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    public string? Location { get; set; }
    public int? ResponsibleEmployeeId { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; }
}

public class WarehouseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Location { get; set; }
    public int? ResponsibleEmployeeId { get; set; }
    public string? ResponsibleEmployeeName { get; set; }
    public int CurrentAssetsCount { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
