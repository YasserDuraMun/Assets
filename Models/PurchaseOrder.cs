namespace Assets.Models;

public class PurchaseOrder
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public int SupplierId { get; set; }
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }
    public string? DocumentPath { get; set; }
    public string Status { get; set; } = "Pending";
    public int CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Supplier Supplier { get; set; } = null!;
    public User Creator { get; set; } = null!;
    public ICollection<PurchaseOrderItem> Items { get; set; } = new List<PurchaseOrderItem>();
}
