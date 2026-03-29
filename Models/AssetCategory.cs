namespace Assets.Models;

public class AssetCategory
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; } = "#1890ff"; // Default blue color
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<AssetSubCategory> SubCategories { get; set; } = new List<AssetSubCategory>();
    public ICollection<Asset> Assets { get; set; } = new List<Asset>();
}
