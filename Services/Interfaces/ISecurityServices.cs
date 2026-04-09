using Assets.Models.Security;
using Assets.DTOs.Security;

namespace Assets.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
        Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
        Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto request);
        Task<UserWithRolesDto?> GetUserByIdAsync(int userId);
        Task<UserWithRolesDto?> GetUserByEmailAsync(string email);
        Task<bool> EmailExistsAsync(string email);
    }

    public interface IJwtTokenService
    {
        string GenerateToken(User user, List<string> roles);
        int? GetUserIdFromToken(string token);
        bool ValidateToken(string token);
    }

    public interface ICurrentUserService
    {
        int? UserId { get; }
        string? Email { get; }
        bool IsAuthenticated { get; }
        Task<bool> HasPermissionAsync(string screenName, string action);
        Task<List<string>> GetUserRolesAsync();
    }

    public interface IPermissionService
    {
        Task<bool> HasPermissionAsync(int userId, string screenName, string action);
        Task<List<PermissionDto>> GetUserPermissionsAsync(int userId);
        Task<List<PermissionDto>> GetRolePermissionsAsync(int roleId);
        Task<bool> SetPermissionAsync(SetPermissionDto request);
        Task<bool> RemovePermissionAsync(int roleId, int screenId);
    }
}