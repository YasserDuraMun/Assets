using Assets.DTOs.Category;

namespace Assets.Services.Interfaces;

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllAsync();
    Task<CategoryDto?> GetByIdAsync(int id);
    Task<CategoryDto> CreateAsync(CreateCategoryDto dto);
    Task<CategoryDto> UpdateAsync(UpdateCategoryDto dto);
    Task<bool> DeleteAsync(int id);
    
    // SubCategories
    Task<List<SubCategoryDto>> GetSubCategoriesAsync(int categoryId);
    Task<SubCategoryDto> CreateSubCategoryAsync(CreateSubCategoryDto dto);
    Task<SubCategoryDto> UpdateSubCategoryAsync(UpdateSubCategoryDto dto);
    Task<bool> DeleteSubCategoryAsync(int id);

    // AssetNames
    Task<List<AssetNameDto>> GetAssetNamesBySubCategoryAsync(int subCategoryId);
    Task<AssetNameDto> CreateAssetNameAsync(CreateAssetNameDto dto);
    Task<AssetNameDto> UpdateAssetNameAsync(UpdateAssetNameDto dto);
    Task<bool> DeleteAssetNameAsync(int id);
}
