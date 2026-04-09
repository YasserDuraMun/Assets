using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Assets.Models.Security;

public class Screen
{
    [Key]
    public int ScreenID { get; set; }

    [Required]
    [MaxLength(100)]
    public string ScreenName { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? SType { get; set; }

    [MaxLength(200)]
    public string? Hint { get; set; }

    [MaxLength(100)]
    public string? MenuOptionGroupName { get; set; }

    public int? MenuOptionID { get; set; }

    [MaxLength(100)]
    public string? MenuOptionName { get; set; }

    // Navigation property
    public ICollection<Permission> Permissions { get; set; } = new List<Permission>();
}

public class Role
{
    [Key]
    public int RoleId { get; set; }

    [Required]
    [MaxLength(100)]
    public string RoleName { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ICollection<Permission> Permissions { get; set; } = new List<Permission>();
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}

public class Permission
{
    [Key]
    public int PermissionId { get; set; }

    [Required]
    public int RoleID { get; set; }

    [Required]
    public int ScreenID { get; set; }

    public bool AllowInsert { get; set; } = false;
    public bool AllowUpdate { get; set; } = false;
    public bool AllowDelete { get; set; } = false;
    public bool AllowView { get; set; } = false;

    // Navigation properties
    [ForeignKey(nameof(RoleID))]
    public Role Role { get; set; } = null!;

    [ForeignKey(nameof(ScreenID))]
    public Screen Screen { get; set; } = null!;
}

public class UserRole
{
    [Key]
    public int UserRoleId { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public int RoleId { get; set; }

    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    [ForeignKey(nameof(RoleId))]
    public Role Role { get; set; } = null!;
}
