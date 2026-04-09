namespace WaterApi.Services;

public interface ICurrentUserService
{
    string? UserId { get; }
    string? UserName { get; }
}

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? UserId => _httpContextAccessor.HttpContext?.User?.FindFirst("sub")?.Value 
        ?? _httpContextAccessor.HttpContext?.User?.FindFirst("userId")?.Value
        ?? _httpContextAccessor.HttpContext?.User?.Identity?.Name;

    public string? UserName => _httpContextAccessor.HttpContext?.User?.Identity?.Name 
        ?? _httpContextAccessor.HttpContext?.User?.FindFirst("name")?.Value
        ?? "System";
}
