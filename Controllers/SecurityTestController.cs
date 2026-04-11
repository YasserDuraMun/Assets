using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Assets.Attributes;
using Assets.Services.Interfaces;

namespace Assets.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SecurityTestController : ControllerBase
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IPermissionService _permissionService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public SecurityTestController(ICurrentUserService currentUserService, IPermissionService permissionService, IHttpContextAccessor httpContextAccessor)
        {
            _currentUserService = currentUserService;
            _permissionService = permissionService;
            _httpContextAccessor = httpContextAccessor;
        }

        /// <summary>
        /// ?????? ??? - ???? ??????
        /// </summary>
        [HttpGet("public")]
        public IActionResult PublicTest()
        {
            return Ok(new { message = "??? ?????? ??? ???? ??????", success = true });
        }

        /// <summary>
        /// ?????? ????? ????? ???? ???
        /// </summary>
        [HttpGet("authenticated")]
        [Authorize]
        public IActionResult AuthenticatedTest()
        {
            return Ok(new 
            { 
                message = "??? ???? ????", 
                success = true,
                userId = _currentUserService.UserId,
                email = _currentUserService.Email 
            });
        }

        /// <summary>
        /// ?????? ????? ??? Admin
        /// </summary>
        [HttpGet("admin-only")]
        [RequireRole("Admin", "Super Admin")]
        public IActionResult AdminOnlyTest()
        {
            return Ok(new { message = "??? ????!", success = true });
        }

        /// <summary>
        /// ?????? ????? ?????? ??? ??????????
        /// </summary>
        [HttpGet("view-users")]
        [RequirePermission("Users", "view")]
        public IActionResult ViewUsersTest()
        {
            return Ok(new { message = "????? ??? ??????????", success = true });
        }

        /// <summary>
        /// ?????? ????? ?????? ????? ????
        /// </summary>
        [HttpGet("add-assets")]
        [RequirePermission("Assets", "insert")]
        public IActionResult AddAssetsTest()
        {
            return Ok(new { message = "????? ????? ????", success = true });
        }

        /// <summary>
        /// ???? ??? ????????? ??????? ????????
        /// </summary>
        [HttpGet("my-permissions")]
        [Authorize]
        public async Task<IActionResult> GetMyPermissions()
        {
            try
            {
                Console.WriteLine("?? === Starting GetMyPermissions ===");
                
                // ??? ??? HttpContext ???? User
                var httpContext = _httpContextAccessor.HttpContext;
                Console.WriteLine($"?? HttpContext exists: {httpContext != null}");
                Console.WriteLine($"?? User exists: {httpContext?.User != null}");
                Console.WriteLine($"?? User authenticated: {httpContext?.User?.Identity?.IsAuthenticated}");
                
                // ??? ??? Claims
                if (httpContext?.User != null)
                {
                    var claims = httpContext.User.Claims.ToList();
                    Console.WriteLine($"?? Total claims: {claims.Count}");
                    
                    foreach (var claim in claims)
                    {
                        Console.WriteLine($"??? Claim: {claim.Type} = {claim.Value}");
                    }
                }

                if (!_currentUserService.UserId.HasValue)
                {
                    Console.WriteLine("? CurrentUserService.UserId is null");
                    return Unauthorized(new { success = false, message = "User not authenticated - UserId is null" });
                }

                var userId = _currentUserService.UserId.Value;
                Console.WriteLine($"?? Getting permissions for user ID: {userId}");
                Console.WriteLine($"?? User email: {_currentUserService.Email}");

                var permissions = await _permissionService.GetUserPermissionsAsync(userId);
                var roles = await _currentUserService.GetUserRolesAsync();

                Console.WriteLine($"?? User roles: {string.Join(", ", roles)}");
                Console.WriteLine($"??? Found {permissions.Count()} permissions");

                // ????? ????????? ??? ??????? ??????? ??? frontend
                var permissionsList = permissions.Select(p => new 
                {
                    screenName = p.ScreenName,
                    allowView = p.AllowView,
                    allowInsert = p.AllowInsert,
                    allowUpdate = p.AllowUpdate,
                    allowDelete = p.AllowDelete
                }).ToList();

                Console.WriteLine($"?? Permissions details:");
                foreach (var perm in permissionsList)
                {
                    Console.WriteLine($"?? {perm.screenName}: View={perm.allowView}, Insert={perm.allowInsert}, Update={perm.allowUpdate}, Delete={perm.allowDelete}");
                }

                Console.WriteLine("? === GetMyPermissions completed successfully ===");

                return Ok(new 
                { 
                    success = true,
                    data = permissionsList,
                    userId = _currentUserService.UserId,
                    roles = roles
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"? Error getting user permissions: {ex.Message}");
                Console.WriteLine($"? Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { success = false, message = "Error getting user permissions: " + ex.Message });
            }
        }

        /// <summary>
        /// ??? ?????? ?????
        /// </summary>
        [HttpPost("check-permission")]
        [Authorize]
        public async Task<IActionResult> CheckSpecificPermission([FromBody] CheckPermissionRequest request)
        {
            if (!_currentUserService.UserId.HasValue)
            {
                return Unauthorized();
            }

            var hasPermission = await _permissionService.HasPermissionAsync(
                _currentUserService.UserId.Value, 
                request.ScreenName, 
                request.Action);

            return Ok(new 
            { 
                success = true,
                hasPermission = hasPermission,
                screenName = request.ScreenName,
                action = request.Action
            });
        }
    }

    public class CheckPermissionRequest
    {
        public string ScreenName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
    }
}