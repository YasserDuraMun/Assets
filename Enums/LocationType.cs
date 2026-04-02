using System.ComponentModel.DataAnnotations;

namespace Assets.Enums;

public enum LocationType
{
    [Display(Name = "Warehouse", Description = "????")]
    Warehouse = 1,

    [Display(Name = "Employee", Description = "????")]
    Employee = 2,

    [Display(Name = "Department", Description = "?????")]
    Department = 3,

    [Display(Name = "Section", Description = "???")]
    Section = 4
}
