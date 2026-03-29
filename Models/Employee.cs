namespace Assets.Models;

public class Employee
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string EmployeeNumber { get; set; } = string.Empty;
    public string? NationalId { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? JobTitle { get; set; }
    
    public int? SectionId { get; set; }
    public int DepartmentId { get; set; }
    
    public DateTime? HireDate { get; set; }
    public string? QRCode { get; set; }
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public Section? Section { get; set; }
    public Department Department { get; set; } = null!;
    public ICollection<Asset> Assets { get; set; } = new List<Asset>();
    public ICollection<AssetMovement> MovementsFrom { get; set; } = new List<AssetMovement>();
    public ICollection<AssetMovement> MovementsTo { get; set; } = new List<AssetMovement>();
}
