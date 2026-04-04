using Assets.DTOs.Asset;
using Assets.DTOs.Common;

namespace Assets.Services.Interfaces;

public interface IAssetService
{
    Task<PagedResult<AssetListDto>> GetAllAsync(
        int pageNumber, 
        int pageSize, 
        string? searchTerm = null, 
        int? categoryId = null, 
        int? statusId = null,
        int? locationType = null,
        int? departmentId = null,
        int? sectionId = null,
        int? employeeId = null,
        int? warehouseId = null);
    Task<AssetDto?> GetByIdAsync(int id, bool includeDeleted = false);
    Task<AssetDto> CreateAsync(CreateAssetDto dto, int userId);
    Task<AssetDto> UpdateAsync(UpdateAssetDto dto, int userId);
    Task<bool> DeleteAsync(int id, int userId);
    Task<string> GenerateQRCodeAsync(int assetId);
    Task<List<AssetListDto>> GetByEmployeeAsync(int employeeId);
    Task<List<AssetListDto>> GetByWarehouseAsync(int warehouseId);
    Task<List<AssetListDto>> GetByDepartmentAsync(int departmentId);
}
