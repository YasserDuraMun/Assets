using System.ComponentModel.DataAnnotations;

namespace Assets.DTOs.Category;

public class CreateCategoryDto
{
    [Required(ErrorMessage = "??? ??????? ?????")]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "??? ??????? ?????")]
    [StringLength(50)]
    public string Code { get; set; } = string.Empty;

    public string? Description { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; } = "#1890ff";
}

public class UpdateCategoryDto
{
    [Required]
    public int Id { get; set; }

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Code { get; set; } = string.Empty;

    public string? Description { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public bool IsActive { get; set; }
}

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public bool IsActive { get; set; }
    public int SubCategoriesCount { get; set; }
    public int AssetsCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateSubCategoryDto
{
    [Required(ErrorMessage = "??? ????? ??????? ?????")]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "??? ????? ??????? ?????")]
    [StringLength(50)]
    public string Code { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required(ErrorMessage = "????? ???????? ??????")]
    [Range(1, int.MaxValue, ErrorMessage = "??? ?????? ??? ?????? ?????")]
    public int CategoryId { get; set; }
}

public class SubCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int AssetsCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
