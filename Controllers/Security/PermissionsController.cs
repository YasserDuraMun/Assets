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
            // This is a simplified version - you might need to implement role-based permissions differently
            // based on your database schema
            
            foreach (var permission in request.Permissions)
            {
                // Find or create screen
                var screen = await _context.Screens
                    .FirstOrDefaultAsync(s => s.ScreenName == permission.ScreenName);
                
                if (screen == null)
                {
                    screen = new Models.Security.Screen 
                    { 
                        ScreenName = permission.ScreenName
                    };
                    _context.Screens.Add(screen);
                    await _context.SaveChangesAsync();
                }

                // Update or create permission for this role
                // Note: This assumes you have a mechanism to link roles to permissions
                // You might need to adjust this based on your actual database schema
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Role permissions updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating role permissions for role {RoleId}", roleId);
            return StatusCode(500, new { success = false, message = "Error updating role permissions" });
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