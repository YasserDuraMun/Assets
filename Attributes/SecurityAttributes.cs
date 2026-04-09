using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Assets.Services.Interfaces;

namespace Assets.Attributes
{
    /// <summary>
    /// Attribute ?????? ?? ????????? ????? ??? ?????? ????????
    /// </summary>
    public class RequirePermissionAttribute : Attribute, IAsyncAuthorizationFilter
    {
        private readonly string _screenName;
        private readonly string _action;

        public RequirePermissionAttribute(string screenName, string action)
        {
            _screenName = screenName;
            _action = action;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            // ???? ?? ???? ????????
            if (!context.HttpContext.User.Identity?.IsAuthenticated ?? true)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            // ?????? ??? ???? ???????? ??????
            var currentUserService = context.HttpContext.RequestServices
                .GetService<ICurrentUserService>();

            if (currentUserService == null || !currentUserService.UserId.HasValue)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            // ?????? ?? ????????
            var hasPermission = await currentUserService.HasPermissionAsync(_screenName, _action);
            
            if (!hasPermission)
            {
                context.Result = new ForbidResult();
            }
        }
    }

    /// <summary>
    /// Attribute ?????? ?? ???? ??? ????
    /// </summary>
    public class RequireRoleAttribute : Attribute, IAsyncAuthorizationFilter
    {
        private readonly string[] _roles;

        public RequireRoleAttribute(params string[] roles)
        {
            _roles = roles;
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            if (!context.HttpContext.User.Identity?.IsAuthenticated ?? true)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var currentUserService = context.HttpContext.RequestServices
                .GetService<ICurrentUserService>();

            if (currentUserService == null || !currentUserService.UserId.HasValue)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var userRoles = await currentUserService.GetUserRolesAsync();
            var hasRequiredRole = _roles.Any(role => userRoles.Contains(role));

            if (!hasRequiredRole)
            {
                context.Result = new ForbidResult();
            }
        }
    }
}