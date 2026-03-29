using Assets.DTOs.Disposal;
using Assets.DTOs.Common;

namespace Assets.Services.Interfaces;

public interface IDisposalService
{
    Task<DisposalDto> CreateDisposalAsync(CreateDisposalDto dto, int userId);
    Task<DisposalDto?> GetByIdAsync(int id);
    Task<PagedResult<DisposalDto>> GetAllAsync(int pageNumber = 1, int pageSize = 10, string? searchTerm = null, 
        int? disposalReason = null, DateTime? startDate = null, DateTime? endDate = null);
    Task<string> UploadDocumentAsync(int disposalId, string documentPath);
    Task<int> GetDisposedAssetsCountAsync();
}
