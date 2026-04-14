using System.ComponentModel.DataAnnotations;

namespace Assets.DTOs.Security
{
    // Role DTOs
    public class RoleDto
    {
        public int RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class CreateRoleDto
    {
        [Required(ErrorMessage = "Role name is required")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Role name must be between 2 and 50 characters")]
        public string RoleName { get; set; } = string.Empty;
    }

    public class UpdateRoleDto
    {
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Role name must be between 2 and 50 characters")]
        public string? RoleName { get; set; }
        
        public bool? IsActive { get; set; }
    }

    // Screen DTOs
    public class ScreenDto
    {
        public int ScreenID { get; set; }
        public string ScreenName { get; set; } = string.Empty;
        public string? SType { get; set; }
        public string? Hint { get; set; }
        public string? MenuOptionGroupName { get; set; }
        public int? MenuOptionID { get; set; }
        public string? MenuOptionName { get; set; }
    }

    public class CreateScreenDto
    {
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
    }

    // Permission DTOs
    public class PermissionDto
    {
        public int PermissionId { get; set; }
        public int RoleID { get; set; }
        public int ScreenID { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public string ScreenName { get; set; } = string.Empty;
        public bool AllowInsert { get; set; }
        public bool AllowUpdate { get; set; }
        public bool AllowDelete { get; set; }
        public bool AllowView { get; set; }
    }

    public class SetPermissionDto
    {
        [Required]
        public int RoleId { get; set; }

        [Required]
        public int ScreenId { get; set; }

        public bool AllowInsert { get; set; }
        public bool AllowUpdate { get; set; }
        public bool AllowDelete { get; set; }
        public bool AllowView { get; set; }
    }

    public class UserPermissionCheckDto
    {
        public int UserId { get; set; }
        public string ScreenName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty; // "view", "insert", "update", "delete"
        public bool HasPermission { get; set; }
    }

    // New DTOs for Role Permissions Management
    public class ScreenPermissionDto
    {
        public string ScreenName { get; set; } = string.Empty;
        public bool AllowView { get; set; }
        public bool AllowInsert { get; set; }
        public bool AllowUpdate { get; set; }
        public bool AllowDelete { get; set; }
    }

    public class UpdateRolePermissionsDto
    {
        public List<ScreenPermissionDto> Permissions { get; set; } = new();
    }
}