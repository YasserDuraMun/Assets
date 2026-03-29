using Assets.DTOs.Auth;

namespace Assets.Services.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginDto loginDto);
    Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
}
