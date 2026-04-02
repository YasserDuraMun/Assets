using System.ComponentModel.DataAnnotations;

namespace Assets.Enums;

public enum DisposalMethod
{
    [Display(Name = "Destruction", Description = "Complete destruction of the asset")]
    Destruction = 1,

    [Display(Name = "Sale", Description = "Sale or auction of the asset")]
    Sale = 2,

    [Display(Name = "Donation", Description = "Donation of the asset")]
    Donation = 3,

    [Display(Name = "Storage", Description = "Long-term storage")]
    Storage = 4,

    [Display(Name = "Other", Description = "Other disposal method")]
    Other = 99
}
