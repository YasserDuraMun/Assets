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

        public CurrentUserService(IHttpContextAccessor httpContextAccessor, ApplicationDbContext context)
        {
            _httpContextAccessor = httpContextAccessor;
            _context = context;
        }

        public int? UserId
        {
            get
            {
                var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("userId");
                return int.TryParse(userIdClaim?.Value, out var userId) ? userId : null;
            }
        }

        public string? Email => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Email)?.Value;

        public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated == true;

        public async Task<bool> HasPermissionAsync(string screenName, string action)
        {
            if (!UserId.HasValue)
                return false;

            return await HasPermissionInternalAsync(UserId.Value, screenName, action);
        }

        public async Task<List<string>> GetUserRolesAsync()
        {
            if (!UserId.HasValue)
                return new List<string>();

            var user = await _context.SecurityUsers
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Id == UserId.Value);

            return user?.UserRoles.Select(ur => ur.Role.RoleName).ToList() ?? new List<string>();
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