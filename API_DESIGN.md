# ?? ????? ??? API - API Design Guidelines

## ?? RESTful API Design Principles

### Base URL
```
Production:  https://api.dura-municipality.ps/api/v1
Staging:     https://staging-api.dura-municipality.ps/api/v1
Development: https://localhost:5001/api
```

---

## ?? API Endpoints - ??????? ???????

### 1. Authentication & Authorization

```http
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
POST   /api/auth/change-password
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/profile
PUT    /api/auth/profile
```

### 2. Users Management

```http
GET    /api/users                    # Get all users (paginated)
GET    /api/users/{id}                # Get user by ID
POST   /api/users                    # Create user
PUT    /api/users/{id}                # Update user
DELETE /api/users/{id}                # Delete user
GET    /api/users/{id}/roles          # Get user roles
POST   /api/users/{id}/roles          # Assign role to user
DELETE /api/users/{id}/roles/{roleId} # Remove role from user
GET    /api/users/search?q={query}   # Search users
```

### 3. Assets Management

```http
GET    /api/assets                      # Get all assets (paginated, filtered)
GET    /api/assets/{id}                  # Get asset by ID
POST   /api/assets                      # Create new asset
PUT    /api/assets/{id}                  # Update asset
DELETE /api/assets/{id}                  # Delete asset (soft delete)
GET    /api/assets/{id}/history          # Get asset movement history
GET    /api/assets/{id}/qrcode           # Get asset QR code
POST   /api/assets/bulk-import          # Bulk import assets (CSV/Excel)
GET    /api/assets/export               # Export assets
GET    /api/assets/search?q={query}     # Search assets
GET    /api/assets/by-location/{locationId}
GET    /api/assets/by-employee/{employeeId}
GET    /api/assets/by-department/{departmentId}
GET    /api/assets/by-status/{status}
GET    /api/assets/by-category/{categoryId}
```

### 4. Asset Categories

```http
GET    /api/asset-categories
GET    /api/asset-categories/{id}
POST   /api/asset-categories
PUT    /api/asset-categories/{id}
DELETE /api/asset-categories/{id}
GET    /api/asset-categories/{id}/subcategories
```

### 5. Employees

```http
GET    /api/employees
GET    /api/employees/{id}
POST   /api/employees
PUT    /api/employees/{id}
DELETE /api/employees/{id}
GET    /api/employees/{id}/assets
GET    /api/employees/{id}/qrcode
GET    /api/employees/search?q={query}
```

### 6. Departments

```http
GET    /api/departments
GET    /api/departments/{id}
POST   /api/departments
PUT    /api/departments/{id}
DELETE /api/departments/{id}
GET    /api/departments/{id}/sections
GET    /api/departments/{id}/employees
GET    /api/departments/{id}/assets
GET    /api/departments/{id}/statistics
```

### 7. Sections

```http
GET    /api/sections
GET    /api/sections/{id}
POST   /api/sections
PUT    /api/sections/{id}
DELETE /api/sections/{id}
GET    /api/sections/{id}/employees
GET    /api/sections/{id}/assets
```

### 8. Warehouses

```http
GET    /api/warehouses
GET    /api/warehouses/{id}
POST   /api/warehouses
PUT    /api/warehouses/{id}
DELETE /api/warehouses/{id}
GET    /api/warehouses/{id}/assets
GET    /api/warehouses/{id}/statistics
```

### 9. Transfers

```http
GET    /api/transfers                  # Get all transfers
GET    /api/transfers/{id}              # Get transfer by ID
POST   /api/transfers                  # Initiate transfer
PUT    /api/transfers/{id}              # Update transfer
DELETE /api/transfers/{id}              # Cancel transfer
POST   /api/transfers/{id}/approve     # Approve transfer
POST   /api/transfers/{id}/reject      # Reject transfer
GET    /api/transfers/pending          # Get pending transfers
GET    /api/transfers/by-asset/{assetId}
GET    /api/transfers/by-employee/{employeeId}
```

### 10. Maintenance

```http
GET    /api/maintenance
GET    /api/maintenance/{id}
POST   /api/maintenance
PUT    /api/maintenance/{id}
DELETE /api/maintenance/{id}
GET    /api/maintenance/by-asset/{assetId}
GET    /api/maintenance/scheduled
GET    /api/maintenance/overdue
POST   /api/maintenance/{id}/complete
```

### 11. Disposal

```http
GET    /api/disposal
GET    /api/disposal/{id}
POST   /api/disposal
PUT    /api/disposal/{id}
DELETE /api/disposal/{id}
POST   /api/disposal/{id}/approve
POST   /api/disposal/{id}/reject
POST   /api/disposal/{id}/upload-document
GET    /api/disposal/pending
```

### 12. Purchase Orders

```http
GET    /api/purchase-orders
GET    /api/purchase-orders/{id}
POST   /api/purchase-orders
PUT    /api/purchase-orders/{id}
DELETE /api/purchase-orders/{id}
GET    /api/purchase-orders/{id}/assets
```

### 13. Suppliers

```http
GET    /api/suppliers
GET    /api/suppliers/{id}
POST   /api/suppliers
PUT    /api/suppliers/{id}
DELETE /api/suppliers/{id}
GET    /api/suppliers/{id}/purchase-orders
GET    /api/suppliers/{id}/statistics
```

### 14. QR Code

```http
GET    /api/qrcode/asset/{assetId}        # Generate/Get asset QR code
GET    /api/qrcode/employee/{employeeId}  # Generate/Get employee QR code
POST   /api/qrcode/scan                   # Scan QR code and get data
GET    /api/qrcode/generate/{type}/{id}   # Generate QR code
POST   /api/qrcode/validate               # Validate QR code
```

### 15. Reports

```http
GET    /api/reports/assets-by-department
GET    /api/reports/assets-by-employee
GET    /api/reports/assets-by-status
GET    /api/reports/assets-by-category
GET    /api/reports/asset-movements
GET    /api/reports/maintenance-history
GET    /api/reports/disposal-records
GET    /api/reports/warranty-expiration
GET    /api/reports/pending-audits
GET    /api/reports/financial-summary
POST   /api/reports/custom               # Custom report with filters
GET    /api/reports/{reportId}/export    # Export report (PDF/Excel)
```

### 16. Dashboard & Statistics

```http
GET    /api/dashboard/overview
GET    /api/dashboard/statistics
GET    /api/dashboard/recent-activities
GET    /api/dashboard/alerts
GET    /api/dashboard/charts/assets-by-status
GET    /api/dashboard/charts/assets-by-department
GET    /api/dashboard/charts/maintenance-costs
```

### 17. Notifications

```http
GET    /api/notifications
GET    /api/notifications/{id}
PUT    /api/notifications/{id}/read
PUT    /api/notifications/mark-all-read
DELETE /api/notifications/{id}
GET    /api/notifications/unread-count
```

### 18. Audit Logs

```http
GET    /api/audit-logs
GET    /api/audit-logs/{id}
GET    /api/audit-logs/by-entity/{entityId}
GET    /api/audit-logs/by-user/{userId}
GET    /api/audit-logs/by-action/{action}
GET    /api/audit-logs/export
```

---

## ?? Request/Response Examples

### Example 1: Create Asset

**Request:**
```http
POST /api/assets
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "???? ???? ????",
  "description": "???? ???? ??? ????? ?? ??? ????",
  "serialNumber": "CH-2024-001",
  "categoryId": 5,
  "purchaseDate": "2024-01-15T00:00:00",
  "cost": 1500.00,
  "supplierId": 12,
  "warrantyMonths": 24,
  "locationId": 3,
  "status": "new",
  "notes": "?? ?????? ?? ???? ??????"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "?? ????? ????? ?????",
  "data": {
    "id": 145,
    "name": "???? ???? ????",
    "serialNumber": "CH-2024-001",
    "qrCode": "https://api.example.com/qrcodes/asset-145.png",
    "createdAt": "2024-02-15T10:30:00Z",
    "createdBy": "admin@dura.ps"
  }
}
```

### Example 2: Get Assets with Filters

**Request:**
```http
GET /api/assets?page=1&pageSize=20&status=active&categoryId=5&departmentId=3&sortBy=name&sortOrder=asc
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 145,
      "name": "???? ???? ????",
      "serialNumber": "CH-2024-001",
      "category": "???? ?????",
      "status": "active",
      "location": {
        "type": "employee",
        "name": "???? ????",
        "department": "????? ?????????"
      },
      "cost": 1500.00,
      "purchaseDate": "2024-01-15"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 20,
    "totalPages": 5,
    "totalRecords": 95
  }
}
```

### Example 3: Transfer Asset

**Request:**
```http
POST /api/transfers
Content-Type: application/json
Authorization: Bearer {token}

{
  "assetId": 145,
  "fromEmployeeId": 23,
  "toEmployeeId": 45,
  "transferDate": "2024-02-20T00:00:00",
  "reason": "??? ??? ????? ??????? ???????",
  "notes": "?? ??????? ?? ??????"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "?? ????? ??? ????? ?????",
  "data": {
    "id": 78,
    "assetId": 145,
    "assetName": "???? ???? ????",
    "fromEmployee": "???? ????",
    "toEmployee": "????? ???",
    "status": "pending",
    "transferDate": "2024-02-20T00:00:00",
    "createdAt": "2024-02-15T10:35:00Z"
  }
}
```

### Example 4: Error Response

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "???? ????? ?????? ?? ????????",
  "errors": [
    {
      "field": "name",
      "message": "??? ????? ?????"
    },
    {
      "field": "cost",
      "message": "??????? ??? ?? ???? ???? ?? ???"
    }
  ]
}
```

---

## ?? Authentication

### JWT Token Structure

```json
{
  "sub": "user@dura.ps",
  "jti": "unique-token-id",
  "userId": "123",
  "roles": ["Admin", "WarehouseKeeper"],
  "departmentId": "5",
  "exp": 1708012800
}
```

### Header Format

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ?? Query Parameters - Filtering & Pagination

### Standard Query Parameters

```
?page=1                  # Page number (default: 1)
?pageSize=20             # Items per page (default: 20, max: 100)
?sortBy=name             # Sort field
?sortOrder=asc           # Sort order (asc/desc)
?search=keyword          # Search keyword
?status=active           # Filter by status
?categoryId=5            # Filter by category
?departmentId=3          # Filter by department
?fromDate=2024-01-01     # Date range start
?toDate=2024-12-31       # Date range end
```

### Example:
```http
GET /api/assets?page=2&pageSize=50&sortBy=purchaseDate&sortOrder=desc&status=active&categoryId=5&search=????
```

---

## ?? Response Status Codes

```
200 OK                  - Successful GET/PUT
201 Created             - Successful POST
204 No Content          - Successful DELETE
400 Bad Request         - Validation error
401 Unauthorized        - No token or invalid token
403 Forbidden           - No permission
404 Not Found           - Resource not found
409 Conflict            - Duplicate data
422 Unprocessable Entity - Business rule violation
500 Internal Server Error - Server error
```

---

## ?? Response Format Standards

### Success Response
```json
{
  "success": true,
  "message": "????? ?????",
  "data": { /* ... */ },
  "pagination": { /* ... */ }  // ??????? ???
}
```

### Error Response
```json
{
  "success": false,
  "message": "????? ????? ????????",
  "errors": [
    {
      "field": "fieldName",
      "message": "????? ?????"
    }
  ],
  "errorCode": "VALIDATION_ERROR",
  "timestamp": "2024-02-15T10:30:00Z"
}
```

---

## ?? Bulk Operations

### Bulk Import
```http
POST /api/assets/bulk-import
Content-Type: multipart/form-data

file: assets.csv
```

### Bulk Update
```http
PUT /api/assets/bulk-update
Content-Type: application/json

{
  "assetIds": [1, 2, 3, 4],
  "updates": {
    "status": "active",
    "departmentId": 5
  }
}
```

### Bulk Delete
```http
DELETE /api/assets/bulk-delete
Content-Type: application/json

{
  "assetIds": [1, 2, 3, 4]
}
```

---

## ?? File Upload

```http
POST /api/assets/{id}/upload-image
Content-Type: multipart/form-data

file: image.jpg
```

**Response:**
```json
{
  "success": true,
  "message": "?? ??? ?????? ?????",
  "data": {
    "fileName": "asset-145-image.jpg",
    "url": "https://storage.dura.ps/assets/asset-145-image.jpg",
    "size": 245678
  }
}
```

---

## ?? Search API

```http
POST /api/search
Content-Type: application/json

{
  "query": "????",
  "filters": {
    "entities": ["assets", "employees"],
    "departmentId": 5,
    "status": "active"
  },
  "pagination": {
    "page": 1,
    "pageSize": 20
  }
}
```

---

## ?? Export API

```http
GET /api/assets/export?format=excel&status=active&departmentId=5
Authorization: Bearer {token}
```

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename="assets-export-2024-02-15.xlsx"`

---

## ?? Best Practices

### 1. Use Proper HTTP Methods
- **GET** - Retrieve data
- **POST** - Create new resource
- **PUT** - Update entire resource
- **PATCH** - Update partial resource
- **DELETE** - Delete resource

### 2. Versioning
```
/api/v1/assets
/api/v2/assets  # ????? ????
```

### 3. Use Plural Nouns
```
? /api/assets
? /api/asset
```

### 4. Use Nested Resources
```
? /api/departments/5/sections
? /api/employees/23/assets
```

### 5. Use Query Parameters for Filtering
```
? /api/assets?status=active&categoryId=5
? /api/assets/active/category/5
```

### 6. Return Appropriate Status Codes
Always return meaningful HTTP status codes

### 7. Provide Meaningful Error Messages
Error messages should be clear and in Arabic

### 8. Use Pagination
Always paginate large result sets

### 9. Document Your API
Use Swagger/OpenAPI for documentation

### 10. Security
- Always use HTTPS
- Implement rate limiting
- Validate all inputs
- Use authentication & authorization

---

## ?? API Documentation Tools

### Swagger/OpenAPI
?? `Program.cs`:
```csharp
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Assets Management API",
        Version = "v1",
        Description = "???? ????? ???? ?????? - ????? ????"
    });
    
    // Add JWT Authentication
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        // ...
    });
});
```

Access at: `https://localhost:5001/swagger`

---

## ?? API Testing

### Using cURL
```bash
curl -X GET https://localhost:5001/api/assets \
  -H "Authorization: Bearer {token}"
```

### Using Postman
Create collection with environment variables:
- `baseUrl`: https://localhost:5001
- `token`: {your-jwt-token}

---

**API Design ??? ?? ????:**
- ? ???? ???? ?????
- ? ?????? (Consistent)
- ? ???? ?????
- ? ???
- ? ???? ??????
