using Assets.Enums;
using Assets.Models.Security;

namespace Assets.Models;

public class AssetDisposal
{
    public int Id { get; set; }
    public int AssetId { get; set; }
    public DateTime DisposalDate { get; set; }

    // ??? ??????? - ?????
    public DisposalReason DisposalReason { get; set; }
    
    // ??????? ???? (???? ?? ????????)
    public string? Notes { get; set; }

    // ?? ??? ???????? - ????? ????????
    public int PerformedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Asset Asset { get; set; } = null!;
    public Security.User PerformedByUser { get; set; } = null!;  // SecurityUser
}
