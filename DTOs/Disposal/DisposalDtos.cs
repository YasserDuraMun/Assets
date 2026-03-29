using System.ComponentModel.DataAnnotations;
using Assets.Enums;

namespace Assets.DTOs.Disposal;

public class CreateDisposalDto
{
    [Required]
    public int AssetId { get; set; }

    [Required]
    public DateTime DisposalDate { get; set; }

    [Required]
    public DisposalReason DisposalReason { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }
}

public class DisposalDto
{
    public int Id { get; set; }
    public int AssetId { get; set; }
    public string AssetName { get; set; } = string.Empty;
    public string AssetSerialNumber { get; set; } = string.Empty;
    public DateTime DisposalDate { get; set; }
    public string DisposalReason { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string PerformedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
