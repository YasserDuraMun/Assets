using System.ComponentModel.DataAnnotations;

namespace Assets.Enums;

public enum UserRole
{
    [Display(Name = "Admin", Description = "System Administrator")]
    Admin = 1,

    [Display(Name = "Warehouse Keeper", Description = "Warehouse Manager")]
    WarehouseKeeper = 2,

    [Display(Name = "Viewer", Description = "Read-only User")]
    Viewer = 3
}
