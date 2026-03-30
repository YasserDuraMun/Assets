using System.ComponentModel.DataAnnotations;

namespace Assets.DTOs.Report
{
    public class ReportFilterDto
    {
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime EndDate { get; set; }
        
        public int? DepartmentId { get; set; }
        public int? SectionId { get; set; }
        public int? CategoryId { get; set; }
        public string? Status { get; set; }
    }

    public class AssetReportDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string SerialNumber { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public string? SectionName { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public decimal Cost { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class DisposalReportDto
    {
        public int Id { get; set; }
        public string AssetName { get; set; } = string.Empty;
        public string AssetSerialNumber { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public string? SectionName { get; set; }
        public string DisposalReason { get; set; } = string.Empty;
        public string DisposalMethod { get; set; } = string.Empty;
        public decimal AssetCost { get; set; }
        public string? Notes { get; set; }
        public DateTime DisposalDate { get; set; }
        public string DisposedByEmployee { get; set; } = string.Empty;
    }

    public class MaintenanceReportDto
    {
        public int Id { get; set; }
        public string AssetName { get; set; } = string.Empty;
        public string AssetSerialNumber { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public string? SectionName { get; set; }
        public string MaintenanceType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal? Cost { get; set; }
        public string? Description { get; set; }
        public DateTime ScheduledDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public string? TechnicianName { get; set; }
    }

    public class TransferReportDto
    {
        public int Id { get; set; }
        public string AssetName { get; set; } = string.Empty;
        public string AssetSerialNumber { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string FromDepartment { get; set; } = string.Empty;
        public string? FromSection { get; set; }
        public string ToDepartment { get; set; } = string.Empty;
        public string? ToSection { get; set; }
        public string RequestedByEmployee { get; set; } = string.Empty;
        public string? ApprovedByEmployee { get; set; }
        public DateTime RequestDate { get; set; }
        public DateTime? ApprovalDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public class ReportSummaryDto
    {
        public int TotalAssets { get; set; }
        public int TotalDisposals { get; set; }
        public int TotalMaintenance { get; set; }
        public int TotalTransfers { get; set; }
        public decimal TotalAssetValue { get; set; }
        public decimal TotalDisposalValue { get; set; }
        public decimal TotalMaintenanceCost { get; set; }
    }

    public class ReportResultDto
    {
        public ReportSummaryDto Summary { get; set; } = new();
        public List<AssetReportDto>? Assets { get; set; }
        public List<DisposalReportDto>? Disposals { get; set; }
        public List<MaintenanceReportDto>? Maintenance { get; set; }
        public List<TransferReportDto>? Transfers { get; set; }
    }

    public enum ReportType
    {
        Assets,
        Disposals,
        Maintenance,
        Transfers,
        Summary
    }
}