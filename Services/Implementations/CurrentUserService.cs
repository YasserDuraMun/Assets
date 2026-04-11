using System.Security.Claims;
using Assets.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Assets.Data;

namespace Assets.Services.Implementations
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CurrentUserService> _logger;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor, ApplicationDbContext context, ILogger<CurrentUserService> logger)
        {
            _httpContextAccessor = httpContextAccessor;
            _context = context;
            _logger = logger;
        }

        public int? UserId
        {
            get
            {
                var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("userId");
                if (userIdClaim?.Value != null && int.TryParse(userIdClaim.Value, out var userId))
                {
                    _logger.LogDebug("?? Getting UserId from token: {UserId} (Claim: {Claim})", userId, userIdClaim.Value);
                    return userId;
                }
                
                _logger.LogDebug("?? Getting UserId from token: null (Claim: {Claim})", userIdClaim?.Value);
                return null;
            }
        }

        public string? Email => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Email)?.Value;

        public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated == true;

        public async Task<bool> HasPermissionAsync(string screenName, string action)
        {
            if (!UserId.HasValue)
            {
                _logger.LogWarning("? No UserId available for permission check");
                return false;
            }

            return await HasPermissionInternalAsync(UserId.Value, screenName, action);
        }

        public async Task<List<string>> GetUserRolesAsync()
        {
            if (!UserId.HasValue)
            {
                _logger.LogWarning("? No UserId available for getting user roles");
                return new List<string>();
            }

            _logger.LogInformation("?? Getting roles for user ID: {UserId}", UserId.Value);

            var user = await _context.SecurityUsers
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Id == UserId.Value);

            if (user == null)
            {
                _logger.LogWarning("? User not found: {UserId}", UserId.Value);
                return new List<string>();
            }

            var roleNames = user.UserRoles.Select(ur => ur.Role.RoleName).ToList();

            _logger.LogInformation("?? User {Email} has roles: [{Roles}]", user.Email, string.Join(", ", roleNames));

            return roleNames;
        }

        private async Task<bool> HasPermissionInternalAsync(int userId, string screenName, string action)
        {
            var user = await _context.SecurityUsers
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                        .ThenInclude(r => r.Permissions)
                            .ThenInclude(p => p.Screen)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return false;

            var hasPermission = user.UserRoles
                .SelectMany(ur => ur.Role.Permissions)
                .Any(p => p.Screen.ScreenName == screenName &&
                         action.ToLower() switch
                         {
                             "view" => p.AllowView,
                             "insert" => p.AllowInsert,
                             "update" => p.AllowUpdate,
                             "delete" => p.AllowDelete,
                             _ => false
                         });

            return hasPermission;
        }
    }
}