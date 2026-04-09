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

        public SecurityTestController(ICurrentUserService currentUserService, IPermissionService permissionService)
        {
            _currentUserService = currentUserService;
            _permissionService = permissionService;
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
        /// ?????? ??? ??????? ???????? ??????
        /// </summary>
        [HttpGet("my-permissions")]
        [Authorize]
        public async Task<IActionResult> GetMyPermissions()
        {
            if (!_currentUserService.UserId.HasValue)
            {
                return Unauthorized();
            }

            var permissions = await _permissionService.GetUserPermissionsAsync(_currentUserService.UserId.Value);
            var roles = await _currentUserService.GetUserRolesAsync();

            return Ok(new 
            { 
                success = true,
                userId = _currentUserService.UserId,
                roles = roles,
                permissions = permissions.GroupBy(p => p.ScreenName)
                    .ToDictionary(g => g.Key, g => g.First())
            });
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