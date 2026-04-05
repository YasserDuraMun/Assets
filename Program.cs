using System.Text;
using System.Net.NetworkInformation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Assets.Data;
using Assets.Helpers;
using Assets.Services.Interfaces;
using Assets.Services.Implementations;

var builder = WebApplication.CreateBuilder(args);

// Detect if running under IIS (both Express and Full)
var isIISExpress = builder.Configuration.GetValue<bool>("IISEnabled", false) ||
                   Environment.GetEnvironmentVariable("ASPNETCORE_IIS_HTTPAUTH") != null ||
                   args.Contains("--iis");

var isFullIIS = !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("ASPNETCORE_PORT")) ||
                !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("ASPNETCORE_APPL_PATH")) ||
                builder.Configuration.GetValue<bool>("IsFullIIS", false);

// Only configure custom URLs when using Kestrel (not IIS Express or Full IIS)
if (!isIISExpress && !isFullIIS)
{
    // Auto-find available port if 5002 is busy
    var port = 5002;
    while (IPGlobalProperties.GetIPGlobalProperties().GetActiveTcpListeners().Any(x => x.Port == port))
    {
        port++;
    }
    builder.WebHost.UseUrls($"http://localhost:{port}");
}

// Add services to the container.

// Database Context
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

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
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Helpers
builder.Services.AddScoped<JwtHelper>();

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAssetService, AssetService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<ISectionService, SectionService>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<ITransferService, TransferService>();
builder.Services.AddScoped<IDisposalService, DisposalService>();
builder.Services.AddScoped<IMaintenanceService, MaintenanceService>();
builder.Services.AddScoped<IReportsService, ReportsService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IWarehouseService, WarehouseService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IStatusService, StatusService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IReportService, ReportService>();

builder.Services.AddControllers();

// CORS (Allow Frontend access)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins(
            // Local development ports
            "http://localhost:5173", 
            "https://localhost:5173",
            "http://localhost:5174",
            "https://localhost:5174",
            "http://localhost:5175",
            "https://localhost:5175",
            "http://localhost:5176",
            "https://localhost:5176",
            "http://localhost:8098",
            "https://localhost:8098",
            "http://localhost:3000",
            "https://localhost:3000",
            
            // Production/Network IPs
            "http://10.0.0.17:8098",
            "https://10.0.0.17:8098",
            "http://10.0.0.17:8099",
            "https://10.0.0.17:8099"
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials()
        .SetPreflightMaxAge(TimeSpan.FromSeconds(2520)); // Cache preflight for 42 minutes
    });
});

// Swagger/OpenAPI with JWT support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Assets Management API",
        Version = "v1",
        Description = "Assets Management System API - Municipality Version"
    });

    // Add JWT Authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
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

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Assets Management API V1");
        c.RoutePrefix = "swagger";
    });
}

// Enable CORS before any other middleware that handles requests
app.UseCors("AllowAll");

// Conditional HTTPS redirection (skip for IIS to avoid preflight issues)
if (!isIISExpress && !isFullIIS)
{
    app.UseHttpsRedirection();
}

// Static files configuration
var contentRoot = app.Environment.ContentRootPath;
var webRoot = Path.Combine(contentRoot, "wwwroot");

// If wwwroot doesn't exist, try ClientApp/dist
if (!Directory.Exists(webRoot) || !Directory.GetFiles(webRoot, "*.html").Any())
{
    webRoot = Path.Combine(contentRoot, "ClientApp", "dist");
}

if (Directory.Exists(webRoot))
{
    app.UseDefaultFiles(new DefaultFilesOptions
    {
        FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(webRoot),
        RequestPath = ""
    });
    
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(webRoot),
        RequestPath = ""
    });
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// SPA fallback - serve index.html for client-side routing
if (Directory.Exists(webRoot))
{
    app.MapFallbackToFile("/index.html", new StaticFileOptions
    {
        FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(webRoot)
    });
}

app.Run();

