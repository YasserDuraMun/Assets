using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace Assets.Extensions;

/// <summary>
/// Extension methods for all enums to support Arabic and English display names
/// </summary>
public static class EnumExtensions
{
    /// <summary>
    /// Gets the Arabic display name from the Display attribute's Description property
    /// Works with all enums that have Display attributes
    /// </summary>
    /// <param name="enumValue">Any enum value</param>
    /// <returns>Arabic name from Description property, or enum name if not found</returns>
    public static string GetArabicName(this Enum enumValue)
    {
        return enumValue.GetDisplayDescription() ?? enumValue.ToString();
    }

    /// <summary>
    /// Gets the English display name from the Display attribute's Name property
    /// Works with all enums that have Display attributes
    /// </summary>
    /// <param name="enumValue">Any enum value</param>
    /// <returns>English name from Name property, or enum name if not found</returns>
    public static string GetEnglishName(this Enum enumValue)
    {
        return enumValue.GetDisplayName() ?? enumValue.ToString();
    }

    /// <summary>
    /// Gets both Arabic and English names formatted together
    /// </summary>
    /// <param name="enumValue">Any enum value</param>
    /// <param name="format">Format string with {0} for English and {1} for Arabic</param>
    /// <returns>Formatted string with both languages</returns>
    public static string GetBilingualName(this Enum enumValue, string format = "{0} - {1}")
    {
        var english = enumValue.GetEnglishName();
        var arabic = enumValue.GetArabicName();
        return string.Format(format, english, arabic);
    }

    /// <summary>
    /// Gets all enum values with their Arabic and English names
    /// </summary>
    /// <typeparam name="T">Enum type</typeparam>
    /// <returns>Dictionary with enum values as keys and bilingual names as values</returns>
    public static Dictionary<T, string> GetAllBilingualNames<T>() where T : struct, Enum
    {
        return Enum.GetValues<T>()
            .ToDictionary(
                enumValue => enumValue,
                enumValue => (enumValue as Enum)!.GetBilingualName()
            );
    }

    /// <summary>
    /// Gets all enum values with their Arabic names only
    /// </summary>
    /// <typeparam name="T">Enum type</typeparam>
    /// <returns>Dictionary with enum values as keys and Arabic names as values</returns>
    public static Dictionary<T, string> GetAllArabicNames<T>() where T : struct, Enum
    {
        return Enum.GetValues<T>()
            .ToDictionary(
                enumValue => enumValue,
                enumValue => (enumValue as Enum)!.GetArabicName()
            );
    }

    /// <summary>
    /// Gets all enum values with their English names only
    /// </summary>
    /// <typeparam name="T">Enum type</typeparam>
    /// <returns>Dictionary with enum values as keys and English names as values</returns>
    public static Dictionary<T, string> GetAllEnglishNames<T>() where T : struct, Enum
    {
        return Enum.GetValues<T>()
            .ToDictionary(
                enumValue => enumValue,
                enumValue => (enumValue as Enum)!.GetEnglishName()
            );
    }

    #region Private Helper Methods

    /// <summary>
    /// Gets the Display attribute's Name property
    /// </summary>
    private static string? GetDisplayName(this Enum enumValue)
    {
        return enumValue.GetType()
            .GetMember(enumValue.ToString())
            .FirstOrDefault()
            ?.GetCustomAttribute<DisplayAttribute>()
            ?.GetName();
    }

    /// <summary>
    /// Gets the Display attribute's Description property
    /// </summary>
    private static string? GetDisplayDescription(this Enum enumValue)
    {
        return enumValue.GetType()
            .GetMember(enumValue.ToString())
            .FirstOrDefault()
            ?.GetCustomAttribute<DisplayAttribute>()
            ?.GetDescription();
    }

    #endregion
}