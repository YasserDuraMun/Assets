using System.ComponentModel.DataAnnotations;

namespace Assets.Enums;

public enum MaintenanceType
{
    [Display(Name = "Preventive", Description = "Scheduled maintenance to prevent issues")]
    Preventive = 1,

    [Display(Name = "Corrective", Description = "Repair maintenance to fix existing issues")]
    Corrective = 2,

    [Display(Name = "Emergency", Description = "Urgent maintenance for critical issues")]
    Emergency = 3,

    [Display(Name = "Routine", Description = "Regular maintenance as per schedule")]
    Routine = 4,

    [Display(Name = "Upgrade", Description = "Enhancement or improvement maintenance")]
    Upgrade = 5
}
