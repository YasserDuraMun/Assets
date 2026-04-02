using System.ComponentModel.DataAnnotations;

namespace Assets.Enums;

public enum MovementType
{
    [Display(Name = "Receive", Description = "??????")]
    Receive = 1,

    [Display(Name = "Transfer", Description = "???")]
    Transfer = 2,

    [Display(Name = "Return to Warehouse", Description = "????? ??????")]
    ReturnToWarehouse = 3,

    [Display(Name = "Disposal", Description = "???????")]
    Disposal = 4,

    [Display(Name = "Audit", Description = "???")]
    Audit = 5
}
