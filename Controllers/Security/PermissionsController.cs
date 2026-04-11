using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Assets.Data;
using Assets.DTOs.Security;
using Assets.Services.Interfaces;

namespace Assets.Controllers.Security;

[ApiController]
[Route("api/security/[controller]")]
[Authorize]
public class PermissionsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IPermissionService _permissionService;
    private readonly ILogger<PermissionsController> _logger;

    public PermissionsController(ApplicationDbContext context, IPermissionService permissionService, ILogger<PermissionsController> logger)
    {
        _context = context;
        _permissionService = permissionService;
        _logger = logger;
    }

    /// <summary>
    /// Get all roles for permissions management
    /// </summary>
    [HttpGet("roles")]
    [Authorize(Roles = "Super Admin,Admin,Manager")]
    public async Task<IActionResult> GetRoles()
    {
        try
        {
            var roles = await _context.Roles
                .Where(r => r.IsActive)
                .Select(r => new 
                {
                    roleId = r.RoleId,
                    roleName = r.RoleName,
                    isActive = r.IsActive
                })
                .ToListAsync();

            return Ok(new { success = true, data = roles });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting roles");
            return StatusCode(500, new { success = false, message = "Error getting roles" });
        }
    }

    /// <summary>
    /// Get permissions for a specific role
    /// </summary>
    [HttpGet("roles/{roleId}/permissions")]
    [Authorize(Roles = "Super Admin,Admin,Manager")]
    public async Task<IActionResult> GetRoleScreenPermissions(int roleId)
    {
        try
        {
            var permissions = await _context.Permissions
                .Include(p => p.Screen)
                .Where(p => p.RoleID == roleId)
                .Select(p => new 
                {
                    screenName = p.Screen.ScreenName,
                    allowView = p.AllowView,
                    allowInsert = p.AllowInsert,
                    allowUpdate = p.AllowUpdate,
                    allowDelete = p.AllowDelete
                })
                .ToListAsync();

            return Ok(new { success = true, data = permissions });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting role permissions for role {RoleId}", roleId);
            return StatusCode(500, new { success = false, message = "Error getting role permissions" });
        }
    }

    /// <summary>
    /// Update permissions for a specific role
    /// </summary>
    [HttpPut("roles/{roleId}/permissions")]
    [Authorize(Roles = "Super Admin,Admin")]
    public async Task<IActionResult> UpdateRolePermissions(int roleId, [FromBody] UpdateRolePermissionsDto request)
    {
        try
        {
            _logger.LogInformation("Updating permissions for role {RoleId} with {Count} permissions", roleId, request.Permissions.Count);

            // Verify role exists
            var role = await _context.Roles.FindAsync(roleId);
            if (role == null)
            {
                return NotFound(new { success = false, message = "Role not found" });
            }

            // Remove existing permissions for this role
            var existingPermissions = await _context.Permissions
                .Where(p => p.RoleID == roleId)
                .ToListAsync();
            
            _context.Permissions.RemoveRange(existingPermissions);
            await _context.SaveChangesAsync();

            // Add new permissions
            foreach (var permissionDto in request.Permissions)
            {
                // Find or create screen
                var screen = await _context.Screens
                    .FirstOrDefaultAsync(s => s.ScreenName == permissionDto.ScreenName);
                
                if (screen == null)
                {
                    screen = new Models.Security.Screen 
                    { 
                        ScreenName = permissionDto.ScreenName
                    };
                    _context.Screens.Add(screen);
                    await _context.SaveChangesAsync();
                }

                // Create new permission
                var permission = new Models.Security.Permission
                {
                    RoleID = roleId,
                    ScreenID = screen.ScreenID,
                    AllowView = permissionDto.AllowView,
                    AllowInsert = permissionDto.AllowInsert,
                    AllowUpdate = permissionDto.AllowUpdate,
                    AllowDelete = permissionDto.AllowDelete
                };

                _context.Permissions.Add(permission);
            }

            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Successfully updated permissions for role {RoleId}", roleId);
            return Ok(new { success = true, message = "Role permissions updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating role permissions for role {RoleId}", roleId);
            return StatusCode(500, new { success = false, message = "Error updating role permissions: " + ex.Message });
        }
    }

    /// <summary>
    /// ????? ??????? ???? ??? ???? ?????
    /// </summary>
    [HttpPost("set")]
    public async Task<IActionResult> SetPermission([FromBody] SetPermissionDto request)
    {
        try
        {
            var result = await _permissionService.SetPermissionAsync(request);
            
            if (!result)
            {
                return BadRequest(new { success = false, message = "??? ?? ????? ?????????" });
            }

            return Ok(new { success = true, message = "?? ????? ????????? ?????" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting permission for role {RoleId}, screen {ScreenId}", request.RoleId, request.ScreenId);
            return StatusCode(500, new { success = false, message = "??? ??? ????? ????? ?????????" });
        }
    }

    /// <summary>
    /// ?????? ??? ???? ???????
    /// </summary>
    [HttpGet("screens")]
    public async Task<IActionResult> GetScreens()
    {
        try
        {
            var screens = await _context.Screens
                .Select(s => new ScreenDto
                {
                    ScreenID = s.ScreenID,
                    ScreenName = s.ScreenName,
                    SType = s.SType,
                    Hint = s.Hint,
                    MenuOptionGroupName = s.MenuOptionGroupName,
                    MenuOptionID = s.MenuOptionID,
                    MenuOptionName = s.MenuOptionName
                })
                .ToListAsync();

            return Ok(new { success = true, data = screens });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting screens");
            return StatusCode(500, new { success = false, message = "??? ??? ????? ??? ???????" });
        }
    }
}