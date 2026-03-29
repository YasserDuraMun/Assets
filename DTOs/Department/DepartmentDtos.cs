using System.ComponentModel.DataAnnotations;

namespace Assets.DTOs.Department;

public class CreateDepartmentDto
{
    [Required(ErrorMessage = "??? ??????? ?????")]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "??? ??????? ?????")]
    [StringLength(50)]
    public string Code { get; set; } = string.Empty;

    public string? Description { get; set; }
}

public class UpdateDepartmentDto
{
    [Required]
    public int Id { get; set; }

    [Required(ErrorMessage = "??? ??????? ?????")]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "??? ??????? ?????")]
    [StringLength(50)]
    public string Code { get; set; } = string.Empty;

    public string? Description { get; set; }
    public bool IsActive { get; set; }
}

public class DepartmentDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public int SectionsCount { get; set; }
    public int EmployeesCount { get; set; }
    public int AssetsCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
