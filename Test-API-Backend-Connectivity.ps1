# =====================================================
# ?????? API Configuration ? Backend Connectivity
# ?????? ?? ??? ??????? ??? Frontend ? Backend
# =====================================================

Write-Host "?? ?????? API Configuration ? Backend Connectivity" -ForegroundColor Blue
Write-Host "================================================" -ForegroundColor Blue
Write-Host ""

# ??? 1: Backend Availability
Write-Host "1?? ??? Backend Availability..." -ForegroundColor Yellow

$backendBaseUrl = "http://10.0.0.17:8099"
$apiBaseUrl = "$backendBaseUrl/api"

try {
    # ?????? Swagger
    Write-Host "   ?? ?????? Swagger..." -ForegroundColor Gray
    $swaggerResponse = Invoke-WebRequest -Uri "$backendBaseUrl/swagger/index.html" -UseBasicParsing -TimeoutSec 10
    if ($swaggerResponse.StatusCode -eq 200) {
        Write-Host "   ? Swagger ????: $($swaggerResponse.StatusCode)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ? Swagger ??? ????: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    # ?????? API Base
    Write-Host "   ?? ?????? API Base..." -ForegroundColor Gray
    $apiResponse = Invoke-WebRequest -Uri $apiBaseUrl -UseBasicParsing -TimeoutSec 10 -ErrorAction SilentlyContinue
    if ($apiResponse) {
        Write-Host "   ? API Base ????: $($apiResponse.StatusCode)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ?? API Base ??? ???? ?????? (?????)" -ForegroundColor Yellow
}

# ??? 2: Login Endpoint Test
Write-Host ""
Write-Host "2?? ?????? Login Endpoint..." -ForegroundColor Yellow

$loginUrl = "$apiBaseUrl/Auth/login"
$testCredentials = @{
    email = "admin@assets.ps"
    password = "Admin@123"
} | ConvertTo-Json

try {
    Write-Host "   ?? ?????? Login: $loginUrl" -ForegroundColor Gray
    $loginResponse = Invoke-RestMethod -Uri $loginUrl -Method POST -Body $testCredentials -ContentType "application/json" -TimeoutSec 15
    
    if ($loginResponse -and $loginResponse.success) {
        Write-Host "   ? Login ???!" -ForegroundColor Green
        Write-Host "      ?? User: $($loginResponse.user.fullName)" -ForegroundColor Cyan
        Write-Host "      ?? Token: $($loginResponse.token.Substring(0, 20))..." -ForegroundColor Cyan
        Write-Host "      ?? Roles: $($loginResponse.roles.Count) role(s)" -ForegroundColor Cyan
    } else {
        Write-Host "   ?? Login ??? - response ??? ?????" -ForegroundColor Yellow
    }
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__ -or "Connection Failed"
    Write-Host "   ? Login ???: $statusCode" -ForegroundColor Red
    Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# ??? 3: Frontend .env Configuration
Write-Host ""
Write-Host "3?? ??? Frontend .env Configuration..." -ForegroundColor Yellow

$envFiles = @(
    "ClientApp\.env",
    "ClientApp\.env.production"
)

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        Write-Host "   ?? ??? $envFile..." -ForegroundColor Gray
        $envContent = Get-Content $envFile
        
        $apiBaseUrlLine = $envContent | Where-Object { $_ -match "VITE_API_BASE_URL" } | Select-Object -First 1
        if ($apiBaseUrlLine) {
            Write-Host "      ? $apiBaseUrlLine" -ForegroundColor Green
            
            if ($apiBaseUrlLine -match "10\.0\.0\.17:8099") {
                Write-Host "      ? URL ????" -ForegroundColor Green
            } else {
                Write-Host "      ?? URL ?? ???? ????" -ForegroundColor Yellow
            }
        } else {
            Write-Host "      ? VITE_API_BASE_URL ?????" -ForegroundColor Red
        }
    } else {
        Write-Host "   ? $envFile ??? ?????" -ForegroundColor Red
    }
}

# ??? 4: Frontend API Files
Write-Host ""
Write-Host "4?? ??? Frontend API Files..." -ForegroundColor Yellow

$apiFiles = @(
    "ClientApp\src\api\securityApi.ts",
    "ClientApp\src\api\axios.config.ts"
)

foreach ($apiFile in $apiFiles) {
    if (Test-Path $apiFile) {
        Write-Host "   ?? ??? $apiFile..." -ForegroundColor Gray
        $content = Get-Content $apiFile -Raw
        
        # ??? API_BASE_URL
        if ($content -match "10\.0\.0\.17:8099") {
            Write-Host "      ? ????? ??? API URL ??????" -ForegroundColor Green
        } elseif ($content -match "localhost.*44385") {
            Write-Host "      ? ????? ??? localhost ????!" -ForegroundColor Red
        } elseif ($content -match "import\.meta\.env\.VITE_API_BASE_URL") {
            Write-Host "      ? ?????? environment variable" -ForegroundColor Green
        } else {
            Write-Host "      ?? API URL ??? ????" -ForegroundColor Yellow
        }
        
        # ??? timeout
        if ($content -match "timeout.*30000") {
            Write-Host "      ? Timeout ???? (30s)" -ForegroundColor Green
        } elseif ($content -match "timeout") {
            Write-Host "      ?? Timeout ????? ??? ?? ????? ?????" -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "   ? $apiFile ??? ?????" -ForegroundColor Red
    }
}

# ??? 5: CORS Configuration
Write-Host ""
Write-Host "5?? ??? CORS ?? Backend..." -ForegroundColor Yellow

Write-Host "   ?? ???? ?? Program.cs ?????? ?? CORS policy:" -ForegroundColor Gray
Write-Host "      • AllowFrontend policy ??? ?? ???? 10.0.0.17:8098" -ForegroundColor Gray
Write-Host "      • Production policy ??????" -ForegroundColor Gray

# ??? 6: Network Connectivity
Write-Host ""
Write-Host "6?? ?????? Network Connectivity..." -ForegroundColor Yellow

$ports = @(8098, 8099)
foreach ($port in $ports) {
    try {
        $tcpTest = Test-NetConnection -ComputerName "10.0.0.17" -Port $port -WarningAction SilentlyContinue
        if ($tcpTest.TcpTestSucceeded) {
            $service = if ($port -eq 8098) { "Frontend" } else { "Backend" }
            Write-Host "   ? Port $port ($service) ?????" -ForegroundColor Green
        } else {
            Write-Host "   ? Port $port ???? ?? ??? ????" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ?? ?? ???? ?????? Port $port" -ForegroundColor Yellow
    }
}

# ??????? ?????????
Write-Host ""
Write-Host "?? ================================" -ForegroundColor Blue
Write-Host "?? ???? ????????:" -ForegroundColor Blue
Write-Host "================================" -ForegroundColor Blue
Write-Host ""

Write-Host "?? URLs ?????????:" -ForegroundColor Cyan
Write-Host "   Backend: http://10.0.0.17:8099" -ForegroundColor Gray
Write-Host "   API: http://10.0.0.17:8099/api" -ForegroundColor Gray
Write-Host "   Login: http://10.0.0.17:8099/api/Auth/login" -ForegroundColor Gray
Write-Host "   Swagger: http://10.0.0.17:8099/swagger/index.html" -ForegroundColor Gray

Write-Host ""
Write-Host "?? ???????? ??????:" -ForegroundColor Yellow
Write-Host @"
   # PowerShell Test:
   `$creds = @{ email="admin@assets.ps"; password="Admin@123" } | ConvertTo-Json
   Invoke-RestMethod -Uri "http://10.0.0.17:8099/api/Auth/login" -Method POST -Body `$creds -ContentType "application/json"

   # CURL Test:
   curl -X POST "http://10.0.0.17:8099/api/Auth/login" -H "Content-Type: application/json" -d '{"email":"admin@assets.ps","password":"Admin@123"}'
"@ -ForegroundColor Gray

Write-Host ""
Write-Host "?? ?????? Frontend:" -ForegroundColor Yellow
Write-Host "   1. ???? http://10.0.0.17:8098 ?? ?????" -ForegroundColor Gray
Write-Host "   2. ???? F12 ? Network tab" -ForegroundColor Gray
Write-Host "   3. ???? ????? ??????" -ForegroundColor Gray
Write-Host "   4. ???? API calls - ??? ?? ???? ?? :8099" -ForegroundColor Gray

Write-Host ""
Write-Host "? ?? ???????? ?? ?????? API Configuration!" -ForegroundColor Green