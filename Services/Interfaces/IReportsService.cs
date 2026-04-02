namespace Assets.Services.Interfaces;

/// <summary>
/// ???? ????? ???????? ?????? ?????? ????????
/// </summary>
public interface IReportsService
{
    /// <summary>
    /// ????? ???? ?????? ?????
    /// </summary>
    Task<object> GetAssetsSummaryReportAsync(DateTime? startDate = null, DateTime? endDate = null);

    /// <summary>
    /// ????? ?????? ???????? ???? ???? ?????
    /// </summary>
    Task<object> GetDisposalReportAsync(
        DateTime? startDate = null, 
        DateTime? endDate = null,
        int? disposalReason = null,
        string? categoryFilter = null);

    /// <summary>
    /// ????? ??????? ???? ???? ?????
    /// </summary>
    Task<object> GetMaintenanceReportAsync(
        DateTime? startDate = null,
        DateTime? endDate = null,
        int? maintenanceType = null,
        int? status = null,
        string? categoryFilter = null);

    /// <summary>
    /// ????? ????????? ???? ???? ?????
    /// </summary>
    Task<object> GetTransfersReportAsync(
        DateTime? startDate = null,
        DateTime? endDate = null,
        string? fromLocation = null,
        string? toLocation = null,
        string? categoryFilter = null);

    /// <summary>
    /// ????? ???? ????
    /// </summary>
    Task<object> GetMonthlySummaryReportAsync(int year, int month);

    /// <summary>
    /// ????? ?????? ???? ??????
    /// </summary>
    Task<object> GetAssetsByStatusReportAsync();

    /// <summary>
    /// ????? ?????? ???? ???????
    /// </summary>
    Task<object> GetAssetsByCategoryReportAsync();

    /// <summary>
    /// ????? ?????? ???? ??????
    /// </summary>
    Task<object> GetAssetsByLocationReportAsync();

    /// <summary>
    /// ????? ????? ????
    /// </summary>
    Task<object> GenerateCustomReportAsync(CustomReportRequest request);

    /// <summary>
    /// الحصول على الأصول حسب الدائرة/القسم مع تفاصيل QR code للطباعة
    /// </summary>
    Task<object> GetAssetsByLocationDetailAsync(int? departmentId = null, int? sectionId = null);
}

/// <summary>
/// ??? ????? ????
/// </summary>
public class CustomReportRequest
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public List<string> Categories { get; set; } = new();
    public List<string> Statuses { get; set; } = new();
    public List<string> Locations { get; set; } = new();
    public List<string> ReportTypes { get; set; } = new(); // "assets", "disposals", "maintenance", "transfers"
    public bool IncludeCharts { get; set; } = true;
    public bool IncludeDetails { get; set; } = true;
    public string ReportFormat { get; set; } = "json"; // "json", "excel", "pdf"
}