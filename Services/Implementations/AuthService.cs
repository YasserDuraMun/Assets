using Microsoft.EntityFrameworkCore;
using Assets.Data;
using Assets.DTOs.Security;
using Assets.Services.Interfaces;
using Assets.Models.Security;
using BCrypt.Net;

namespace Assets.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(ApplicationDbContext context, IJwtTokenService jwtTokenService, ILogger<AuthService> logger)
    {
        _context = context;
        _jwtTokenService = jwtTokenService;
        _logger = logger;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        try
        {
            var user = await _context.SecurityUsers
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive);

            if (user == null)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid email or password"
                };
            }

            // Verify password
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            
            if (!isPasswordValid)
            {
                _logger.LogWarning($"Invalid password for email: {request.Email}");
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Invalid email or password"
                };
            }

            // Get user roles
            var roles = user.UserRoles.Select(ur => ur.Role.RoleName).ToList();

            // Generate JWT token
            var token = _jwtTokenService.GenerateToken(user, roles);

            // Update last login (you might want to add this field to User model)
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return new AuthResponseDto
            {
                Success = true,
                Message = "Login successful",
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    IsActive = user.IsActive,
                    CreatedAt = user.CreatedAt,
                    Roles = user.UserRoles.Select(ur => new Assets.DTOs.Security.RoleDto
                    {
                        RoleId = ur.Role.RoleId,
                        RoleName = ur.Role.RoleName,
                        IsActive = ur.Role.IsActive
                    }).ToList()
                },
                Roles = user.UserRoles.Select(ur => new Assets.DTOs.Security.RoleDto
                {
                    RoleId = ur.Role.RoleId,
                    RoleName = ur.Role.RoleName,
                    IsActive = ur.Role.IsActive
                }).ToList()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for email: {Email}", request.Email);
            return new AuthResponseDto
            {
                Success = false,
                Message = "An error occurred during login"
            };
        }
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        try
        {
            if (await EmailExistsAsync(request.Email))
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Email already exists"
                };
            }

            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.SecurityUsers.Add(user);
            await _context.SaveChangesAsync();

            // Get user with roles for response
            var userWithRoles = await GetUserByIdAsync(user.Id);

            return new AuthResponseDto
            {
                Success = true,
                Message = "Registration successful",
                User = new UserDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    IsActive = user.IsActive,
                    CreatedAt = user.CreatedAt
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration for email: {Email}", request.Email);
            return new AuthResponseDto
            {
                Success = false,
                Message = "An error occurred during registration"
            };
        }
    }

    public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto request)
    {
        try
        {
            var user = await _context.SecurityUsers.FindAsync(userId);
            if (user == null || !user.IsActive)
                return false;

            // Verify current password
            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                return false;

            // Update password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password for user: {UserId}", userId);
            return false;
        }
    }

    public async Task<UserWithRolesDto?> GetUserByIdAsync(int userId)
    {
        try
        {
            var user = await _context.SecurityUsers
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return null;

            return new UserWithRolesDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
                Roles = user.UserRoles.Select(ur => new Assets.DTOs.Security.RoleDto
                {
                    RoleId = ur.Role.RoleId,
                    RoleName = ur.Role.RoleName,
                    IsActive = ur.Role.IsActive
                }).ToList()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user by ID: {UserId}", userId);
            return null;
        }
    }

    public async Task<UserWithRolesDto?> GetUserByEmailAsync(string email)
    {
        try
        {
            var user = await _context.SecurityUsers
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
                return null;

            return new UserWithRolesDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
                Roles = user.UserRoles.Select(ur => new Assets.DTOs.Security.RoleDto
                {
                    RoleId = ur.Role.RoleId,
                    RoleName = ur.Role.RoleName,
                    IsActive = ur.Role.IsActive
                }).ToList()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user by email: {Email}", email);
            return null;
        }
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _context.SecurityUsers.AnyAsync(u => u.Email == email);
    }
}
