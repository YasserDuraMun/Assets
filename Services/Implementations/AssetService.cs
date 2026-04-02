using Microsoft.EntityFrameworkCore;
using Assets.Data;
using Assets.DTOs.Asset;
using Assets.DTOs.Common;
using Assets.Services.Interfaces;
using Assets.Models;
using Assets.Enums;

namespace Assets.Services.Implementations;

public class AssetService : IAssetService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AssetService> _logger;

    public AssetService(ApplicationDbContext context, ILogger<AssetService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<PagedResult<AssetListDto>> GetAllAsync(int pageNumber, int pageSize, string? searchTerm = null, int? categoryId = null, int? statusId = null)
    {
        var query = _context.Assets
            .Where(a => !a.IsDeleted)
            .Include(a => a.Category)
            .Include(a => a.Status)
            .Include(a => a.CurrentEmployee)
            .Include(a => a.CurrentWarehouse)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(a => a.Name.Contains(searchTerm) || a.SerialNumber.Contains(searchTerm));
        }

        if (categoryId.HasValue)
        {
            query = query.Where(a => a.CategoryId == categoryId.Value);
        }

        if (statusId.HasValue)
        {
            query = query.Where(a => a.StatusId == statusId.Value);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AssetListDto
            {
                Id = a.Id,
                Name = a.Name,
                SerialNumber = a.SerialNumber,
                CategoryName = a.Category.Name,
                StatusName = a.Status.Name,
                StatusColor = a.Status.Color,
                CurrentLocationName = a.CurrentLocationType == LocationType.Employee ? a.CurrentEmployee!.FullName : 
                                     a.CurrentLocationType == LocationType.Warehouse ? a.CurrentWarehouse!.Name : null,
                PurchaseDate = a.PurchaseDate
            })
            .ToListAsync();

        return new PagedResult<AssetListDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<AssetDto?> GetByIdAsync(int id, bool includeDeleted = false)
    {
        var query = _context.Assets
            .Include(a => a.Category)
            .Include(a => a.SubCategory)
            .Include(a => a.Status)
            .Include(a => a.CurrentEmployee)
            .Include(a => a.CurrentWarehouse)
            .Include(a => a.CurrentDepartment)
            .Include(a => a.CurrentSection)
            .AsQueryable();

        if (!includeDeleted)
        {
            query = query.Where(a => !a.IsDeleted);
        }

        var asset = await query.FirstOrDefaultAsync(a => a.Id == id);

        if (asset == null)
            return null;

        return new AssetDto
        {
            Id = asset.Id,
            Name = asset.Name,
            Description = asset.Description,
            SerialNumber = asset.SerialNumber,
            Barcode = asset.Barcode,
            QRCode = asset.QRCode,
            
            // IDs for form editing
            CategoryId = asset.CategoryId,
            SubCategoryId = asset.SubCategoryId,
            StatusId = asset.StatusId,
            
            // Names for display
            CategoryName = asset.Category.Name,
            SubCategoryName = asset.SubCategory?.Name,
            StatusName = asset.Status.Name,
            StatusColor = asset.Status.Color,
            
            // Location information
            CurrentLocationType = (int)asset.CurrentLocationType, // Send as number for consistency
            LocationType = asset.CurrentLocationType.ToString(),
            CurrentLocationName = GetLocationName(asset),
            
            // Location IDs for pre-filling forms
            CurrentEmployeeId = asset.CurrentEmployeeId,
            CurrentWarehouseId = asset.CurrentWarehouseId,
            CurrentDepartmentId = asset.CurrentDepartmentId,
            CurrentSectionId = asset.CurrentSectionId,
            
            // Individual location names for transfers
            CurrentEmployeeName = asset.CurrentEmployee?.FullName,
            CurrentWarehouseName = asset.CurrentWarehouse?.Name,
            CurrentDepartmentName = asset.CurrentDepartment?.Name,
            CurrentSectionName = asset.CurrentSection?.Name,
            
            PurchaseDate = asset.PurchaseDate,
            PurchasePrice = asset.PurchasePrice,
            HasWarranty = asset.HasWarranty,
            WarrantyMonths = asset.WarrantyMonths,
            WarrantyExpiryDate = asset.WarrantyExpiryDate,
            ImagePath = asset.ImagePath,
            Notes = asset.Notes,
            CreatedAt = asset.CreatedAt,
            IsDeleted = asset.IsDeleted,
            DeletedAt = asset.DeletedAt
        };
    }

    public async Task<AssetDto> CreateAsync(CreateAssetDto dto, int userId)
    {
        var asset = new Asset
        {
            Name = dto.Name,
            Description = dto.Description,
            SerialNumber = dto.SerialNumber,
            Barcode = dto.Barcode,
            CategoryId = dto.CategoryId,
            SubCategoryId = dto.SubCategoryId,
            StatusId = dto.StatusId,
            CurrentLocationType = dto.CurrentLocationType,
            CurrentEmployeeId = dto.CurrentEmployeeId,
            CurrentWarehouseId = dto.CurrentWarehouseId,
            CurrentDepartmentId = dto.CurrentDepartmentId,
            CurrentSectionId = dto.CurrentSectionId,
            PurchaseDate = dto.PurchaseDate,
            PurchasePrice = dto.PurchasePrice,
            SupplierId = dto.SupplierId,
            HasWarranty = dto.HasWarranty,
            WarrantyMonths = dto.WarrantyMonths,
            AcquisitionYear = dto.AcquisitionYear,
            LifespanYears = dto.LifespanYears,
            Notes = dto.Notes,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow
        };

        // Calculate warranty expiry
        if (dto.HasWarranty && dto.WarrantyMonths.HasValue && dto.PurchaseDate.HasValue)
        {
            asset.WarrantyExpiryDate = dto.PurchaseDate.Value.AddMonths(dto.WarrantyMonths.Value);
        }

        // Calculate lifespan end date
        if (dto.LifespanYears.HasValue && dto.AcquisitionYear.HasValue)
        {
            asset.LifespanEndDate = new DateTime(dto.AcquisitionYear.Value, 1, 1).AddYears(dto.LifespanYears.Value);
        }

        _context.Assets.Add(asset);
        await _context.SaveChangesAsync();

        // Generate QR code automatically after asset is created
        asset.QRCode = $"ASSET-{asset.Id}-{asset.SerialNumber}";
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(asset.Id))!;
    }

    public async Task<AssetDto> UpdateAsync(UpdateAssetDto dto, int userId)
    {
        var asset = await _context.Assets.FindAsync(dto.Id);
        
        if (asset == null)
            throw new Exception("Asset not found");

        asset.Name = dto.Name;
        asset.Description = dto.Description;
        asset.SerialNumber = dto.SerialNumber;
        asset.Barcode = dto.Barcode;
        asset.CategoryId = dto.CategoryId;
        asset.SubCategoryId = dto.SubCategoryId;
        asset.StatusId = dto.StatusId;
        asset.Notes = dto.Notes;
        asset.UpdatedBy = userId;
        asset.UpdatedAt = DateTime.UtcNow;

        // Update QR code if serial number changed or if QR code doesn't exist
        if (string.IsNullOrEmpty(asset.QRCode) || asset.QRCode != $"ASSET-{asset.Id}-{asset.SerialNumber}")
        {
            asset.QRCode = $"ASSET-{asset.Id}-{asset.SerialNumber}";
        }

        await _context.SaveChangesAsync();

        return (await GetByIdAsync(asset.Id))!;
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var asset = await _context.Assets.FindAsync(id);
        
        if (asset == null)
            return false;

        // Soft delete
        asset.IsDeleted = true;
        asset.DeletedAt = DateTime.UtcNow;
        asset.UpdatedBy = userId;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<string> GenerateQRCodeAsync(int assetId)
    {
        var asset = await _context.Assets
            .Include(a => a.Category)
            .FirstOrDefaultAsync(a => a.Id == assetId);

        if (asset == null)
            return string.Empty;

        // Generate QR code content with asset information
        var qrContent = $"ASSET-{assetId}-{asset.SerialNumber}";
        return qrContent;
    }

    public async Task<List<AssetListDto>> GetByEmployeeAsync(int employeeId)
    {
        return await _context.Assets
            .Where(a => a.CurrentEmployeeId == employeeId && !a.IsDeleted)
            .Include(a => a.Category)
            .Include(a => a.Status)
            .Select(a => new AssetListDto
            {
                Id = a.Id,
                Name = a.Name,
                SerialNumber = a.SerialNumber,
                CategoryName = a.Category.Name,
                StatusName = a.Status.Name,
                StatusColor = a.Status.Color,
                PurchaseDate = a.PurchaseDate
            })
            .ToListAsync();
    }

    public async Task<List<AssetListDto>> GetByWarehouseAsync(int warehouseId)
    {
        return await _context.Assets
            .Where(a => a.CurrentWarehouseId == warehouseId && !a.IsDeleted)
            .Include(a => a.Category)
            .Include(a => a.Status)
            .Select(a => new AssetListDto
            {
                Id = a.Id,
                Name = a.Name,
                SerialNumber = a.SerialNumber,
                CategoryName = a.Category.Name,
                StatusName = a.Status.Name,
                StatusColor = a.Status.Color,
                PurchaseDate = a.PurchaseDate
            })
            .ToListAsync();
    }

    public async Task<List<AssetListDto>> GetByDepartmentAsync(int departmentId)
    {
        return await _context.Assets
            .Where(a => a.CurrentDepartmentId == departmentId && !a.IsDeleted)
            .Include(a => a.Category)
            .Include(a => a.Status)
            .Select(a => new AssetListDto
            {
                Id = a.Id,
                Name = a.Name,
                SerialNumber = a.SerialNumber,
                CategoryName = a.Category.Name,
                StatusName = a.Status.Name,
                StatusColor = a.Status.Color,
                PurchaseDate = a.PurchaseDate
            })
            .ToListAsync();
    }

    private string? GetLocationName(Asset asset)
    {
        return asset.CurrentLocationType switch
        {
            LocationType.Employee => asset.CurrentEmployee?.FullName ?? "???? ??? ????",
            LocationType.Warehouse => asset.CurrentWarehouse?.Name ?? "?????? ??? ????",
            LocationType.Department => asset.CurrentDepartment?.Name ?? "????? ??? ?????",
            LocationType.Section => asset.CurrentSection?.Name ?? "??? ??? ????",
            _ => "???? ??? ?????"
        };
    }
}
