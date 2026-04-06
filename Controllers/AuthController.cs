using Microsoft.AspNetCore.Mvc;
using Assets.DTOs.Auth;
using Assets.DTOs.Common;
using Assets.Services.Interfaces;

namespace Assets.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// ????? ??????
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        try
        {
            var result = await _authService.LoginAsync(loginDto);

            if (result == null)
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse("??? ???????? ?? ???? ?????? ??? ?????"));
            }

            return Ok(ApiResponse<LoginResponseDto>.SuccessResponse(result, "?? ????? ?????? ?????"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ??? ????? ????? ????? ??????"));
        }
    }

    /// <summary>
    /// ????? ???? ??????
    /// </summary>
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        try
        {
            var userId = GetUserIdFromToken();
            if (!userId.HasValue)
                return Unauthorized();

            var success = await _authService.ChangePasswordAsync(userId.Value, dto.CurrentPassword, dto.NewPassword);

            if (!success)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("???? ?????? ??????? ??? ?????"));
            }

            return Ok(ApiResponse<object>.SuccessResponse(null, "?? ????? ???? ?????? ?????"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ??? ????? ????? ???? ??????"));
        }
    }

    private int? GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
        {
            return userId;
        }
        return null;
    }
}

public class ChangePasswordDto
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
