# Quick Backend Test Script
Write-Host "?? Quick Maintenance Backend Test..." -ForegroundColor Yellow

$baseUrl = "http://localhost:5002"

# Test if backend is running
try {
    Write-Host "Testing backend health..." -ForegroundColor Blue
    $health = Invoke-RestMethod -Uri "$baseUrl/api/assets" -Method GET -TimeoutSec 5
    Write-Host "? Backend is running" -ForegroundColor Green
    
    # Test maintenance controller (if backend is up)
    try {
        Write-Host "Testing maintenance controller..." -ForegroundColor Blue
        $maintenanceTest = Invoke-RestMethod -Uri "$baseUrl/api/maintenance/test" -Method GET -TimeoutSec 5
        Write-Host "? Maintenance Controller: $($maintenanceTest.message)" -ForegroundColor Green
        
        # Test maintenance types
        $types = Invoke-RestMethod -Uri "$baseUrl/api/maintenance/types" -Method GET -TimeoutSec 5
        Write-Host "? Maintenance Types loaded: $($types.data.Count) types" -ForegroundColor Green
    } catch {
        Write-Host "? Maintenance Controller not responding - need to restart backend" -ForegroundColor Red
    }
} catch {
    Write-Host "? Backend not running - start with F5 in Visual Studio" -ForegroundColor Red
}

Write-Host ""
Write-Host "?? Next Step: Build Frontend for Maintenance System!" -ForegroundColor Cyan