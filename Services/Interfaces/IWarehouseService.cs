using Assets.DTOs.Warehouse;

namespace Assets.Services.Interfaces;

public interface IWarehouseService
{
    Task<List<WarehouseDto>> GetAllAsync();
    Task<WarehouseDto?> GetByIdAsync(int id);
    Task<WarehouseDto> CreateAsync(CreateWarehouseDto dto);
    Task<WarehouseDto> UpdateAsync(UpdateWarehouseDto dto);
    Task<bool> DeleteAsync(int id);
    Task<List<WarehouseDto>> GetActiveAsync();
}
