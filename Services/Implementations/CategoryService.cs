using Microsoft.EntityFrameworkCore;
using Assets.Data;
using Assets.DTOs.Category;
using Assets.Services.Interfaces;
using Assets.Models;

namespace Assets.Services.Implementations;

public class CategoryService : ICategoryService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CategoryService> _logger;

    public CategoryService(ApplicationDbContext context, ILogger<CategoryService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<CategoryDto>> GetAllAsync()
    {
        return await _context.AssetCategories
            .Where(c => c.IsActive)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Code = c.Code,
                Description = c.Description,
                Icon = c.Icon,
                IsActive = c.IsActive,
                SubCategoriesCount = c.SubCategories.Count,
                AssetsCount = c.Assets.Count,
                CreatedAt = c.CreatedAt
            })
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<CategoryDto?> GetByIdAsync(int id)
    {
        var category = await _context.AssetCategories
            .Include(c => c.SubCategories)
            .Include(c => c.Assets)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
            return null;

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Code = category.Code,
            Description = category.Description,
            Icon = category.Icon,
            Color = category.Color,
            IsActive = category.IsActive,
            SubCategoriesCount = category.SubCategories.Count,
            AssetsCount = category.Assets.Count,
            CreatedAt = category.CreatedAt
        };
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto)
    {
        var category = new AssetCategory
        {
            Name = dto.Name,
            Code = dto.Code,
            Description = dto.Description,
            Icon = dto.Icon,
            Color = dto.Color ?? "#1890ff",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.AssetCategories.Add(category);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(category.Id))!;
    }

    public async Task<CategoryDto> UpdateAsync(UpdateCategoryDto dto)
    {
        var category = await _context.AssetCategories.FindAsync(dto.Id);
        
        if (category == null)
            throw new Exception("Category not found");

        category.Name = dto.Name;
        category.Code = dto.Code;
        category.Description = dto.Description;
        category.Icon = dto.Icon;
        category.Color = dto.Color;
        category.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();

        return (await GetByIdAsync(category.Id))!;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var category = await _context.AssetCategories.FindAsync(id);
        
        if (category == null)
            return false;

        // Soft delete
        category.IsActive = false;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<SubCategoryDto>> GetSubCategoriesAsync(int categoryId)
    {
        return await _context.AssetSubCategories
            .Where(sc => sc.CategoryId == categoryId && sc.IsActive)
            .Include(sc => sc.Category)
            .Select(sc => new SubCategoryDto
            {
                Id = sc.Id,
                Name = sc.Name,
                Code = sc.Code,
                Description = sc.Description,
                CategoryId = sc.CategoryId,
                CategoryName = sc.Category.Name,
                IsActive = sc.IsActive,
                AssetsCount = sc.Assets.Count,
                CreatedAt = sc.CreatedAt
            })
            .OrderBy(sc => sc.Name)
            .ToListAsync();
    }

    public async Task<SubCategoryDto> CreateSubCategoryAsync(CreateSubCategoryDto dto)
    {
        // Validate that category exists
        var categoryExists = await _context.AssetCategories.AnyAsync(c => c.Id == dto.CategoryId && c.IsActive);
        if (!categoryExists)
        {
            throw new Exception($"Category with ID {dto.CategoryId} not found or inactive");
        }

        var subCategory = new AssetSubCategory
        {
            Name = dto.Name,
            Code = dto.Code,
            Description = dto.Description,
            CategoryId = dto.CategoryId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.AssetSubCategories.Add(subCategory);
        await _context.SaveChangesAsync();

        var result = await _context.AssetSubCategories
            .Include(sc => sc.Category)
            .Include(sc => sc.Assets)
            .FirstAsync(sc => sc.Id == subCategory.Id);

        return new SubCategoryDto
        {
            Id = result.Id,
            Name = result.Name,
            Code = result.Code,
            Description = result.Description,
            CategoryId = result.CategoryId,
            CategoryName = result.Category.Name,
            IsActive = result.IsActive,
            AssetsCount = result.Assets.Count,
            CreatedAt = result.CreatedAt
        };
    }

    public async Task<bool> DeleteSubCategoryAsync(int id)
    {
        var subCategory = await _context.AssetSubCategories.FindAsync(id);
        
        if (subCategory == null)
            return false;

        // Soft delete
        subCategory.IsActive = false;

        await _context.SaveChangesAsync();
        return true;
    }
}
