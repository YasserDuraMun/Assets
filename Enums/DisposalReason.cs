using System.ComponentModel.DataAnnotations;

namespace Assets.Enums;

public enum DisposalReason
{
    [Display(Name = "Damaged", Description = "Asset is damaged or broken")]
    Damaged = 1,

    [Display(Name = "Obsolete", Description = "Asset is obsolete or no longer usable")]
    Obsolete = 2,

    [Display(Name = "Lost", Description = "Asset is lost or missing")]
    Lost = 3,

    [Display(Name = "Stolen", Description = "Asset has been stolen")]
    Stolen = 4,

    [Display(Name = "End of Life", Description = "Asset has reached end of useful life")]
    EndOfLife = 5,

    [Display(Name = "Maintenance", Description = "Asset requires major maintenance or repair")]
    Maintenance = 6,

    [Display(Name = "Replacement", Description = "Asset has been replaced")]
    Replacement = 7,

    [Display(Name = "Other", Description = "Other disposal reason")]
    Other = 99
}
