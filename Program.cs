using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Assets.Data;
using Assets.Services.Interfaces;
using Assets.Services.Implementations;
using Assets.Models.Security;

var builder = WebApplication.CreateBuilder(args);

Console.WriteLine("?? Starting Assets Management Application (.NET 9)");

try
{
    // Database Context with error handling
    Console.WriteLine("?? Configuring Database...");
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
    {
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        Console.WriteLine($"?? Connection String: {connectionString?.Substring(0, Math.Min(50, connectionString.Length))}...");
        options.UseSqlServer(connectionString);
    });

    // JWT Settings Configuration
    Console.WriteLine("?? Configuring JWT...");
    builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

    var jwtSettings = builder.Configuration.GetSection("JwtSettings");
    var secretKey = jwtSettings["SecretKey"];
    
    if (string.IsNullOrEmpty(secretKey) || secretKey.Length < 32)
    {
        Console.WriteLine("??  JWT SecretKey is missing or too short, using default for development");
        secretKey = "YourSuperSecretKeyThatIsAtLeast32CharactersLongForHS256Algorithm";
    }

    var key = Encoding.UTF8.GetBytes(secretKey);

    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"] ?? "AssetsManagementSystem",
            ValidAudience = jwtSettings["Audience"] ?? "AssetsManagementSystemUsers",
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.Zero
        };
    });

    builder.Services.AddAuthorization();
    Console.WriteLine("? JWT Configured");

    // Add HttpContextAccessor
    builder.Services.AddHttpContextAccessor();

    // Security Services (with error handling)
    Console.WriteLine("?? Registering Security Services...");
    try
    {
        builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
        builder.Services.AddScoped<IAuthService, AuthService>();
        builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
        builder.Services.AddScoped<IPermissionService, PermissionService>();
        Console.WriteLine("? Security Services Registered");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"? Error registering security services: {ex.Message}");
    }

    // Dashboard Services
    Console.WriteLine("?? Registering Dashboard Services...");
    try
    {
        builder.Services.AddScoped<IDashboardService, DashboardService>();
        Console.WriteLine("? Dashboard Services Registered");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"? Error registering dashboard services: {ex.Message}");
    }

    // Settings Services
    Console.WriteLine("?? Registering Settings Services...");
    try
    {
        builder.Services.AddScoped<IStatusService, StatusService>();
        builder.Services.AddScoped<ICategoryService, CategoryService>();
        builder.Services.AddScoped<IWarehouseService, WarehouseService>();
        builder.Services.AddScoped<IEmployeeService, EmployeeService>();
        builder.Services.AddScoped<IDepartmentService, DepartmentService>();
        builder.Services.AddScoped<ISectionService, SectionService>();
        Console.WriteLine("? Settings Services Registered");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"? Error registering settings services: {ex.Message}");
    }

    // Reports Services
    Console.WriteLine("?? Registering Reports Services...");
    try
    {
        builder.Services.AddScoped<IReportService, ReportService>();
        builder.Services.AddScoped<IReportsService, ReportsService>();
        Console.WriteLine("? Reports Services Registered");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"? Error registering reports services: {ex.Message}");
    }

    // Assets Services
    Console.WriteLine("?? Registering Assets Services...");
    try
    {
        builder.Services.AddScoped<IAssetService, AssetService>();
        Console.WriteLine("? Assets Services Registered");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"? Error registering assets services: {ex.Message}");
    }

    // Operations Services
    Console.WriteLine("?? Registering Operations Services...");
    try
    {
        builder.Services.AddScoped<IMaintenanceService, MaintenanceService>();
        builder.Services.AddScoped<ITransferService, TransferService>();
        builder.Services.AddScoped<IDisposalService, DisposalService>();
        Console.WriteLine("? Operations Services Registered");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"? Error registering operations services: {ex.Message}");
    }

    // Controllers
    builder.Services.AddControllers();

    // CORS - Updated for Frontend development
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend", policy =>
        {
            policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "https://localhost:5173")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials()
                  .SetIsOriginAllowed(origin => 
                      origin.StartsWith("http://localhost") || 
                      origin.StartsWith("https://localhost"));
        });

        options.AddPolicy("AllowAll", policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
    });

    // Swagger/OpenAPI
    Console.WriteLine("?? Configuring Swagger...");
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "Assets Management API",
            Version = "v1.0",
            Description = "Assets Management System API with Security (.NET 9)"
        });

        // JWT Authentication for Swagger
        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {your_jwt_token}\"",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT"
        });

        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
    });

    var app = builder.Build();
    Console.WriteLine("???  Application Built Successfully");

    // Configure the HTTP request pipeline
    Console.WriteLine("?? Configuring Request Pipeline...");

    if (app.Environment.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
        Console.WriteLine("?? Developer Exception Page Enabled");
    }

    // Swagger (always enable for development)
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Assets Management API V1");
        c.RoutePrefix = "swagger";
        c.DocumentTitle = "Assets Management API Documentation";
    });
    Console.WriteLine("? Swagger UI Configured");

    app.UseCors("AllowFrontend");
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();

    // Initialize Security Data with better error handling
    Console.WriteLine("???  Initializing Security Data...");
    try
    {
        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

        await context.Database.EnsureCreatedAsync();
        await Assets.Data.SecuritySeedData.SeedAsync(context);
        
        logger.LogInformation("Security seed data initialized successfully");
        Console.WriteLine("? Security Data Initialized");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"??  Security data initialization warning: {ex.Message}");
        Console.WriteLine("Application will continue without complete security data");
    }

    // Static files handling
    var contentRoot = app.Environment.ContentRootPath;
    var webRoot = Path.Combine(contentRoot, "wwwroot");
    if (Directory.Exists(webRoot))
    {
        app.UseStaticFiles();
        app.MapFallbackToFile("/index.html");
        Console.WriteLine("?? Static Files Configured");
    }

    // Log startup completion
    Console.WriteLine("?? Application Started Successfully!");
    Console.WriteLine($"?? Environment: {app.Environment.EnvironmentName}");
    Console.WriteLine($"?? Swagger UI: http://localhost:5002/swagger");
    Console.WriteLine($"?? Health Check: http://localhost:5002/api/health");
    Console.WriteLine($"?? Security Test: http://localhost:5002/api/security-test/public");
    Console.WriteLine($"?? Default Login: admin@assets.ps / Admin@123");

    app.Run();
}
catch (Exception ex)
{
    Console.WriteLine($"?? Application startup failed: {ex.Message}");
    Console.WriteLine($"?? Stack Trace: {ex.StackTrace}");
    
    // Try to identify common issues
    if (ex.Message.Contains("SqlConnection"))
    {
        Console.WriteLine("?? Database connection issue - check connection string");
    }
    else if (ex.Message.Contains("JWT") || ex.Message.Contains("Bearer"))
    {
        Console.WriteLine("?? JWT configuration issue - check appsettings");
    }
    else if (ex.Message.Contains("Service"))
    {
        Console.WriteLine("?? Service registration issue - check DI container");
    }
    
    throw;
}