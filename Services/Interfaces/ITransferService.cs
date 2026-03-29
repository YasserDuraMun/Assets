using Assets.DTOs.Transfer;

namespace Assets.Services.Interfaces;

public interface ITransferService
{
    Task<TransferDto> CreateTransferAsync(CreateTransferDto dto, int userId);
    Task<TransferDto?> GetByIdAsync(int id);
    Task<List<TransferDto>> GetAllAsync(int? assetId = null, int? employeeId = null);
    Task<List<TransferDto>> GetTransferHistoryByAssetAsync(int assetId);
}
