namespace Assets.Models;

public class Warehouse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Location { get; set; }
    public int? ResponsibleEmployeeId { get; set; }
    public int? Capacity { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public Employee? ResponsibleEmployee { get; set; }
    public ICollection<Asset> Assets { get; set; } = new List<Asset>();
    public ICollection<AssetMovement> MovementsFrom { get; set; } = new List<AssetMovement>();
    public ICollection<AssetMovement> MovementsTo { get; set; } = new List<AssetMovement>();
}
