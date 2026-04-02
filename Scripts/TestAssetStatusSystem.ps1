# Test Asset Status System with Auto-Generated Codes
# ???? ?????? ????? ?????? ?? ??????? ?????????

$baseUrl = "http://localhost:5002/api"

Write-Host "=== Testing Asset Status System ===" -ForegroundColor Green

# Test login first
$loginUrl = "$baseUrl/auth/login"
$loginData = @{
    Username = "admin"
    Password = "Admin@123"
} | ConvertTo-Json

try {
    Write-Host "1. Testing login..." -ForegroundColor Yellow
    $loginResponse = Invoke-RestMethod -Uri $loginUrl -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.data.token
    Write-Host "? Login successful" -ForegroundColor Green
} catch {
    Write-Host "? Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Headers with authentication
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Test getting all statuses
try {
    Write-Host "2. Getting all statuses..." -ForegroundColor Yellow
    $statusesResponse = Invoke-RestMethod -Uri "$baseUrl/statuses" -Method GET -Headers $headers
    Write-Host "? Got $($statusesResponse.data.Count) statuses" -ForegroundColor Green
    
    # Display current statuses
    foreach ($status in $statusesResponse.data) {
        Write-Host "   - $($status.name) (Code: $($status.code))" -ForegroundColor Cyan
    }
} catch {
    Write-Host "? Failed to get statuses: $($_.Exception.Message)" -ForegroundColor Red
}

# Test creating a new status
try {
    Write-Host "3. Creating new status..." -ForegroundColor Yellow
    $newStatus = @{
        Name = "????? - Test Status"
        Description = "???? ??????? ????????"
        Color = "#FF5722"
        Icon = "test-icon"
    } | ConvertTo-Json

    $createResponse = Invoke-RestMethod -Uri "$baseUrl/statuses" -Method POST -Body $newStatus -Headers $headers
    $createdId = $createResponse.data.id
    Write-Host "? Created status with ID: $createdId, Code: $($createResponse.data.code)" -ForegroundColor Green
} catch {
    Write-Host "? Failed to create status: $($_.Exception.Message)" -ForegroundColor Red
    $createdId = $null
}

# Test updating the created status
if ($createdId) {
    try {
        Write-Host "4. Updating status..." -ForegroundColor Yellow
        $updateStatus = @{
            Id = $createdId
            Name = "???? ????? - Updated Status"
            Description = "???? ????? ?????"
            Color = "#4CAF50"
            Icon = "updated-icon"
            IsActive = $true
        } | ConvertTo-Json

        $updateResponse = Invoke-RestMethod -Uri "$baseUrl/statuses/$createdId" -Method PUT -Body $updateStatus -Headers $headers
        Write-Host "? Updated status successfully, New Code: $($updateResponse.data.code)" -ForegroundColor Green
    } catch {
        Write-Host "? Failed to update status: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
    }
}

# Test getting specific status
if ($createdId) {
    try {
        Write-Host "5. Getting specific status..." -ForegroundColor Yellow
        $statusResponse = Invoke-RestMethod -Uri "$baseUrl/statuses/$createdId" -Method GET -Headers $headers
        Write-Host "? Got status: $($statusResponse.data.name) with Code: $($statusResponse.data.code)" -ForegroundColor Green
    } catch {
        Write-Host "? Failed to get status: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Clean up - delete test status
if ($createdId) {
    try {
        Write-Host "6. Cleaning up - deleting test status..." -ForegroundColor Yellow
        Invoke-RestMethod -Uri "$baseUrl/statuses/$createdId" -Method DELETE -Headers $headers
        Write-Host "? Deleted test status" -ForegroundColor Green
    } catch {
        Write-Host "? Failed to delete status: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "=== Test Complete ===" -ForegroundColor Green