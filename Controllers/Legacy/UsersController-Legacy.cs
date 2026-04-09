using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Assets.DTOs.User;
using Assets.DTOs.Common;
using Assets.Services.Interfaces;

namespace Assets.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserService userService, ILogger<UsersController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    /// <summary>
    /// Get all users with pagination (Admin only)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetUsers(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null)
    {
        try
        {
            var result = await _userService.GetAllAsync(pageNumber, pageSize, search);
            return Ok(ApiResponse<PagedResult<UserDto>>.SuccessResponse(result));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting users");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ??????????"));
        }
    }

    /// <summary>
    /// Get user by ID (Admin only)
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(int id)
    {
        try
        {
            var user = await _userService.GetByIdAsync(id);

            if (user == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("???????? ??? ?????"));
            }

            return Ok(ApiResponse<UserDto>.SuccessResponse(user));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ????????"));
        }
    }

    /// <summary>
    /// Create new user (Admin only)
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
    {
        try
        {
            var user = await _userService.CreateAsync(dto);
            return CreatedAtAction(
                nameof(GetUser),
                new { id = user.Id },
                ApiResponse<UserDto>.SuccessResponse(user, "?? ????? ???????? ?????")
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            return StatusCode(500, ApiResponse<object>.ErrorResponse($"??? ?? ????? ????????: {ex.Message}"));
        }
    }

    /// <summary>
    /// Update user (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto dto)
    {
        if (id != dto.Id)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("???? ???????? ??? ??????"));
        }

        try
        {
            var user = await _userService.UpdateAsync(dto);
            return Ok(ApiResponse<UserDto>.SuccessResponse(user, "?? ????? ???????? ?????"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user");
            return StatusCode(500, ApiResponse<object>.ErrorResponse($"??? ?? ????? ????????: {ex.Message}"));
        }
    }

    /// <summary>
    /// Delete user (soft delete - Admin only)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        try
        {
            var success = await _userService.DeleteAsync(id);

            if (!success)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("???????? ??? ?????"));
            }

            return Ok(ApiResponse<object>.SuccessResponse(null, "?? ??? ???????? ?????"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ????????"));
        }
    }

    /// <summary>
    /// Reset user password (Admin only)
    /// </summary>
    [HttpPost("{id}/reset-password")]
    public async Task<IActionResult> ResetPassword(int id, [FromBody] ResetPasswordDto dto)
    {
        if (id != dto.UserId)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("???? ???????? ??? ??????"));
        }

        try
        {
            var success = await _userService.ResetPasswordAsync(dto.UserId, dto.NewPassword);

            if (!success)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("???????? ??? ?????"));
            }

            return Ok(ApiResponse<object>.SuccessResponse(null, "?? ????? ????? ???? ?????? ?????"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting password");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ????? ????? ???? ??????"));
        }
    }
}
