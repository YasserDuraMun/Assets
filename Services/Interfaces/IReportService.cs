using Assets.DTOs.Common;
using Assets.DTOs.Report;

namespace Assets.Services.Interfaces
{
    public interface IReportService
    {
        Task<ApiResponse<ReportResultDto>> GenerateAssetReportAsync(ReportFilterDto filter);
        Task<ApiResponse<ReportResultDto>> GenerateDisposalReportAsync(ReportFilterDto filter);
        Task<ApiResponse<ReportResultDto>> GenerateMaintenanceReportAsync(ReportFilterDto filter);
        Task<ApiResponse<ReportResultDto>> GenerateTransferReportAsync(ReportFilterDto filter);
        Task<ApiResponse<ReportResultDto>> GenerateSummaryReportAsync(ReportFilterDto filter);
        Task<ApiResponse<byte[]>> ExportReportToCsvAsync(ReportType reportType, ReportFilterDto filter);
    }
}