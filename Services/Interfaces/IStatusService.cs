using Assets.DTOs.Status;

namespace Assets.Services.Interfaces;

public interface IStatusService
{
    Task<List<StatusDto>> GetAllAsync();
    Task<StatusDto?> GetByIdAsync(int id);
    Task<StatusDto> CreateAsync(CreateStatusDto dto);
    Task<StatusDto> UpdateAsync(UpdateStatusDto dto);
    Task<bool> DeleteAsync(int id);
    Task<List<StatusDto>> GetActiveAsync();
}
