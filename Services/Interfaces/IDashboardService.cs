namespace Assets.Services.Interfaces;

public interface IDashboardService
{
    Task<object> GetStatisticsAsync();
    Task<object> GetAssetsByCategoryAsync();
    Task<object> GetAssetsByStatusAsync();
    Task<object> GetRecentActivitiesAsync(int limit = 10);
    Task<object> GetAlertsAsync();
}