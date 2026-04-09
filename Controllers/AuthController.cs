using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Assets.DTOs.Security;
using Assets.Services.Interfaces;

namespace Assets.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ICurrentUserService currentUserService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// ????? ??????
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto loginDto)
    {
        try
        {
            var result = await _authService.LoginAsync(loginDto);

            if (!result.Success)
            {
                return Unauthorized(new { success = false, message = result.Message });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for email: {Email}", loginDto.Email);
            return StatusCode(500, new { success = false, message = "??? ??? ????? ????? ??????" });
        }
    }

    /// <summary>
    /// ????? ???? ????
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto registerDto)
    {
        try
        {
            var result = await _authService.RegisterAsync(registerDto);

            if (!result.Success)
            {
                return BadRequest(new { success = false, message = result.Message });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration for email: {Email}", registerDto.Email);
            return StatusCode(500, new { success = false, message = "??? ??? ????? ????? ??????" });
        }
    }

    /// <summary>
    /// ????? ???? ??????
    /// </summary>
    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        try
        {
            if (!_currentUserService.UserId.HasValue)
            {
                return Unauthorized(new { success = false, message = "???????? ??? ???? ??" });
            }

            var result = await _authService.ChangePasswordAsync(_currentUserService.UserId.Value, dto);

            if (!result)
            {
                return BadRequest(new { success = false, message = "???? ?????? ??????? ??? ?????" });
            }

            return Ok(new { success = true, message = "?? ????? ???? ?????? ?????" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password for user: {UserId}", _currentUserService.UserId);
            return StatusCode(500, new { success = false, message = "??? ??? ????? ????? ???? ??????" });
        }
    }

    /// <summary>
    /// ?????? ??? ??????? ???????? ??????
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        try
        {
            if (!_currentUserService.UserId.HasValue)
            {
                return Unauthorized(new { success = false, message = "???????? ??? ???? ??" });
            }

            var user = await _authService.GetUserByIdAsync(_currentUserService.UserId.Value);
            if (user == null)
            {
                return NotFound(new { success = false, message = "???????? ??? ?????" });
            }

            return Ok(new { success = true, data = user });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current user: {UserId}", _currentUserService.UserId);
            return StatusCode(500, new { success = false, message = "??? ??? ????? ?????? ??? ??????? ????????" });
        }
    }

    /// <summary>
    /// ??? ???? ??????
    /// </summary>
    [HttpGet("health")]
    public IActionResult HealthCheck()
    {
        return Ok(new 
        { 
            success = true, 
            message = "Auth service is healthy",
            timestamp = DateTime.UtcNow 
        });
    }
}
