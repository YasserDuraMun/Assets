using System.ComponentModel.DataAnnotations;

namespace Assets.DTOs.Status;

public class StatusDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public bool IsActive { get; set; }
    public int AssetsCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateStatusDto
{
    [Required(ErrorMessage = "??? ?????? ?????")]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    [StringLength(20)]
    public string? Color { get; set; }

    public string? Icon { get; set; }
}

public class UpdateStatusDto
{
    [Required]
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    [StringLength(20)]
    public string? Color { get; set; }

    public string? Icon { get; set; }

    public bool IsActive { get; set; }
}
