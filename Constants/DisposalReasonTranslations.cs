using Assets.Enums;

namespace Assets.Constants;

public static class DisposalReasonTranslations
{
    public static readonly Dictionary<DisposalReason, string> ArabicNames = new()
    {
        { DisposalReason.Damaged, "????/?????" },
        { DisposalReason.Obsolete, "????/??? ???? ?????????" },
        { DisposalReason.Lost, "?????" },
        { DisposalReason.Stolen, "?????" },
        { DisposalReason.EndOfLife, "?????? ????? ?????????" },
        { DisposalReason.Maintenance, "????? ?????? ????" },
        { DisposalReason.Replacement, "?? ?????????" },
        { DisposalReason.Other, "????" }
    };

    public static readonly Dictionary<DisposalReason, string> EnglishNames = new()
    {
        { DisposalReason.Damaged, "Damaged" },
        { DisposalReason.Obsolete, "Obsolete" },
        { DisposalReason.Lost, "Lost" },
        { DisposalReason.Stolen, "Stolen" },
        { DisposalReason.EndOfLife, "End of Life" },
        { DisposalReason.Maintenance, "Maintenance" },
        { DisposalReason.Replacement, "Replacement" },
        { DisposalReason.Other, "Other" }
    };

    public static string GetArabicName(this DisposalReason reason)
    {
        return ArabicNames.TryGetValue(reason, out var arabicName) ? arabicName : reason.ToString();
    }

    public static string GetEnglishName(this DisposalReason reason)
    {
        return EnglishNames.TryGetValue(reason, out var englishName) ? englishName : reason.ToString();
    }
}