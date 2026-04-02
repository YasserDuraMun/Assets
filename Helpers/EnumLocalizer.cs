using Assets.Enums;
using Assets.Extensions;

namespace Assets.Helpers;

/// <summary>
/// Helper class for working with all application enums in Arabic and English
/// </summary>
public static class EnumLocalizer
{
    /// <summary>
    /// Get all DisposalReason options
    /// </summary>
    public static class DisposalReasons
    {
        public static Dictionary<DisposalReason, string> Arabic => EnumExtensions.GetAllArabicNames<DisposalReason>();
        public static Dictionary<DisposalReason, string> English => EnumExtensions.GetAllEnglishNames<DisposalReason>();
        public static Dictionary<DisposalReason, string> Bilingual => EnumExtensions.GetAllBilingualNames<DisposalReason>();
    }

    /// <summary>
    /// Get all MaintenanceType options
    /// </summary>
    public static class MaintenanceTypes
    {
        public static Dictionary<MaintenanceType, string> Arabic => EnumExtensions.GetAllArabicNames<MaintenanceType>();
        public static Dictionary<MaintenanceType, string> English => EnumExtensions.GetAllEnglishNames<MaintenanceType>();
        public static Dictionary<MaintenanceType, string> Bilingual => EnumExtensions.GetAllBilingualNames<MaintenanceType>();
    }

    /// <summary>
    /// Get all MaintenanceStatus options
    /// </summary>
    public static class MaintenanceStatuses
    {
        public static Dictionary<MaintenanceStatus, string> Arabic => EnumExtensions.GetAllArabicNames<MaintenanceStatus>();
        public static Dictionary<MaintenanceStatus, string> English => EnumExtensions.GetAllEnglishNames<MaintenanceStatus>();
        public static Dictionary<MaintenanceStatus, string> Bilingual => EnumExtensions.GetAllBilingualNames<MaintenanceStatus>();
    }

    /// <summary>
    /// Get all DisposalMethod options
    /// </summary>
    public static class DisposalMethods
    {
        public static Dictionary<DisposalMethod, string> Arabic => EnumExtensions.GetAllArabicNames<DisposalMethod>();
        public static Dictionary<DisposalMethod, string> English => EnumExtensions.GetAllEnglishNames<DisposalMethod>();
        public static Dictionary<DisposalMethod, string> Bilingual => EnumExtensions.GetAllBilingualNames<DisposalMethod>();
    }

    /// <summary>
    /// Get all MovementType options
    /// </summary>
    public static class MovementTypes
    {
        public static Dictionary<MovementType, string> Arabic => EnumExtensions.GetAllArabicNames<MovementType>();
        public static Dictionary<MovementType, string> English => EnumExtensions.GetAllEnglishNames<MovementType>();
        public static Dictionary<MovementType, string> Bilingual => EnumExtensions.GetAllBilingualNames<MovementType>();
    }

    /// <summary>
    /// Get all UserRole options
    /// </summary>
    public static class UserRoles
    {
        public static Dictionary<UserRole, string> Arabic => EnumExtensions.GetAllArabicNames<UserRole>();
        public static Dictionary<UserRole, string> English => EnumExtensions.GetAllEnglishNames<UserRole>();
        public static Dictionary<UserRole, string> Bilingual => EnumExtensions.GetAllBilingualNames<UserRole>();
    }

    /// <summary>
    /// Get all LocationType options
    /// </summary>
    public static class LocationTypes
    {
        public static Dictionary<LocationType, string> Arabic => EnumExtensions.GetAllArabicNames<LocationType>();
        public static Dictionary<LocationType, string> English => EnumExtensions.GetAllEnglishNames<LocationType>();
        public static Dictionary<LocationType, string> Bilingual => EnumExtensions.GetAllBilingualNames<LocationType>();
    }
}