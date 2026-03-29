using Assets.DTOs.User;
using Assets.DTOs.Common;

namespace Assets.Services.Interfaces;

public interface IUserService
{
    Task<PagedResult<UserDto>> GetAllAsync(int pageNumber, int pageSize, string? searchTerm = null);
    Task<UserDto?> GetByIdAsync(int id);
    Task<UserDto> CreateAsync(CreateUserDto dto);
    Task<UserDto> UpdateAsync(UpdateUserDto dto);
    Task<bool> DeleteAsync(int id);
    Task<bool> ResetPasswordAsync(int userId, string newPassword);
}
