using Assets.Data;
using Assets.DTOs.Common;
using Assets.DTOs.Report;
using Assets.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace Assets.Services.Implementations
{
    public class ReportService : IReportService
    {
        private readonly ApplicationDbContext _context;

        public ReportService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<ReportResultDto>> GenerateAssetReportAsync(ReportFilterDto filter)
        {
            try
            {
                var query = _context.Assets
                    .Include(a => a.Category)
                    .Include(a => a.CurrentDepartment)
                    .Include(a => a.CurrentSection)
                    .Include(a => a.Status)
                    .Where(a => a.CreatedAt >= filter.StartDate && a.CreatedAt <= filter.EndDate.AddDays(1).AddTicks(-1));

                if (filter.DepartmentId.HasValue)
                    query = query.Where(a => a.CurrentDepartmentId == filter.DepartmentId.Value);

                if (filter.SectionId.HasValue)
                    query = query.Where(a => a.CurrentSectionId == filter.SectionId.Value);

                if (filter.CategoryId.HasValue)
                    query = query.Where(a => a.CategoryId == filter.CategoryId.Value);

                if (!string.IsNullOrEmpty(filter.Status))
                    query = query.Where(a => a.Status!.Name == filter.Status);

                var assets = await query
                    .OrderBy(a => a.CreatedAt)
                    .Select(a => new AssetReportDto
                    {
                        Id = a.Id,
                        Name = a.Name,
                        SerialNumber = a.SerialNumber,
                        CategoryName = a.Category!.Name,
                        DepartmentName = a.CurrentDepartment!.Name,
                        SectionName = a.CurrentSection != null ? a.CurrentSection.Name : null,
                        StatusName = a.Status!.Name,
                        Cost = a.PurchasePrice ?? 0,
                        CreatedAt = a.CreatedAt,
                        UpdatedAt = a.UpdatedAt
                    })
                    .ToListAsync();

                var summary = new ReportSummaryDto
                {
                    TotalAssets = assets.Count,
                    TotalAssetValue = assets.Sum(a => a.Cost)
                };

                return ApiResponse<ReportResultDto>.SuccessResponse(new ReportResultDto
                {
                    Summary = summary,
                    Assets = assets
                });
            }
            catch (Exception ex)
            {
                return ApiResponse<ReportResultDto>.ErrorResponse($"??? ?? ????? ????? ??????: {ex.Message}");
            }
        }

        public async Task<ApiResponse<ReportResultDto>> GenerateDisposalReportAsync(ReportFilterDto filter)
        {
            try
            {
                var query = _context.AssetDisposals
                    .Include(d => d.Asset)
                        .ThenInclude(a => a.Category)
                    .Include(d => d.Asset)
                        .ThenInclude(a => a.CurrentDepartment)
                    .Include(d => d.Asset)
                        .ThenInclude(a => a.CurrentSection)
                    .Include(d => d.PerformedByUser)
                    .Where(d => d.DisposalDate >= filter.StartDate && d.DisposalDate <= filter.EndDate.AddDays(1).AddTicks(-1));

                if (filter.DepartmentId.HasValue)
                    query = query.Where(d => d.Asset.CurrentDepartmentId == filter.DepartmentId.Value);

                if (filter.SectionId.HasValue)
                    query = query.Where(d => d.Asset.CurrentSectionId == filter.SectionId.Value);

                if (filter.CategoryId.HasValue)
                    query = query.Where(d => d.Asset.CategoryId == filter.CategoryId.Value);

                var disposals = await query
                    .OrderBy(d => d.DisposalDate)
                    .Select(d => new DisposalReportDto
                    {
                        Id = d.Id,
                        AssetName = d.Asset.Name,
                        AssetSerialNumber = d.Asset.SerialNumber,
                        CategoryName = d.Asset.Category!.Name,
                        DepartmentName = d.Asset.CurrentDepartment!.Name,
                        SectionName = d.Asset.CurrentSection != null ? d.Asset.CurrentSection.Name : null,
                        DisposalReason = d.DisposalReason.ToString(),
                        DisposalMethod = "Manual", // AssetDisposal model ?? ??????
                        AssetCost = d.Asset.PurchasePrice ?? 0,
                        Notes = d.Notes,
                        DisposalDate = d.DisposalDate,
                        DisposedByEmployee = d.PerformedByUser != null ? d.PerformedByUser.FullName : ""
                    })
                    .ToListAsync();

                var summary = new ReportSummaryDto
                {
                    TotalDisposals = disposals.Count,
                    TotalDisposalValue = disposals.Sum(d => d.AssetCost)
                };

                return ApiResponse<ReportResultDto>.SuccessResponse(new ReportResultDto
                {
                    Summary = summary,
                    Disposals = disposals
                });
            }
            catch (Exception ex)
            {
                return ApiResponse<ReportResultDto>.ErrorResponse($"??? ?? ????? ????? ???????: {ex.Message}");
            }
        }

        public async Task<ApiResponse<ReportResultDto>> GenerateMaintenanceReportAsync(ReportFilterDto filter)
        {
            try
            {
                var query = _context.AssetMaintenances
                    .Include(m => m.Asset)
                        .ThenInclude(a => a.Category)
                    .Include(m => m.Asset)
                        .ThenInclude(a => a.CurrentDepartment)
                    .Include(m => m.Asset)
                        .ThenInclude(a => a.CurrentSection)
                    .Where(m => m.ScheduledDate.HasValue && m.ScheduledDate.Value >= filter.StartDate && m.ScheduledDate.Value <= filter.EndDate.AddDays(1).AddTicks(-1));

                if (filter.DepartmentId.HasValue)
                    query = query.Where(m => m.Asset.CurrentDepartmentId == filter.DepartmentId.Value);

                if (filter.SectionId.HasValue)
                    query = query.Where(m => m.Asset.CurrentSectionId == filter.SectionId.Value);

                if (filter.CategoryId.HasValue)
                    query = query.Where(m => m.Asset.CategoryId == filter.CategoryId.Value);

                var maintenance = await query
                    .OrderBy(m => m.ScheduledDate)
                    .Select(m => new MaintenanceReportDto
                    {
                        Id = m.Id,
                        AssetName = m.Asset.Name,
                        AssetSerialNumber = m.Asset.SerialNumber,
                        CategoryName = m.Asset.Category!.Name,
                        DepartmentName = m.Asset.CurrentDepartment!.Name,
                        SectionName = m.Asset.CurrentSection != null ? m.Asset.CurrentSection.Name : null,
                        MaintenanceType = m.MaintenanceType.ToString(),
                        Status = m.Status.ToString(),
                        Cost = m.Cost,
                        Description = m.Description,
                        ScheduledDate = m.ScheduledDate ?? DateTime.MinValue,
                        CompletedDate = m.CompletedDate,
                        TechnicianName = m.TechnicianName
                    })
                    .ToListAsync();

                var summary = new ReportSummaryDto
                {
                    TotalMaintenance = maintenance.Count,
                    TotalMaintenanceCost = maintenance.Sum(m => m.Cost ?? 0)
                };

                return ApiResponse<ReportResultDto>.SuccessResponse(new ReportResultDto
                {
                    Summary = summary,
                    Maintenance = maintenance
                });
            }
            catch (Exception ex)
            {
                return ApiResponse<ReportResultDto>.ErrorResponse($"??? ?? ????? ????? ???????: {ex.Message}");
            }
        }

        public async Task<ApiResponse<ReportResultDto>> GenerateTransferReportAsync(ReportFilterDto filter)
        {
            try
            {
                var query = _context.AssetMovements
                    .Include(m => m.Asset)
                        .ThenInclude(a => a.Category)
                    .Include(m => m.FromDepartment)
                    .Include(m => m.FromSection)
                    .Include(m => m.ToDepartment)
                    .Include(m => m.ToSection)
                    .Include(m => m.PerformedByUser)
                    .Where(m => m.CreatedAt >= filter.StartDate && m.CreatedAt <= filter.EndDate.AddDays(1).AddTicks(-1));

                if (filter.DepartmentId.HasValue)
                    query = query.Where(m => m.FromDepartmentId == filter.DepartmentId.Value || m.ToDepartmentId == filter.DepartmentId.Value);

                if (filter.SectionId.HasValue)
                    query = query.Where(m => m.FromSectionId == filter.SectionId.Value || m.ToSectionId == filter.SectionId.Value);

                if (filter.CategoryId.HasValue)
                    query = query.Where(m => m.Asset.CategoryId == filter.CategoryId.Value);

                var transfers = await query
                    .OrderBy(m => m.CreatedAt)
                    .Select(m => new TransferReportDto
                    {
                        Id = m.Id,
                        AssetName = m.Asset.Name,
                        AssetSerialNumber = m.Asset.SerialNumber,
                        CategoryName = m.Asset.Category!.Name,
                        FromDepartment = m.FromDepartment!.Name,
                        FromSection = m.FromSection != null ? m.FromSection.Name : null,
                        ToDepartment = m.ToDepartment!.Name,
                        ToSection = m.ToSection != null ? m.ToSection.Name : null,
                        RequestedByEmployee = m.PerformedByUser.FullName ?? "Unknown",
                        ApprovedByEmployee = null, // Not available in this model
                        RequestDate = m.CreatedAt,
                        ApprovalDate = null, // Not available in this model
                        Status = m.MovementType.ToString(),
                        Notes = m.Notes
                    })
                    .ToListAsync();

                var summary = new ReportSummaryDto
                {
                    TotalTransfers = transfers.Count
                };

                return ApiResponse<ReportResultDto>.SuccessResponse(new ReportResultDto
                {
                    Summary = summary,
                    Transfers = transfers
                });
            }
            catch (Exception ex)
            {
                return ApiResponse<ReportResultDto>.ErrorResponse($"??? ?? ????? ????? ?????: {ex.Message}");
            }
        }

        public async Task<ApiResponse<ReportResultDto>> GenerateSummaryReportAsync(ReportFilterDto filter)
        {
            try
            {
                var assetsTask = GenerateAssetReportAsync(filter);
                var disposalsTask = GenerateDisposalReportAsync(filter);
                var maintenanceTask = GenerateMaintenanceReportAsync(filter);
                var transfersTask = GenerateTransferReportAsync(filter);

                await Task.WhenAll(assetsTask, disposalsTask, maintenanceTask, transfersTask);

                var assetsResult = await assetsTask;
                var disposalsResult = await disposalsTask;
                var maintenanceResult = await maintenanceTask;
                var transfersResult = await transfersTask;

                var summary = new ReportSummaryDto
                {
                    TotalAssets = assetsResult.Data?.Summary.TotalAssets ?? 0,
                    TotalDisposals = disposalsResult.Data?.Summary.TotalDisposals ?? 0,
                    TotalMaintenance = maintenanceResult.Data?.Summary.TotalMaintenance ?? 0,
                    TotalTransfers = transfersResult.Data?.Summary.TotalTransfers ?? 0,
                    TotalAssetValue = assetsResult.Data?.Summary.TotalAssetValue ?? 0,
                    TotalDisposalValue = disposalsResult.Data?.Summary.TotalDisposalValue ?? 0,
                    TotalMaintenanceCost = maintenanceResult.Data?.Summary.TotalMaintenanceCost ?? 0
                };

                return ApiResponse<ReportResultDto>.SuccessResponse(new ReportResultDto
                {
                    Summary = summary
                });
            }
            catch (Exception ex)
            {
                return ApiResponse<ReportResultDto>.ErrorResponse($"??? ?? ????? ??????? ??????: {ex.Message}");
            }
        }

        public async Task<ApiResponse<byte[]>> ExportReportToCsvAsync(ReportType reportType, ReportFilterDto filter)
        {
            try
            {
                var csvContent = new StringBuilder();

                switch (reportType)
                {
                    case ReportType.Assets:
                        var assetsResult = await GenerateAssetReportAsync(filter);
                        if (!assetsResult.Success || assetsResult.Data?.Assets == null)
                            return ApiResponse<byte[]>.ErrorResponse("??? ?? ??? ?????? ??????");

                        csvContent.AppendLine("?????,??? ?????,????? ????????,?????,?????,??????,??????,???????,????? ???????");
                        foreach (var asset in assetsResult.Data.Assets)
                        {
                            csvContent.AppendLine($"{asset.Id},{asset.Name},{asset.SerialNumber},{asset.CategoryName},{asset.DepartmentName},{asset.SectionName ?? ""},{asset.StatusName},{asset.Cost},{asset.CreatedAt:yyyy-MM-dd}");
                        }
                        break;

                    case ReportType.Disposals:
                        var disposalsResult = await GenerateDisposalReportAsync(filter);
                        if (!disposalsResult.Success || disposalsResult.Data?.Disposals == null)
                            return ApiResponse<byte[]>.ErrorResponse("??? ?? ??? ?????? ???????");

                        csvContent.AppendLine("?????,??? ?????,????? ????????,?????,?????,??????,??? ???????,????? ???????,???????,????? ???????,?????? ???????");
                        foreach (var disposal in disposalsResult.Data.Disposals)
                        {
                            csvContent.AppendLine($"{disposal.Id},{disposal.AssetName},{disposal.AssetSerialNumber},{disposal.CategoryName},{disposal.DepartmentName},{disposal.SectionName ?? ""},{disposal.DisposalReason},{disposal.DisposalMethod},{disposal.AssetCost},{disposal.DisposalDate:yyyy-MM-dd},{disposal.DisposedByEmployee}");
                        }
                        break;

                    case ReportType.Maintenance:
                        var maintenanceResult = await GenerateMaintenanceReportAsync(filter);
                        if (!maintenanceResult.Success || maintenanceResult.Data?.Maintenance == null)
                            return ApiResponse<byte[]>.ErrorResponse("??? ?? ??? ?????? ???????");

                        csvContent.AppendLine("?????,??? ?????,????? ????????,?????,?????,??????,??? ???????,??????,???????,??????? ???????,????? ???????,?????");
                        foreach (var maintenance in maintenanceResult.Data.Maintenance)
                        {
                            csvContent.AppendLine($"{maintenance.Id},{maintenance.AssetName},{maintenance.AssetSerialNumber},{maintenance.CategoryName},{maintenance.DepartmentName},{maintenance.SectionName ?? ""},{maintenance.MaintenanceType},{maintenance.Status},{maintenance.Cost ?? 0},{maintenance.ScheduledDate:yyyy-MM-dd},{maintenance.CompletedDate?.ToString("yyyy-MM-dd") ?? ""},{maintenance.TechnicianName ?? ""}");
                        }
                        break;

                    case ReportType.Transfers:
                        var transfersResult = await GenerateTransferReportAsync(filter);
                        if (!transfersResult.Success || transfersResult.Data?.Transfers == null)
                            return ApiResponse<byte[]>.ErrorResponse("??? ?? ??? ?????? ?????");

                        csvContent.AppendLine("?????,??? ?????,????? ????????,?????,?? ?????,?? ??????,??? ?????,??? ??????,???? ?????,???????,????? ?????,????? ????????,??????");
                        foreach (var transfer in transfersResult.Data.Transfers)
                        {
                            csvContent.AppendLine($"{transfer.Id},{transfer.AssetName},{transfer.AssetSerialNumber},{transfer.CategoryName},{transfer.FromDepartment},{transfer.FromSection ?? ""},{transfer.ToDepartment},{transfer.ToSection ?? ""},{transfer.RequestedByEmployee},{transfer.ApprovedByEmployee ?? ""},{transfer.RequestDate:yyyy-MM-dd},{transfer.ApprovalDate?.ToString("yyyy-MM-dd") ?? ""},{transfer.Status}");
                        }
                        break;

                    default:
                        return ApiResponse<byte[]>.ErrorResponse("??? ??????? ??? ?????");
                }

                var bytes = Encoding.UTF8.GetBytes(csvContent.ToString());
                return ApiResponse<byte[]>.SuccessResponse(bytes);
            }
            catch (Exception ex)
            {
                return ApiResponse<byte[]>.ErrorResponse($"??? ?? ????? ???????: {ex.Message}");
            }
        }
    }
}