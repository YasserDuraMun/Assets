using Assets.DTOs.Report;
using Assets.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Assets.DTOs.Common;

namespace Assets.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;
        private readonly IReportsService _reportsService;

        public ReportsController(IReportService reportService, IReportsService reportsService)
        {
            _reportService = reportService;
            _reportsService = reportsService;
        }

        [HttpGet("test")]
        public IActionResult TestReports()
        {
            return Ok(ApiResponse<object>.SuccessResponse(new { message = "Reports Controller is working!" }));
        }

        [HttpGet("available-reports")]
        public IActionResult GetAvailableReports()
        {
            var reports = new
            {
                basicReports = new[]
                {
                    new { id = "assets-summary", name = "Assets Summary", description = "Overall assets summary and statistics" },
                    new { id = "assets-by-status", name = "Assets by Status", description = "Assets distribution by status" },
                    new { id = "assets-by-category", name = "Assets by Category", description = "Assets distribution by category" },
                    new { id = "assets-by-location", name = "Assets by Location", description = "Assets distribution by location" }
                },
                operationalReports = new[]
                {
                    new { id = "disposal-report", name = "Disposal Report", description = "Disposed assets during a period" },
                    new { id = "maintenance-report", name = "Maintenance Report", description = "Maintenance activities during a period" },
                    new { id = "transfers-report", name = "Transfers Report", description = "Asset transfers during a period" }
                },
                periodicalReports = new[]
                {
                    new { id = "monthly-summary", name = "Monthly Summary", description = "Monthly summary report" }
                }
            };

            return Ok(ApiResponse<object>.SuccessResponse(reports));
        }

        // New GET endpoints for Frontend compatibility
        [HttpGet("assets-summary")]
        public async Task<IActionResult> GetAssetsSummary([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var result = await _reportsService.GetAssetsSummaryReportAsync(startDate, endDate);
                return Ok(ApiResponse<object>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error generating assets summary: {ex.Message}"));
            }
        }

        [HttpGet("assets-by-status")]
        public async Task<IActionResult> GetAssetsByStatus()
        {
            try
            {
                var result = await _reportsService.GetAssetsByStatusReportAsync();
                return Ok(ApiResponse<object>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error generating assets by status report: {ex.Message}"));
            }
        }

        [HttpGet("assets-by-category")]
        public async Task<IActionResult> GetAssetsByCategory()
        {
            try
            {
                var result = await _reportsService.GetAssetsByCategoryReportAsync();
                return Ok(ApiResponse<object>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error generating assets by category report: {ex.Message}"));
            }
        }

        [HttpGet("assets-by-location")]
        public async Task<IActionResult> GetAssetsByLocation()
        {
            try
            {
                var result = await _reportsService.GetAssetsByLocationReportAsync();
                return Ok(ApiResponse<object>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error generating assets by location report: {ex.Message}"));
            }
        }

        [HttpGet("disposal-report")]
        public async Task<IActionResult> GetDisposalReport([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var result = await _reportsService.GetDisposalReportAsync(startDate, endDate);
                return Ok(ApiResponse<object>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error generating disposal report: {ex.Message}"));
            }
        }

        [HttpGet("maintenance-report")]
        public async Task<IActionResult> GetMaintenanceReport([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var result = await _reportsService.GetMaintenanceReportAsync(startDate, endDate);
                return Ok(ApiResponse<object>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error generating maintenance report: {ex.Message}"));
            }
        }

        [HttpGet("transfers-report")]
        public async Task<IActionResult> GetTransfersReport([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null, 
            [FromQuery] string? fromLocation = null, [FromQuery] string? toLocation = null)
        {
            try
            {
                var result = await _reportsService.GetTransfersReportAsync(startDate, endDate, fromLocation, toLocation);
                return Ok(ApiResponse<object>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error generating transfers report: {ex.Message}"));
            }
        }

        [HttpGet("monthly-summary")]
        public async Task<IActionResult> GetMonthlySummary([FromQuery] int year, [FromQuery] int month)
        {
            try
            {
                var result = await _reportsService.GetMonthlySummaryReportAsync(year, month);
                return Ok(ApiResponse<object>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Error generating monthly summary: {ex.Message}"));
            }
        }

        // Keep existing POST endpoints for backward compatibility
        [HttpPost("assets")]
        public async Task<IActionResult> GetAssetReport([FromBody] ReportFilterDto filter)
        {
            var result = await _reportService.GenerateAssetReportAsync(filter);
            
            if (!result.Success)
                return BadRequest(result);
                
            return Ok(result);
        }

        [HttpPost("disposals")]
        public async Task<IActionResult> GetDisposalReport([FromBody] ReportFilterDto filter)
        {
            var result = await _reportService.GenerateDisposalReportAsync(filter);
            
            if (!result.Success)
                return BadRequest(result);
                
            return Ok(result);
        }

        [HttpPost("maintenance")]
        public async Task<IActionResult> GetMaintenanceReport([FromBody] ReportFilterDto filter)
        {
            var result = await _reportService.GenerateMaintenanceReportAsync(filter);
            
            if (!result.Success)
                return BadRequest(result);
                
            return Ok(result);
        }

        [HttpPost("transfers")]
        public async Task<IActionResult> GetTransferReport([FromBody] ReportFilterDto filter)
        {
            var result = await _reportService.GenerateTransferReportAsync(filter);
            
            if (!result.Success)
                return BadRequest(result);
                
            return Ok(result);
        }

        [HttpPost("summary")]
        public async Task<IActionResult> GetSummaryReport([FromBody] ReportFilterDto filter)
        {
            var result = await _reportService.GenerateSummaryReportAsync(filter);
            
            if (!result.Success)
                return BadRequest(result);
                
            return Ok(result);
        }

        [HttpPost("export/{reportType}")]
        public async Task<IActionResult> ExportReport([FromRoute] ReportType reportType, [FromBody] ReportFilterDto filter)
        {
            var result = await _reportService.ExportReportToCsvAsync(reportType, filter);
            
            if (!result.Success)
                return BadRequest(result);

            var fileName = $"report_{reportType}_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
            return File(result.Data!, "text/csv", fileName);
        }
    }
}