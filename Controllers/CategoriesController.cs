using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Assets.DTOs.Category;
using Assets.DTOs.Common;
using Assets.Services.Interfaces;

namespace Assets.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;
    private readonly ILogger<CategoriesController> _logger;

    public CategoriesController(ICategoryService categoryService, ILogger<CategoriesController> logger)
    {
        _categoryService = categoryService;
        _logger = logger;
    }

    /// <summary>
    /// Get all asset categories
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,WarehouseKeeper,Viewer")]
    public async Task<IActionResult> GetCategories()
    {
        try
        {
            var categories = await _categoryService.GetAllAsync();
            return Ok(ApiResponse<List<CategoryDto>>.SuccessResponse(categories));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting categories");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ?????????"));
        }
    }

    /// <summary>
    /// Get category by ID
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,WarehouseKeeper,Viewer")]
    public async Task<IActionResult> GetCategory(int id)
    {
        try
        {
            var category = await _categoryService.GetByIdAsync(id);

            if (category == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("??????? ??? ?????"));
            }

            return Ok(ApiResponse<CategoryDto>.SuccessResponse(category));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting category");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ???????"));
        }
    }

    /// <summary>
    /// Create new category
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,WarehouseKeeper")]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto dto)
    {
        try
        {
            var category = await _categoryService.CreateAsync(dto);
            return CreatedAtAction(
                nameof(GetCategory),
                new { id = category.Id },
                ApiResponse<CategoryDto>.SuccessResponse(category, "?? ????? ??????? ?????")
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating category");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ????? ???????"));
        }
    }

    /// <summary>
    /// Update category
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,WarehouseKeeper")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryDto dto)
    {
        if (id != dto.Id)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("???? ????? ??? ??????"));
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("???????? ??????? ??? ?????"));
        }

        try
        {
            var category = await _categoryService.UpdateAsync(dto);
            return Ok(ApiResponse<CategoryDto>.SuccessResponse(category, "?? ????? ????? ?????"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating category with ID: {Id}", id);
            
            if (ex.Message.Contains("not found"))
            {
                return NotFound(ApiResponse<object>.ErrorResponse("????? ??? ??????"));
            }
            
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ????? ?????"));
        }
    }

    /// <summary>
    /// Delete category (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        try
        {
            var success = await _categoryService.DeleteAsync(id);

            if (!success)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("??????? ??? ?????"));
            }

            return Ok(ApiResponse<object>.SuccessResponse(null, "?? ??? ??????? ?????"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting category");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ???????"));
        }
    }

    /// <summary>
    /// Get subcategories of a category
    /// </summary>
    [HttpGet("{id}/subcategories")]
    [Authorize(Roles = "Admin,WarehouseKeeper,Viewer")]
    public async Task<IActionResult> GetSubCategories(int id)
    {
        try
        {
            var subCategories = await _categoryService.GetSubCategoriesAsync(id);
            return Ok(ApiResponse<List<SubCategoryDto>>.SuccessResponse(subCategories));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting subcategories");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ????????? ???????"));
        }
    }

    /// <summary>
    /// Create new subcategory
    /// </summary>
    [HttpPost("subcategories")]
    [Authorize(Roles = "Admin,WarehouseKeeper")]
    public async Task<IActionResult> CreateSubCategory([FromBody] CreateSubCategoryDto dto)
    {
        try
        {
            _logger.LogInformation("Creating subcategory with CategoryId: {CategoryId}, Name: {Name}", dto.CategoryId, dto.Name);
            
            var subCategory = await _categoryService.CreateSubCategoryAsync(dto);
            return Ok(ApiResponse<SubCategoryDto>.SuccessResponse(subCategory, "?? ????? ????? ??????? ?????"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating subcategory. DTO: {@Dto}", dto);
            return StatusCode(500, ApiResponse<object>.ErrorResponse($"??? ?? ????? ????? ???????: {ex.Message}"));
        }
    }

    /// <summary>
    /// Update subcategory
    /// </summary>
    [HttpPut("subcategories/{id}")]
    [Authorize(Roles = "Admin,WarehouseKeeper")]
    public async Task<IActionResult> UpdateSubCategory(int id, [FromBody] UpdateSubCategoryDto dto)
    {
        if (id != dto.Id)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("???? ????? ??????? ??? ??????"));
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("???????? ??????? ??? ?????"));
        }

        try
        {
            var subCategory = await _categoryService.UpdateSubCategoryAsync(dto);
            return Ok(ApiResponse<SubCategoryDto>.SuccessResponse(subCategory, "?? ????? ????? ??????? ?????"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating subcategory with ID: {Id}", id);
            
            if (ex.Message.Contains("not found"))
            {
                return NotFound(ApiResponse<object>.ErrorResponse("????? ??????? ??? ??????"));
            }
            
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ????? ????? ???????"));
        }
    }

    /// <summary>
    /// Delete subcategory (soft delete)
    /// </summary>
    [HttpDelete("subcategories/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteSubCategory(int id)
    {
        try
        {
            var success = await _categoryService.DeleteSubCategoryAsync(id);

            if (!success)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("??????? ?????? ??? ?????"));
            }

            return Ok(ApiResponse<object>.SuccessResponse(null, "?? ??? ????? ??????? ?????"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting subcategory");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("??? ?? ??? ??????? ??????"));
        }
    }
}
