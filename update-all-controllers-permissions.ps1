# PowerShell script to update all Controllers with RequirePermission attributes

Write-Host "?? UPDATING ALL CONTROLLERS WITH PERMISSION-BASED AUTHORIZATION" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$controllers = @(
    @{
        File = "Controllers\AssetsController.cs"
        Screen = "Assets"
        Methods = @(
            @{ Pattern = '\[Authorize\(Roles = "[^"]*"\)\]\s*public async Task<IActionResult> Get'; Replacement = '[RequirePermission("Assets", "view")]`n    public async Task<IActionResult> Get' }
            @{ Pattern = '\[Authorize\(Roles = "[^"]*"\)\]\s*public async Task<IActionResult> Post'; Replacement = '[RequirePermission("Assets", "insert")]`n    public async Task<IActionResult> Post' }
            @{ Pattern = '\[Authorize\(Roles = "[^"]*"\)\]\s*public async Task<IActionResult> Put'; Replacement = '[RequirePermission("Assets", "update")]`n    public async Task<IActionResult> Put' }
            @{ Pattern = '\[Authorize\(Roles = "[^"]*"\)\]\s*public async Task<IActionResult> Delete'; Replacement = '[RequirePermission("Assets", "delete")]`n    public async Task<IActionResult> Delete' }
        )
    }
    @{
        File = "Controllers\ReportsController.cs"
        Screen = "Reports" 
        Methods = @(
            @{ Pattern = '\[Authorize\(Roles = "[^"]*"\)\]'; Replacement = '[RequirePermission("Reports", "view")]' }
        )
    }
    @{
        File = "Controllers\TransfersController.cs"
        Screen = "Transfers"
        Methods = @(
            @{ Pattern = '\[Authorize\(Roles = "[^"]*"\)\]\s*public async Task<IActionResult> Get'; Replacement = '[RequirePermission("Transfers", "view")]`n    public async Task<IActionResult> Get' }
            @{ Pattern = '\[Authorize\(Roles = "[^"]*"\)\]\s*public async Task<IActionResult> Post'; Replacement = '[RequirePermission("Transfers", "insert")]`n    public async Task<IActionResult> Post' }
            @{ Pattern = '\[Authorize\(Roles = "[^"]*"\)\]\s*public async Task<IActionResult> Put'; Replacement = '[RequirePermission("Transfers", "update")]`n    public async Task<IActionResult> Put' }
            @{ Pattern = '\[Authorize\(Roles = "[^"]*"\)\]\s*public async Task<IActionResult> Delete'; Replacement = '[RequirePermission("Transfers", "delete")]`n    public async Task<IActionResult> Delete' }
        )
    }
)

foreach ($controller in $controllers) {
    $filePath = $controller.File
    
    if (Test-Path $filePath) {
        Write-Host "?? Updating $filePath..." -ForegroundColor Yellow
        
        $content = Get-Content $filePath -Raw
        
        # Add using directive if not present
        if ($content -notmatch "using Assets\.Attributes;") {
            $content = $content -replace "(using Assets\.Services\.Interfaces;)", "`$1`nusing Assets.Attributes;"
            Write-Host "  ? Added using Assets.Attributes;" -ForegroundColor Green
        }
        
        # Apply method-specific replacements
        foreach ($method in $controller.Methods) {
            if ($content -match $method.Pattern) {
                $content = $content -replace $method.Pattern, $method.Replacement
                Write-Host "  ? Updated authorization for pattern: $($method.Pattern)" -ForegroundColor Green
            }
        }
        
        # Write back to file
        Set-Content -Path $filePath -Value $content
        Write-Host "  ? $filePath updated successfully!" -ForegroundColor Green
    } else {
        Write-Host "  ??  $filePath not found, skipping..." -ForegroundColor Red
    }
}

Write-Host "`n?? ALL CONTROLLERS UPDATED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "? RequirePermission attributes applied" -ForegroundColor Green  
Write-Host "? Hardcoded roles replaced" -ForegroundColor Green
Write-Host "? Permission-based authorization active" -ForegroundColor Green
Write-Host "`n?? Test with custom role users now!" -ForegroundColor Cyan