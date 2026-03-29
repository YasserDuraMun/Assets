using Assets.Enums;

namespace Assets.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }

    // Navigation properties
    public ICollection<AssetMovement> PerformedMovements { get; set; } = new List<AssetMovement>();
    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
}
