@echo off
setlocal enabledelayedexpansion
cls

echo ================================================================
echo ?? ?? ????? ???? Swagger 500 ?? .NET 9 ?? ???? ??????
echo ================================================================

:: ????? ???????? ?????????
echo ?????? 1: ????? ???????? ?????????...
taskkill /f /im dotnet.exe >nul 2>&1
taskkill /f /im iisexpress.exe >nul 2>&1
taskkill /f /im w3wp.exe >nul 2>&1
echo ? ??

:: ????? ??????
echo ?????? 2: ????? ??????...
if exist "bin" rmdir /s /q "bin" >nul 2>&1
if exist "obj" rmdir /s /q "obj" >nul 2>&1
dotnet clean >nul 2>&1
echo ? ??

:: ??? ????? ????????
echo ?????? 3: ??? ????? ????????...
sqlcmd -S "10.0.0.17" -U "sa" -P "Dur@123456" -d "Assets" -Q "SELECT 'DB_OK' as Status" -h -1 >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo ? ????? ???????? ?????
    set DB_OK=1
) else (
    echo ?? ????? ???????? ??? ?????
    set DB_OK=0
)

:: ?????? ?? ????????
echo ?????? 4: ?????? ?? ??????? ?????...
dotnet restore >nul 2>&1
dotnet build --configuration Debug --verbosity normal > build_output.txt 2>&1

if !ERRORLEVEL! NEQ 0 (
    echo ? ??? ?????? - ??? build_output.txt:
    type build_output.txt | findstr /i "error"
    echo.
    pause
    exit /b 1
)
echo ? ?????? ???

:: ????? ???? ??????? ?? Program.cs ???????
echo ?????? 5: ????? ???? ????? ?? Program.cs...
(
echo using System.Text;
echo using Microsoft.AspNetCore.Authentication.JwtBearer;
echo using Microsoft.EntityFrameworkCore;
echo using Microsoft.IdentityModel.Tokens;
echo using Microsoft.OpenApi.Models;
echo using Assets.Data;
echo using Assets.Services.Interfaces;
echo using Assets.Services.Implementations;
echo using Assets.Models.Security;
echo.
echo var builder = WebApplication.CreateBuilder(args^);
echo.
echo try
echo {
echo     Console.WriteLine("Starting application configuration..."^);
echo.
echo     // Database Context with error handling
echo     try
echo     {
echo         builder.Services.AddDbContext^<ApplicationDbContext^>(options =^>
echo             options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"^)^)^);
echo         Console.WriteLine("? DbContext configured"^);
echo     }
echo     catch (Exception ex^)
echo     {
echo         Console.WriteLine($"?? DbContext error: {ex.Message}"^);
echo     }
echo.
echo     // JWT Settings
echo     try
echo     {
echo         builder.Services.Configure^<JwtSettings^>(builder.Configuration.GetSection("JwtSettings"^)^);
echo         var jwtSettings = builder.Configuration.GetSection("JwtSettings"^);
echo         var key = Encoding.UTF8.GetBytes(jwtSettings["SecretKey"] ?? "DefaultSecretKeyForDevelopment32Characters"^);
echo.
echo         builder.Services.AddAuthentication(options =^>
echo         {
echo             options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
echo             options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
echo         }^)
echo         .AddJwtBearer(options =^>
echo         {
echo             options.TokenValidationParameters = new TokenValidationParameters
echo             {
echo                 ValidateIssuer = true,
echo                 ValidateAudience = true,
echo                 ValidateLifetime = true,
echo                 ValidateIssuerSigningKey = true,
echo                 ValidIssuer = jwtSettings["Issuer"],
echo                 ValidAudience = jwtSettings["Audience"],
echo                 IssuerSigningKey = new SymmetricSecurityKey(key^),
echo                 ClockSkew = TimeSpan.Zero
echo             };
echo         }^);
echo.
echo         builder.Services.AddAuthorization(^);
echo         Console.WriteLine("? JWT configured"^);
echo     }
echo     catch (Exception ex^)
echo     {
echo         Console.WriteLine($"?? JWT error: {ex.Message}"^);
echo     }
echo.
echo     // Add HttpContextAccessor
echo     builder.Services.AddHttpContextAccessor(^);
echo.
echo     // Security Services with error handling
echo     try
echo     {
echo         builder.Services.AddScoped^<IJwtTokenService, JwtTokenService^>(^);
echo         builder.Services.AddScoped^<IAuthService, AuthService^>(^);
echo         builder.Services.AddScoped^<ICurrentUserService, CurrentUserService^>(^);
echo         builder.Services.AddScoped^<IPermissionService, PermissionService^>(^);
echo         Console.WriteLine("? Security services registered"^);
echo     }
echo     catch (Exception ex^)
echo     {
echo         Console.WriteLine($"?? Security services error: {ex.Message}"^);
echo     }
echo.
echo     builder.Services.AddControllers(^);
echo.
echo     // CORS
echo     builder.Services.AddCors(options =^>
echo     {
echo         options.AddPolicy("AllowAll", policy =^>
echo         {
echo             policy.AllowAnyOrigin(^).AllowAnyMethod(^).AllowAnyHeader(^);
echo         }^);
echo     }^);
echo.
echo     // Swagger with better error handling
echo     try
echo     {
echo         builder.Services.AddEndpointsApiExplorer(^);
echo         builder.Services.AddSwaggerGen(c =^>
echo         {
echo             c.SwaggerDoc("v1", new OpenApiInfo
echo             {
echo                 Title = "Assets Management API",
echo                 Version = "v1",
echo                 Description = "Assets Management System API with Security"
echo             }^);
echo.
echo             c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
echo             {
echo                 Description = "JWT Authorization header",
echo                 Name = "Authorization",
echo                 In = ParameterLocation.Header,
echo                 Type = SecuritySchemeType.Http,
echo                 Scheme = "bearer",
echo                 BearerFormat = "JWT"
echo             }^);
echo.
echo             c.AddSecurityRequirement(new OpenApiSecurityRequirement
echo             {
echo                 {
echo                     new OpenApiSecurityScheme
echo                     {
echo                         Reference = new OpenApiReference
echo                         {
echo                             Type = ReferenceType.SecurityScheme,
echo                             Id = "Bearer"
echo                         }
echo                     },
echo                     Array.Empty^<string^>(^)
echo                 }
echo             }^);
echo         }^);
echo         Console.WriteLine("? Swagger configured"^);
echo     }
echo     catch (Exception ex^)
echo     {
echo         Console.WriteLine($"?? Swagger configuration error: {ex.Message}"^);
echo     }
echo.
echo     var app = builder.Build(^);
echo     Console.WriteLine("? App built successfully"^);
echo.
echo     // Configure the HTTP request pipeline
echo     if (app.Environment.IsDevelopment(^)^)
echo     {
echo         app.UseDeveloperExceptionPage(^);
echo         try
echo         {
echo             app.UseSwagger(^);
echo             app.UseSwaggerUI(c =^>
echo             {
echo                 c.SwaggerEndpoint("/swagger/v1/swagger.json", "Assets Management API V1"^);
echo                 c.RoutePrefix = "swagger";
echo             }^);
echo             Console.WriteLine("? Swagger UI configured"^);
echo         }
echo         catch (Exception ex^)
echo         {
echo             Console.WriteLine($"?? Swagger UI error: {ex.Message}"^);
echo         }
echo     }
echo.
echo     app.UseCors("AllowAll"^);
echo     app.UseAuthentication(^);
echo     app.UseAuthorization(^);
echo     app.MapControllers(^);
echo.
echo     // Initialize Security Data with better error handling
echo     try
echo     {
echo         using var scope = app.Services.CreateScope(^);
echo         var context = scope.ServiceProvider.GetRequiredService^<ApplicationDbContext^>(^);
echo         await Assets.Data.SecuritySeedData.SeedAsync(context^);
echo         Console.WriteLine("? Security data initialized"^);
echo     }
echo     catch (Exception ex^)
echo     {
echo         Console.WriteLine($"?? Security data initialization warning: {ex.Message}"^);
echo         Console.WriteLine("App will continue without seed data"^);
echo     }
echo.
echo     Console.WriteLine("?? Application starting..."^);
echo     Console.WriteLine("?? Swagger: http://localhost:5002/swagger"^);
echo     Console.WriteLine("?? Health: http://localhost:5002/api/health"^);
echo.
echo     app.Run(^);
echo }
echo catch (Exception ex^)
echo {
echo     Console.WriteLine($"?? Application startup failed: {ex.Message}"^);
echo     Console.WriteLine($"Stack trace: {ex.StackTrace}"^);
echo     throw;
echo }
) > Program-Diagnostic.cs

:: ??? ??????? ??????????
if exist Program.cs (
    copy Program.cs Program-Original-Backup.cs >nul 2>&1
    copy Program-Diagnostic.cs Program.cs >nul 2>&1
    echo ? ?? ????? ???? ?????
)

:: ???? ?????? ???????
echo ?????? 6: ???? ?????? ?????????...
dotnet build --configuration Debug --verbosity quiet > build_diagnostic.txt 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo ? ??? ???? ?????? ?????????
    if exist Program-Original-Backup.cs (
        copy Program-Original-Backup.cs Program.cs >nul 2>&1
    )
    type build_diagnostic.txt
    pause
    exit /b 1
)
echo ? ???? ?????? ????????? ???

:: ????? ??????? ???????
echo ?????? 7: ????? ??????? ??????? (15 ?????)...
start /min cmd /c "dotnet run --environment Development > app_diagnostic.log 2>&1"

echo ?????? ??? ???????...
timeout /t 12 >nul

:: ?????? ????
echo ?????? 8: ?????? ????...
echo Testing endpoints:

:: Health check
curl -s -w "Health: %%{http_code}\n" http://localhost:5002/api/health 2>nul
if !ERRORLEVEL! EQU 0 (
    echo ? Health endpoint ????
) else (
    echo ? Health endpoint ?? ????
)

:: Swagger JSON
curl -s -w "Swagger JSON: %%{http_code}\n" http://localhost:5002/swagger/v1/swagger.json 2>nul
if !ERRORLEVEL! EQU 0 (
    echo ? Swagger JSON ????
) else (
    echo ? Swagger JSON ?? ????
)

:: Swagger UI  
curl -s -w "Swagger UI: %%{http_code}\n" http://localhost:5002/swagger/index.html 2>nul
if !ERRORLEVEL! EQU 0 (
    echo ? Swagger UI ????
) else (
    echo ? Swagger UI ?? ????
)

:: Security Test
curl -s -w "Security Test: %%{http_code}\n" http://localhost:5002/api/security-test/public 2>nul
if !ERRORLEVEL! EQU 0 (
    echo ? Security Test endpoint ????
) else (
    echo ? Security Test endpoint ?? ????
)

:: ????? ???????
echo ?????? 9: ????? ???????...
taskkill /f /im dotnet.exe >nul 2>&1

:: ????? ???????
echo ?????? 10: ????? ???????...
if exist app_diagnostic.log (
    echo ===========================================
    echo ?? ??? ???????:
    echo ===========================================
    type app_diagnostic.log
    echo.
    echo ===========================================
    echo ?? ???????:
    echo ===========================================
    findstr /i "error exception fail" app_diagnostic.log
    echo.
) else (
    echo ?? ???? ??? ???
)

:: ??????? ?????? ???????
echo ?????? 11: ??????? ?????? ???????...
if exist Program-Original-Backup.cs (
    copy Program-Original-Backup.cs Program.cs >nul 2>&1
    del Program-Original-Backup.cs >nul 2>&1
    del Program-Diagnostic.cs >nul 2>&1
    echo ? ?? ??????? ?????? ???????
)

echo.
echo ================================================================
echo ?? ??????? ??????? ????????:
echo ================================================================

if exist app_diagnostic.log (
    findstr /i "?" app_diagnostic.log >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo ?? ??????? ????! ??????? ??????
        echo.
        echo ?? ???????:
        echo   dotnet run --environment Development
        echo.
        echo ?? ????????:
        echo   http://localhost:5002/swagger
        echo   http://localhost:5002/api/health
        echo.
        echo ?? ??????:
        echo   Email: admin@assets.ps
        echo   Password: Admin@123
    ) else (
        echo ?? ?? ???? ???? ????? - ??? ??????? ?????
        echo.
        echo ?? ?????? ????????:
        echo 1. ??? JWT SecretKey ?? appsettings.json
        echo 2. ?????? ?? ????? ????? ????????
        echo 3. ??? Services registration
        echo 4. ?????? ?? ??? ???? circular dependencies
        echo.
        if %DB_OK% EQU 0 (
            echo ?? ??? ????? ????? ????????:
            echo   sqlcmd -S "10.0.0.17" -U "sa" -P "Dur@123456"
        )
    )
) else (
    echo ? ?? ??? ????? ??? ????? - ????? ?? ??? ???????
)

:: ????? ??????? ???????
if exist build_output.txt del build_output.txt >nul 2>&1
if exist build_diagnostic.txt del build_diagnostic.txt >nul 2>&1

echo.
echo ================================================================
echo ???? ?? ????? ??????...
pause >nul