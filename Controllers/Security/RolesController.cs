using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Assets.Data;
using Assets.Models.Security;
using Assets.DTOs.Security;

namespace Assets.Controllers.Security;

[ApiController]
[Route("api/security/[controller]")]
[Authorize]
public class RolesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<RolesController> _logger;

    public RolesController(ApplicationDbContext context, ILogger<RolesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all roles
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Super Admin,Admin,Manager")]
    public async Task<IActionResult> GetAllRoles()
    {
        try
        {
            var roles = await _context.Roles
                .Select(r => new 
                {
                    roleId = r.RoleId,
                    roleName = r.RoleName,
                    isActive = r.IsActive,
                    userCount = _context.UserRoles.Count(ur => ur.RoleId == r.RoleId)
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
    /// Get role by ID
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Roles = "Super Admin,Admin,Manager")]
    public async Task<IActionResult> GetRole(int id)
    {
        try
        {
            var role = await _context.Roles
                .Where(r => r.RoleId == id)
                .Select(r => new 
                {
                    roleId = r.RoleId,
                    roleName = r.RoleName,
                    isActive = r.IsActive,
                    userCount = _context.UserRoles.Count(ur => ur.RoleId == r.RoleId)
                })
                .FirstOrDefaultAsync();

            if (role == null)
            {
                return NotFound(new { success = false, message = "Role not found" });
            }

            return Ok(new { success = true, data = role });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting role {RoleId}", id);
            return StatusCode(500, new { success = false, message = "Error getting role" });
        }
    }

    /// <summary>
    /// Create new role
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Super Admin,Admin")]
    public async Task<IActionResult> CreateRole([FromBody] CreateRoleDto request)
    {
        try
        {
            // Check if role name already exists
            var existingRole = await _context.Roles
                .FirstOrDefaultAsync(r => r.RoleName.ToLower() == request.RoleName.ToLower());
            
            if (existingRole != null)
            {
                return BadRequest(new { success = false, message = "Role name already exists" });
            }

            var role = new Role
            {
                RoleName = request.RoleName.Trim(),
                IsActive = true
            };

            _context.Roles.Add(role);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created new role: {RoleName} with ID: {RoleId}", role.RoleName, role.RoleId);

            return Ok(new { 
                success = true, 
                message = "Role created successfully",
                data = new 
                {
                    roleId = role.RoleId,
                    roleName = role.RoleName,
                    isActive = role.IsActive,
                    userCount = 0
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating role");
            return StatusCode(500, new { success = false, message = "Error creating role: " + ex.Message });
        }
    }

    /// <summary>
    /// Update role
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Super Admin,Admin")]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateRoleDto request)
    {
        try
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null)
            {
                return NotFound(new { success = false, message = "Role not found" });
            }

            // Check if new name conflicts with existing role (excluding current role)
            if (!string.IsNullOrEmpty(request.RoleName) && request.RoleName.Trim() != role.RoleName)
            {
                var existingRole = await _context.Roles
                    .FirstOrDefaultAsync(r => r.RoleName.ToLower() == request.RoleName.ToLower() && r.RoleId != id);
                
                if (existingRole != null)
                {
                    return BadRequest(new { success = false, message = "Role name already exists" });
                }

                role.RoleName = request.RoleName.Trim();
            }

            if (request.IsActive.HasValue)
            {
                role.IsActive = request.IsActive.Value;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated role {RoleId}: {RoleName}", role.RoleId, role.RoleName);

            return Ok(new { 
                success = true, 
                message = "Role updated successfully",
                data = new 
                {
                    roleId = role.RoleId,
                    roleName = role.RoleName,
                    isActive = role.IsActive,
                    userCount = await _context.UserRoles.CountAsync(ur => ur.RoleId == role.RoleId)
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating role {RoleId}", id);
            return StatusCode(500, new { success = false, message = "Error updating role: " + ex.Message });
        }
    }

    /// <summary>
    /// Delete role (only if no users are assigned to it)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Super Admin")]
    public async Task<IActionResult> DeleteRole(int id)
    {
        try
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null)
            {
                return NotFound(new { success = false, message = "Role not found" });
            }

            // Prevent deletion of system roles
            if (role.RoleName == "Super Admin" || role.RoleName == "Admin")
            {
                return BadRequest(new { success = false, message = "Cannot delete system roles" });
            }

            // Check if any users are assigned to this role
            var userCount = await _context.UserRoles.CountAsync(ur => ur.RoleId == id);
            if (userCount > 0)
            {
                return BadRequest(new { success = false, message = $"Cannot delete role. {userCount} users are assigned to this role." });
            }

            // Delete related permissions first
            var permissions = await _context.Permissions.Where(p => p.RoleID == id).ToListAsync();
            _context.Permissions.RemoveRange(permissions);

            // Delete the role
            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Deleted role {RoleId}: {RoleName}", role.RoleId, role.RoleName);

            return Ok(new { success = true, message = "Role deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting role {RoleId}", id);
            return StatusCode(500, new { success = false, message = "Error deleting role: " + ex.Message });
        }
    }

    /// <summary>
    /// Toggle role active status
    /// </summary>
    [HttpPatch("{id}/toggle-status")]
    [Authorize(Roles = "Super Admin,Admin")]
    public async Task<IActionResult> ToggleRoleStatus(int id)
    {
        try
        {
            var role = await _context.Roles.FindAsync(id);
            if (role == null)
            {
                return NotFound(new { success = false, message = "Role not found" });
            }

            // Prevent disabling Super Admin role
            if (role.RoleName == "Super Admin" && role.IsActive)
            {
                return BadRequest(new { success = false, message = "Cannot disable Super Admin role" });
            }

            role.IsActive = !role.IsActive;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Toggled role {RoleId} status to {IsActive}", role.RoleId, role.IsActive);

            return Ok(new { 
                success = true, 
                message = $"Role {(role.IsActive ? "activated" : "deactivated")} successfully",
                data = new 
                {
                    roleId = role.RoleId,
                    roleName = role.RoleName,
                    isActive = role.IsActive
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error toggling role status {RoleId}", id);
            return StatusCode(500, new { success = false, message = "Error toggling role status: " + ex.Message });
        }
    }
}