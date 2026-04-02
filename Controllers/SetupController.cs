using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Assets.Data;
using Assets.Models;
using Assets.Enums;

namespace Assets.Controllers;

/// <summary>
/// ?? TEMPORARY SETUP CONTROLLER - DELETE IN PRODUCTION!
/// This controller helps fix the admin password issue
/// </summary>
[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class SetupController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<SetupController> _logger;

    public SetupController(ApplicationDbContext context, ILogger<SetupController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Reset admin password to Admin@123
    /// ?? FOR DEVELOPMENT ONLY - Remove in production!
    /// </summary>
    [HttpPost("reset-admin")]
    public async Task<IActionResult> ResetAdminPassword()
    {
        try
        {
            var admin = await _context.Users.FirstOrDefaultAsync(u => u.Username == "admin");

            if (admin == null)
            {
                // Create new admin user
                admin = new User
                {
                    Username = "admin",
                    Email = "admin@dura.ps",
                    FullName = "مدير النظام",
                    Role = UserRole.Admin,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Users.Add(admin);
            }
            else
            {
                // Update FullName for existing admin if it's corrupted
                if (admin.FullName == null || admin.FullName.Contains("?"))
                {
                    admin.FullName = "مدير النظام";
                }
            }

            // Generate REAL BCrypt hash for "Admin@123"
            admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123");

            await _context.SaveChangesAsync();

            _logger.LogInformation("? Admin password reset successfully");

            return Ok(new
            {
                success = true,
                message = "? Admin password has been reset successfully!",
                credentials = new
                {
                    username = "admin",
                    password = "Admin@123",
                    loginEndpoint = "POST /api/Auth/login"
                },
                instructions = new[]
                {
                    "1. Go to POST /api/Auth/login",
                    "2. Use credentials above",
                    "3. Copy the token from response",
                    "4. Click 'Authorize' button",
                    "5. Enter: Bearer {your-token}",
                    "6. Now you can access all protected endpoints!"
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "? Error resetting admin password");
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }

    /// <summary>
    /// Generate BCrypt hash for any password
    /// Useful for creating new users
    /// </summary>
    [HttpPost("generate-hash")]
    public IActionResult GenerateHash([FromBody] PasswordRequest request)
    {
        try
        {
            var hash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            var verified = BCrypt.Net.BCrypt.Verify(request.Password, hash);

            return Ok(new
            {
                password = request.Password,
                hash = hash,
                hashLength = hash.Length,
                verified = verified,
                message = verified ? "? Hash generated and verified" : "? Verification failed"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Generate QR codes for all existing assets that don't have one
    /// ?? FOR DEVELOPMENT/MIGRATION ONLY
    /// </summary>
    [HttpPost("generate-qrcodes")]
    public async Task<IActionResult> GenerateQRCodes()
    {
        try
        {
            var assetsWithoutQR = await _context.Assets
                .Where(a => string.IsNullOrEmpty(a.QRCode))
                .ToListAsync();

            int count = 0;
            foreach (var asset in assetsWithoutQR)
            {
                asset.QRCode = $"ASSET-{asset.Id}-{asset.SerialNumber}";
                count++;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation($"? Generated QR codes for {count} assets");

            return Ok(new
            {
                success = true,
                message = $"? Successfully generated QR codes for {count} asset(s)",
                assetsUpdated = count,
                totalAssets = await _context.Assets.CountAsync()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "? Error generating QR codes");
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }
}

public class PasswordRequest
{
    public string Password { get; set; } = string.Empty;
}
