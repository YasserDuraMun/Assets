using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Assets.Data;
using Assets.DTOs.Security;
using Assets.Models.Security;
using Assets.Services.Interfaces;
using BCrypt.Net;

namespace Assets.Controllers.Security;

[ApiController]
[Route("api/security/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(ApplicationDbContext context, ICurrentUserService currentUserService, ILogger<UsersController> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// ?????? ??? ???? ??????????
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        try
        {
            var users = await _context.SecurityUsers
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Select(u => new UserWithRolesDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt,
                    Roles = u.UserRoles.Select(ur => new Assets.DTOs.Security.RoleDto
                    {
                        RoleId = ur.Role.RoleId,
                        RoleName = ur.Role.RoleName,
                        IsActive = ur.Role.IsActive
                    }).ToList()
                })
                .ToListAsync();

            return Ok(new { success = true, data = users });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting users");
            return StatusCode(500, new { success = false, message = "??? ??? ????? ??? ??????????" });
        }
    }

    /// <summary>
    /// ????? ?????? ???? (????????)
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateSecurityUserDto createUserDto)
    {
        try
        {
            // Check if email already exists
            if (await _context.SecurityUsers.AnyAsync(u => u.Email == createUserDto.Email))
            {
                return BadRequest(new { success = false, message = "?????? ?????????? ?????? ??????" });
            }

            var user = new User
            {
                FullName = createUserDto.FullName,
                Email = createUserDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(createUserDto.Password),
                IsActive = createUserDto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.SecurityUsers.Add(user);
            await _context.SaveChangesAsync();

            // Add roles if provided
            if (createUserDto.RoleIds != null && createUserDto.RoleIds.Any())
            {
                var userRoles = createUserDto.RoleIds.Select(roleId => new UserRole
                {
                    UserId = user.Id,
                    RoleId = roleId,
                    AssignedAt = DateTime.UtcNow
                }).ToList();

                _context.UserRoles.AddRange(userRoles);
                await _context.SaveChangesAsync();
            }

            return Ok(new { success = true, message = "?? ????? ???????? ?????" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            return StatusCode(500, new { success = false, message = "??? ??? ????? ????? ????????" });
        }
    }

    /// <summary>
    /// ?????? ??? ?????? ????
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(int id)
    {
        try
        {
            var user = await _context.SecurityUsers
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Where(u => u.Id == id)
                .Select(u => new UserWithRolesDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt,
                    Roles = u.UserRoles.Select(ur => new Assets.DTOs.Security.RoleDto
                    {
                        RoleId = ur.Role.RoleId,
                        RoleName = ur.Role.RoleName,
                        IsActive = ur.Role.IsActive
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new { success = false, message = "???????? ??? ?????" });
            }

            return Ok(new { success = true, data = user });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user {UserId}", id);
            return StatusCode(500, new { success = false, message = "??? ??? ????? ??? ?????? ????????" });
        }
    }

    /// <summary>
    /// ????? ?????? ??????
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateSecurityUserDto updateUserDto)
    {
        try
        {
            var user = await _context.SecurityUsers
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound(new { success = false, message = "???????? ??? ?????" });
            }

            // Check if email is already used by another user
            if (await _context.SecurityUsers.AnyAsync(u => u.Email == updateUserDto.Email && u.Id != id))
            {
                return BadRequest(new { success = false, message = "?????? ?????????? ?????? ??????" });
            }

            // Update user properties
            user.FullName = updateUserDto.FullName;
            user.Email = updateUserDto.Email;
            user.IsActive = updateUserDto.IsActive;
            user.UpdatedAt = DateTime.UtcNow;

            // Update password if provided
            if (!string.IsNullOrEmpty(updateUserDto.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(updateUserDto.Password);
            }

            // Update roles if provided
            if (updateUserDto.RoleIds != null)
            {
                // Remove existing roles
                _context.UserRoles.RemoveRange(user.UserRoles);

                // Add new roles
                if (updateUserDto.RoleIds.Any())
                {
                    var newUserRoles = updateUserDto.RoleIds.Select(roleId => new UserRole
                    {
                        UserId = user.Id,
                        RoleId = roleId,
                        AssignedAt = DateTime.UtcNow
                    }).ToList();

                    _context.UserRoles.AddRange(newUserRoles);
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "?? ????? ?????? ???????? ?????" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}", id);
            return StatusCode(500, new { success = false, message = "??? ??? ????? ????? ????????" });
        }
    }

    /// <summary>
    /// ??? ??????
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        try
        {
            var user = await _context.SecurityUsers
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound(new { success = false, message = "???????? ??? ?????" });
            }

            // Prevent deletion of admin user
            if (user.Email == "admin@assets.ps")
            {
                return BadRequest(new { success = false, message = "?? ???? ??? ?????? ?????? ???????" });
            }

            // Remove user roles first
            _context.UserRoles.RemoveRange(user.UserRoles);

            // Remove user
            _context.SecurityUsers.Remove(user);

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "?? ??? ???????? ?????" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId}", id);
            return StatusCode(500, new { success = false, message = "??? ??? ????? ??? ????????" });
        }
    }

    /// <summary>
    /// ????? ???? ????? ????????
    /// </summary>
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> ToggleUserStatus(int id)
    {
        try
        {
            var user = await _context.SecurityUsers.FindAsync(id);

            if (user == null)
            {
                return NotFound(new { success = false, message = "???????? ??? ?????" });
            }

            // Prevent deactivation of admin user
            if (user.Email == "admin@assets.ps" && user.IsActive)
            {
                return BadRequest(new { success = false, message = "?? ???? ????? ????? ?????? ?????? ???????" });
            }

            user.IsActive = !user.IsActive;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var status = user.IsActive ? "?????" : "????? ?????";
            return Ok(new { success = true, message = $"?? {status} ???????? ?????" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error toggling user status {UserId}", id);
            return StatusCode(500, new { success = false, message = "??? ??? ????? ????? ???? ????????" });
        }
    }
}