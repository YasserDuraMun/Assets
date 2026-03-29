using System.ComponentModel.DataAnnotations;

namespace Assets.DTOs.Auth;

public class LoginDto
{
    [Required(ErrorMessage = "??? ???????? ?????")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "???? ?????? ??????")]
    public string Password { get; set; } = string.Empty;
}

public class LoginResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}
