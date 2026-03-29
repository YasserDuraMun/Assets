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
    Task<bool> DeleteSubCategoryAsync(int id);
}
