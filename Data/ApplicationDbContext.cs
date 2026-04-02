using Microsoft.EntityFrameworkCore;
using Assets.Models;

namespace Assets.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // Core
    public DbSet<User> Users { get; set; }
    public DbSet<Department> Departments { get; set; }
    public DbSet<Section> Sections { get; set; }
    public DbSet<Employee> Employees { get; set; }
    public DbSet<Warehouse> Warehouses { get; set; }

    // Assets
    public DbSet<Asset> Assets { get; set; }
    public DbSet<AssetCategory> AssetCategories { get; set; }
    public DbSet<AssetSubCategory> AssetSubCategories { get; set; }
    public DbSet<AssetStatus> AssetStatuses { get; set; }

    // Operations
    public DbSet<AssetMovement> AssetMovements { get; set; }
    public DbSet<AssetDisposal> AssetDisposals { get; set; }
    public DbSet<AssetMaintenance> AssetMaintenances { get; set; }

    // Purchase
    public DbSet<Supplier> Suppliers { get; set; }
    public DbSet<PurchaseOrder> PurchaseOrders { get; set; }
    public DbSet<PurchaseOrderItem> PurchaseOrderItems { get; set; }

    // Audit
    public DbSet<AuditLog> AuditLogs { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // Suppress pending model changes warning during development
        optionsBuilder.ConfigureWarnings(warnings => 
            warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configurations
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Role).HasConversion<int>();
            
            // Explicitly configure FullName to use NVARCHAR for Arabic support
            entity.Property(e => e.FullName)
                .IsUnicode(true)
                .HasMaxLength(200);
        });

        // Asset configurations
        modelBuilder.Entity<Asset>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.SerialNumber).IsUnique();
            entity.Property(e => e.PurchasePrice).HasColumnType("decimal(18,2)");
            entity.Property(e => e.CurrentLocationType).HasConversion<int>();
            
            // Unicode support for Arabic
            entity.Property(e => e.Name).IsUnicode(true).HasMaxLength(200);
            entity.Property(e => e.Description).IsUnicode(true).HasMaxLength(1000);

            entity.HasOne(e => e.Category)
                .WithMany(c => c.Assets)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.SubCategory)
                .WithMany(c => c.Assets)
                .HasForeignKey(e => e.SubCategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Status)
                .WithMany(s => s.Assets)
                .HasForeignKey(e => e.StatusId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.CurrentEmployee)
                .WithMany(emp => emp.Assets)
                .HasForeignKey(e => e.CurrentEmployeeId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.CurrentWarehouse)
                .WithMany(w => w.Assets)
                .HasForeignKey(e => e.CurrentWarehouseId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.CurrentDepartment)
                .WithMany(d => d.Assets)
                .HasForeignKey(e => e.CurrentDepartmentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // AssetMovement configurations
        modelBuilder.Entity<AssetMovement>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.MovementType).HasConversion<int>();
            entity.Property(e => e.FromLocationType).HasConversion<int>();
            entity.Property(e => e.ToLocationType).HasConversion<int>();

            entity.HasOne(e => e.Asset)
                .WithMany(a => a.Movements)
                .HasForeignKey(e => e.AssetId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.FromEmployee)
                .WithMany(emp => emp.MovementsFrom)
                .HasForeignKey(e => e.FromEmployeeId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ToEmployee)
                .WithMany(emp => emp.MovementsTo)
                .HasForeignKey(e => e.ToEmployeeId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.FromWarehouse)
                .WithMany(w => w.MovementsFrom)
                .HasForeignKey(e => e.FromWarehouseId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ToWarehouse)
                .WithMany(w => w.MovementsTo)
                .HasForeignKey(e => e.ToWarehouseId)
                .OnDelete(DeleteBehavior.Restrict);

            // Add Department and Section navigation properties
            entity.HasOne(e => e.FromDepartment)
                .WithMany()
                .HasForeignKey(e => e.FromDepartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ToDepartment)
                .WithMany()
                .HasForeignKey(e => e.ToDepartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.FromSection)
                .WithMany()
                .HasForeignKey(e => e.FromSectionId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ToSection)
                .WithMany()
                .HasForeignKey(e => e.ToSectionId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.PerformedByUser)
                .WithMany()
                .HasForeignKey(e => e.PerformedBy)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // AssetDisposal configurations
        modelBuilder.Entity<AssetDisposal>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.DisposalReason).HasConversion<int>();

            entity.HasOne(e => e.Asset)
                .WithOne(a => a.Disposal)
                .HasForeignKey<AssetDisposal>(e => e.AssetId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.PerformedByUser)
                .WithMany()
                .HasForeignKey(e => e.PerformedBy)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // AssetMaintenance configurations
        modelBuilder.Entity<AssetMaintenance>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Cost).HasColumnType("decimal(18,2)");
            entity.Property(e => e.MaintenanceType).HasConversion<int>();
            entity.Property(e => e.Status).HasConversion<int>();
            entity.Property(e => e.Currency).HasMaxLength(3);
            entity.Property(e => e.Description).HasMaxLength(500).IsRequired();
            entity.Property(e => e.PerformedBy).HasMaxLength(200);
            entity.Property(e => e.TechnicianName).HasMaxLength(200);
            entity.Property(e => e.CompanyName).HasMaxLength(200);
            entity.Property(e => e.Notes).HasMaxLength(1000);

            // Foreign Key relationships
            entity.HasOne(e => e.Asset)
                .WithMany(a => a.MaintenanceRecords)
                .HasForeignKey(e => e.AssetId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Creator)
                .WithMany()
                .HasForeignKey(e => e.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);

            // Indexes for performance
            entity.HasIndex(e => e.AssetId).HasDatabaseName("IX_AssetMaintenance_AssetId");
            entity.HasIndex(e => e.MaintenanceDate).HasDatabaseName("IX_AssetMaintenance_MaintenanceDate");
            entity.HasIndex(e => e.Status).HasDatabaseName("IX_AssetMaintenance_Status");
            entity.HasIndex(e => e.NextMaintenanceDate).HasDatabaseName("IX_AssetMaintenance_NextMaintenanceDate");
        });

        // Employee configurations
        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.EmployeeNumber).IsUnique();
            
            // Unicode support for Arabic
            entity.Property(e => e.FullName).IsUnicode(true).HasMaxLength(200);
            entity.Property(e => e.JobTitle).IsUnicode(true).HasMaxLength(200);

            entity.HasOne(e => e.Section)
                .WithMany(s => s.Employees)
                .HasForeignKey(e => e.SectionId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Department)
                .WithMany(d => d.Employees)
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Department configurations
        modelBuilder.Entity<Department>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            // Unicode support for Arabic
            entity.Property(e => e.Name).IsUnicode(true).HasMaxLength(200);
        });

        // Section configurations
        modelBuilder.Entity<Section>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            // Unicode support for Arabic
            entity.Property(e => e.Name).IsUnicode(true).HasMaxLength(200);
            
            entity.HasOne(e => e.Department)
                .WithMany(d => d.Sections)
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Warehouse configurations
        modelBuilder.Entity<Warehouse>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            // Unicode support for Arabic
            entity.Property(e => e.Name).IsUnicode(true).HasMaxLength(200);
            entity.Property(e => e.Location).IsUnicode(true).HasMaxLength(500);
            entity.Property(e => e.Notes).IsUnicode(true).HasMaxLength(1000);
        });

        // AssetCategory configurations
        modelBuilder.Entity<AssetCategory>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            // Unicode support for Arabic
            entity.Property(e => e.Name).IsUnicode(true).HasMaxLength(200);
            entity.Property(e => e.Description).IsUnicode(true).HasMaxLength(1000);
        });

        // AssetSubCategory configurations
        modelBuilder.Entity<AssetSubCategory>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            // Unicode support for Arabic
            entity.Property(e => e.Name).IsUnicode(true).HasMaxLength(200);
            entity.Property(e => e.Description).IsUnicode(true).HasMaxLength(1000);
        });

        // AssetStatus configurations
        modelBuilder.Entity<AssetStatus>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            // Unicode support for Arabic
            entity.Property(e => e.Name).IsUnicode(true).HasMaxLength(100);
            entity.Property(e => e.Description).IsUnicode(true).HasMaxLength(500);
        });

        // Supplier configurations
        modelBuilder.Entity<Supplier>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            // Unicode support for Arabic
            entity.Property(e => e.Name).IsUnicode(true).HasMaxLength(200);
            entity.Property(e => e.ContactPerson).IsUnicode(true).HasMaxLength(200);
            entity.Property(e => e.Address).IsUnicode(true).HasMaxLength(500);
            entity.Property(e => e.Notes).IsUnicode(true).HasMaxLength(1000);
        });

        // PurchaseOrder configurations
        modelBuilder.Entity<PurchaseOrder>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.OrderNumber).IsUnique();
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18,2)");
        });

        // PurchaseOrderItem configurations
        modelBuilder.Entity<PurchaseOrderItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TotalPrice).HasColumnType("decimal(18,2)");
        });

        // Seed initial data
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        // Seed Asset Statuses
        // ?????? ????? ????? ????? PendingModelChanges
        var seedDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        
        modelBuilder.Entity<AssetStatus>().HasData(
            new AssetStatus { Id = 1, Name = "????", Code = "NEW", Color = "#28a745", IsActive = true, CreatedAt = seedDate },
            new AssetStatus { Id = 2, Name = "???", Code = "GOOD", Color = "#17a2b8", IsActive = true, CreatedAt = seedDate },
            new AssetStatus { Id = 3, Name = "????? ?????", Code = "NEEDS_MAINTENANCE", Color = "#ffc107", IsActive = true, CreatedAt = seedDate },
            new AssetStatus { Id = 4, Name = "????", Code = "DAMAGED", Color = "#dc3545", IsActive = true, CreatedAt = seedDate },
            new AssetStatus { Id = 5, Name = "???????", Code = "FOR_DISPOSAL", Color = "#6c757d", IsActive = true, CreatedAt = seedDate },
            new AssetStatus { Id = 6, Name = "????", Code = "DISPOSED", Color = "#343a40", IsActive = true, CreatedAt = seedDate }
        );

        // Seed Default Admin User
        // Username: admin
        // Password: Admin@123 (Hash generated using BCrypt WorkFactor 11)
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                Username = "admin",
                Email = "admin@dura.ps",
                PasswordHash = "$2a$11$K3vZK3vZK3vZK3vZK3vZKOe5YqM8vJxVnRZjqJqJqJqJe7KzM8vJxVm",
                FullName = "???? ??????",
                Role = Enums.UserRole.Admin,
                IsActive = true,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
