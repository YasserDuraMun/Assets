using System.ComponentModel.DataAnnotations;

namespace Assets.DTOs.Employee;

public class CreateEmployeeDto
{
    [Required(ErrorMessage = "??? ?????? ?????")]
    [StringLength(200)]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "??? ?????? ?????")]
    [StringLength(50)]
    public string EmployeeNumber { get; set; } = string.Empty;

    [StringLength(50)]
    public string? NationalId { get; set; }

    [Phone]
    public string? Phone { get; set; }

    [EmailAddress]
    public string? Email { get; set; }

    public string? JobTitle { get; set; }

    public int? SectionId { get; set; }

    [Required(ErrorMessage = "??????? ??????")]
    public int DepartmentId { get; set; }

    public DateTime? HireDate { get; set; }
}

public class UpdateEmployeeDto
{
    [Required]
    public int Id { get; set; }

    [Required]
    [StringLength(200)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string EmployeeNumber { get; set; } = string.Empty;

    public string? NationalId { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? JobTitle { get; set; }
    public int? SectionId { get; set; }
    public int DepartmentId { get; set; }
    public DateTime? HireDate { get; set; }
    public bool IsActive { get; set; }
}

public class EmployeeDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string EmployeeNumber { get; set; } = string.Empty;
    public string? NationalId { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? JobTitle { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string? SectionName { get; set; }
    public string? QRCode { get; set; }
    public int AssetsCount { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
