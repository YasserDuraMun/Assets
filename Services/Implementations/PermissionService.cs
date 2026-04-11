using Microsoft.EntityFrameworkCore;
using Assets.Data;
using Assets.DTOs.Security;
using Assets.Services.Interfaces;

namespace Assets.Services.Implementations
{
    public class PermissionService : IPermissionService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<PermissionService> _logger;

        public PermissionService(ApplicationDbContext context, ILogger<PermissionService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<bool> HasPermissionAsync(int userId, string screenName, string action)
        {
            try
            {
                var user = await _context.SecurityUsers
                    .Include(u => u.UserRoles)
                        .ThenInclude(ur => ur.Role)
                            .ThenInclude(r => r.Permissions)
                                .ThenInclude(p => p.Screen)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null) return false;

                var hasPermission = user.UserRoles
                    .SelectMany(ur => ur.Role.Permissions)
                    .Any(p => p.Screen.ScreenName == screenName &&
                             action.ToLower() switch
                             {
                                 "view" => p.AllowView,
                                 "insert" => p.AllowInsert,
                                 "update" => p.AllowUpdate,
                                 "delete" => p.AllowDelete,
                                 _ => false
                             });

                return hasPermission;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking permission for user {UserId}, screen {ScreenName}, action {Action}", userId, screenName, action);
                return false;
            }
        }

        public async Task<List<PermissionDto>> GetUserPermissionsAsync(int userId)
        {
            try
            {
                _logger.LogInformation("?? Getting permissions for user ID: {UserId}", userId);

                // First, get user with roles
                var user = await _context.SecurityUsers
                    .Include(u => u.UserRoles)
                        .ThenInclude(ur => ur.Role)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                {
                    _logger.LogWarning("? User not found: {UserId}", userId);
                    return new List<PermissionDto>();
                }

                _logger.LogInformation("?? User found: {UserEmail}, Roles: {RoleCount}", user.Email, user.UserRoles.Count);
                
                foreach (var userRole in user.UserRoles)
                {
                    _logger.LogInformation("?? User role: {RoleName} (ID: {RoleId})", userRole.Role.RoleName, userRole.Role.RoleId);
                }

                // Get permissions for all user roles
                var roleIds = user.UserRoles.Select(ur => ur.RoleId).ToList();
                _logger.LogInformation("?? Looking for permissions in roles: [{RoleIds}]", string.Join(", ", roleIds));

                var permissions = await _context.Permissions
                    .Where(p => roleIds.Contains(p.RoleID))
                    .Include(p => p.Role)
                    .Include(p => p.Screen)
                    .Select(p => new PermissionDto
                    {
                        PermissionId = p.PermissionId,
                        RoleID = p.RoleID,
                        ScreenID = p.ScreenID,
                        RoleName = p.Role.RoleName,
                        ScreenName = p.Screen.ScreenName,
                        AllowInsert = p.AllowInsert,
                        AllowUpdate = p.AllowUpdate,
                        AllowDelete = p.AllowDelete,
                        AllowView = p.AllowView
                    })
                    .ToListAsync();

                _logger.LogInformation("??? Found {PermissionCount} permissions", permissions.Count);
                
                foreach (var perm in permissions)
                {
                    _logger.LogInformation("?? {ScreenName}: View={AllowView}, Insert={AllowInsert}, Update={AllowUpdate}, Delete={AllowDelete}", 
                        perm.ScreenName, perm.AllowView, perm.AllowInsert, perm.AllowUpdate, perm.AllowDelete);
                }

                return permissions;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "? Error getting permissions for user {UserId}", userId);
                return new List<PermissionDto>();
            }
        }

        public async Task<List<PermissionDto>> GetRolePermissionsAsync(int roleId)
        {
            try
            {
                var permissions = await _context.Permissions
                    .Where(p => p.RoleID == roleId)
                    .Include(p => p.Role)
                    .Include(p => p.Screen)
                    .Select(p => new PermissionDto
                    {
                        PermissionId = p.PermissionId,
                        RoleID = p.RoleID,
                        ScreenID = p.ScreenID,
                        RoleName = p.Role.RoleName,
                        ScreenName = p.Screen.ScreenName,
                        AllowInsert = p.AllowInsert,
                        AllowUpdate = p.AllowUpdate,
                        AllowDelete = p.AllowDelete,
                        AllowView = p.AllowView
                    })
                    .ToListAsync();

                return permissions;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting permissions for role {RoleId}", roleId);
                return new List<PermissionDto>();
            }
        }

        public async Task<bool> SetPermissionAsync(SetPermissionDto request)
        {
            try
            {
                var existingPermission = await _context.Permissions
                    .FirstOrDefaultAsync(p => p.RoleID == request.RoleId && p.ScreenID == request.ScreenId);

                if (existingPermission != null)
                {
                    // Update existing permission
                    existingPermission.AllowInsert = request.AllowInsert;
                    existingPermission.AllowUpdate = request.AllowUpdate;
                    existingPermission.AllowDelete = request.AllowDelete;
                    existingPermission.AllowView = request.AllowView;
                }
                else
                {
                    // Create new permission
                    var newPermission = new Assets.Models.Security.Permission
                    {
                        RoleID = request.RoleId,
                        ScreenID = request.ScreenId,
                        AllowInsert = request.AllowInsert,
                        AllowUpdate = request.AllowUpdate,
                        AllowDelete = request.AllowDelete,
                        AllowView = request.AllowView
                    };

                    _context.Permissions.Add(newPermission);
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting permission for role {RoleId}, screen {ScreenId}", request.RoleId, request.ScreenId);
                return false;
            }
        }

        public async Task<bool> RemovePermissionAsync(int roleId, int screenId)
        {
            try
            {
                var permission = await _context.Permissions
                    .FirstOrDefaultAsync(p => p.RoleID == roleId && p.ScreenID == screenId);

                if (permission == null)
                    return false;

                _context.Permissions.Remove(permission);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing permission for role {RoleId}, screen {ScreenId}", roleId, screenId);
                return false;
            }
        }
    }
}