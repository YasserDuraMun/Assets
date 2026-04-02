using System.ComponentModel.DataAnnotations;

namespace Assets.DTOs.Section;

public class CreateSectionDto
{
    [Required(ErrorMessage = "??? ????? ?????")]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required(ErrorMessage = "??????? ??????")]
    public int DepartmentId { get; set; }

    public int? ManagerEmployeeId { get; set; }
}

public class UpdateSectionDto
{
    [Required]
    public int Id { get; set; }

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    public int DepartmentId { get; set; }

    public int? ManagerEmployeeId { get; set; }
    public bool IsActive { get; set; }
}

public class SectionDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public int? ManagerEmployeeId { get; set; }
    public string? ManagerEmployeeName { get; set; }
    public bool IsActive { get; set; }
    public int EmployeesCount { get; set; }
    public int AssetsCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
