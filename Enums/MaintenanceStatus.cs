using System.ComponentModel.DataAnnotations;

namespace Assets.Enums;

public enum MaintenanceStatus
{
    [Display(Name = "Scheduled", Description = "Maintenance is scheduled")]
    Scheduled = 1,

    [Display(Name = "In Progress", Description = "Maintenance is currently being performed")]
    InProgress = 2,

    [Display(Name = "Completed", Description = "Maintenance has been completed")]
    Completed = 3,

    [Display(Name = "Cancelled", Description = "Maintenance has been cancelled")]
    Cancelled = 4
}
