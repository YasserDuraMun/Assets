# Permission-Based UI Implementation Guide

This implementation provides a comprehensive permission-based UI system that shows/hides buttons and actions based on user roles and permissions.

## ?? Components Created

### 1. usePermissions Hook (`ClientApp/src/hooks/usePermissions.ts`)
A custom React hook that provides permission checking functionality:

```typescript
const { hasPermission, getScreenPermissions } = usePermissions();

// Check specific permission
const canCreate = hasPermission('Assets', 'create');

// Get all permissions for a screen
const { canView, canCreate, canUpdate, canDelete } = getScreenPermissions('Assets');
```

### 2. PermissionWrapper Component (`ClientApp/src/components/PermissionWrapper.tsx`)
A wrapper component that conditionally renders children based on permissions:

```typescript
<PermissionWrapper screenName="Assets" permission="create">
  <Button>Add Asset</Button>
</PermissionWrapper>
```

## ?? Implementation Details

### Screen Names
The system uses these screen names for permission checking:
- `Assets` - For asset management
- `Maintenance` - For maintenance operations  
- `Transfers` - For asset transfers
- `Reports` - For reporting (can be implemented)
- `Settings` - For system settings (can be implemented)

### Permission Types
- `view` - View/read access
- `create` - Create/insert access  
- `update` - Edit/update access
- `delete` - Delete access

### Super Admin Behavior
- Super Admin users (`user.isSuperAdmin = true`) automatically have all permissions
- Regular users are checked against their role permissions

## ?? UI Elements Controlled

### Assets Page
- **Add Asset Button**: Requires `Assets.create` permission
- **View Button**: Requires `Assets.view` permission
- **Edit Button**: Requires `Assets.update` permission
- **Dispose Button**: Requires `Assets.update` permission
- **Delete Button**: Requires `Assets.delete` permission

### Maintenance Page
- **Schedule Maintenance Button**: Requires `Maintenance.create` permission
- **View Asset Action**: Requires `Maintenance.view` permission
- **Complete Action**: Requires `Maintenance.update` permission
- **Cancel Action**: Requires `Maintenance.update` permission
- **Delete Action**: Requires `Maintenance.delete` permission

### Transfers Page
- **New Transfer Button**: Requires `Transfers.create` permission
- **View Action**: Requires `Transfers.view` permission

## ?? Permission Data Structure

The system expects user permissions in this format:

```typescript
interface UserPermission {
  screenName: string;
  allowView: boolean;
  allowInsert: boolean;  // maps to 'create'
  allowUpdate: boolean;
  allowDelete: boolean;
}

interface User {
  id: number;
  username: string;
  isSuperAdmin: boolean;
  permissions: UserPermission[];
}
```

## ?? Usage Examples

### Basic Usage
```typescript
import usePermissions from '../hooks/usePermissions';

const MyComponent = () => {
  const { hasPermission } = usePermissions();
  
  return (
    <div>
      {hasPermission('Assets', 'create') && (
        <Button>Add Asset</Button>
      )}
    </div>
  );
};
```

### Using PermissionWrapper
```typescript
import PermissionWrapper from '../components/PermissionWrapper';

const MyComponent = () => {
  return (
    <PermissionWrapper screenName="Assets" permission="create">
      <Button>Add Asset</Button>
    </PermissionWrapper>
  );
};
```

### Getting All Permissions
```typescript
import usePermissions from '../hooks/usePermissions';

const MyComponent = () => {
  const { getScreenPermissions } = usePermissions();
  const permissions = getScreenPermissions('Assets');
  
  return (
    <Space>
      {permissions.canView && <Button>View</Button>}
      {permissions.canUpdate && <Button>Edit</Button>}
      {permissions.canDelete && <Button>Delete</Button>}
    </Space>
  );
};
```

## ? Testing the Implementation

### Test Scenarios

1. **Super Admin User**
   - Should see all buttons regardless of role permissions
   - All actions should be available

2. **User with Limited Permissions**
   - Test with user having only `view` permission
   - Should only see view-related buttons
   - Add/Edit/Delete buttons should be hidden

3. **User with No Permissions**
   - Should see no action buttons
   - Should get access denied if trying to access the page

### Test Steps
1. Create different roles with different permission combinations
2. Assign roles to test users
3. Login with each test user
4. Verify correct buttons are shown/hidden
5. Test that hidden actions still have backend protection

## ?? Adding New Screens

To add permission-based UI to new screens:

1. **Use the hook in your component:**
```typescript
const { getScreenPermissions } = usePermissions();
const screenPermissions = getScreenPermissions('YourScreenName');
```

2. **Wrap buttons with permission checks:**
```typescript
{screenPermissions.canCreate && <Button>Add New</Button>}
```

3. **Or use PermissionWrapper:**
```typescript
<PermissionWrapper screenName="YourScreen" permission="create">
  <Button>Add New</Button>
</PermissionWrapper>
```

## ?? Security Notes

- This implementation provides **UI-level** permission control
- **Backend API endpoints must still enforce permissions** for security
- UI hiding is for UX improvement, not security enforcement
- Always validate permissions on the server side

## ?? Customization

### Adding Custom Permission Types
You can extend the permission types by updating the hook:

```typescript
type PermissionType = 'view' | 'create' | 'update' | 'delete' | 'export' | 'approve';
```

### Adding Fallback Content
The PermissionWrapper supports fallback content:

```typescript
<PermissionWrapper 
  screenName="Assets" 
  permission="create"
  fallback={<span>No permission to create assets</span>}
>
  <Button>Add Asset</Button>
</PermissionWrapper>
```

This implementation ensures that users only see UI elements they have permission to use, creating a cleaner and more secure user experience.