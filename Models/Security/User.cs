using System.ComponentModel.DataAnnotations;

namespace Assets.Models.Security;

public class User
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string PasswordHash { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<AssetMaintenance> CreatedMaintenances { get; set; } = new List<AssetMaintenance>();
    public ICollection<AssetMovement> PerformedMovements { get; set; } = new List<AssetMovement>();
    public ICollection<AssetDisposal> PerformedDisposals { get; set; } = new List<AssetDisposal>();
}
