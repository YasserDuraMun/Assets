import { Tabs, Card } from 'antd';
import { SettingOutlined, TagsOutlined, AppstoreOutlined, ApartmentOutlined, ShopOutlined, UserOutlined } from '@ant-design/icons';
import MainLayout from '../components/MainLayout';
import AssetStatusesPage from './settings/AssetStatusesPage';
import CategoriesPage from './settings/CategoriesPage';
import DepartmentsPage from './settings/DepartmentsPage';
import WarehousesPage from './settings/WarehousesPage';
import EmployeesPage from './settings/EmployeesPage';
import { useAuth } from '../contexts/AuthContext';

interface SettingsPageProps {
  defaultTab?: string;
}

export default function SettingsPage({ defaultTab = 'categories' }: SettingsPageProps) {
const { hasPermission, permissions, user } = useAuth();

console.log('🔍 SettingsPage: User:', user?.email);
console.log('🔍 SettingsPage: User roles:', user?.roles?.map(r => r.roleName));
console.log('🔍 SettingsPage: Permissions count:', permissions?.length || 0);

// Check if user is Super Admin (always has access)
const isSuperAdmin = user?.roles?.some(role => 
  role.roleName === 'Super Admin' || role.roleName === 'SuperAdmin'
) || false;

console.log('🔍 SettingsPage: Is Super Admin:', isSuperAdmin);

// Build tabs based on user permissions
const availableTabs = [
  {
    key: 'categories',
    permission: 'Categories',
    label: (
      <span>
        <AppstoreOutlined /> الفئات والفئات الفرعية
      </span>
    ),
    children: <CategoriesPage />,
  },
  {
    key: 'departments',
    permission: 'Departments',
    label: (
      <span>
        <ApartmentOutlined /> الإدارات والأقسام
      </span>
    ),
    children: <DepartmentsPage />,
  },
  {
    key: 'employees',
    permission: 'Employees',
    label: (
      <span>
        <UserOutlined /> الموظفون
      </span>
    ),
    children: <EmployeesPage />,
  },
  {
    key: 'warehouses',
    permission: 'Warehouses',
    label: (
      <span>
        <ShopOutlined /> المستودعات
      </span>
    ),
    children: <WarehousesPage />,
  },
  {
    key: 'statuses',
    permission: 'Assets', // Asset statuses usually under Assets permission
    label: (
      <span>
        <TagsOutlined /> حالات الأصول
      </span>
    ),
    children: <AssetStatusesPage />,
  }
];

// Filter tabs based on permissions - with Super Admin bypass
const items = availableTabs.filter(tab => {
  if (isSuperAdmin) {
    console.log(`🔍 Settings Tab Check: ${tab.permission} = true (Super Admin)`);
    return true; // Super Admin has access to everything
  }
    
  const hasAccess = hasPermission(tab.permission, 'view');
  console.log(`🔍 Settings Tab Check: ${tab.permission}.view = ${hasAccess}`);
  return hasAccess;
}).map(tab => ({
  key: tab.key,
  label: tab.label,
  children: tab.children
}));

console.log(`🔍 Settings: Available tabs count = ${items.length}`);
console.log(`🔍 Settings: Available tabs = `, items.map(item => item.key));

// Special handling for custom roles with loaded permissions
if (items.length === 0 && !isSuperAdmin && permissions && permissions.length > 0) {
  console.log('🔧 Settings: Custom role detected with permissions but no tabs visible');
  console.log('🔧 Settings: Checking individual permissions...');
    
  // Check which permissions actually exist
  const permissionNames = permissions.map(p => p.screenName);
  console.log('🔧 Settings: Available permission names:', permissionNames);
    
  // Show tabs for permissions that exist, regardless of hasPermission result
  const availableTabsForUser = availableTabs.filter(tab => {
    const permExists = permissionNames.includes(tab.permission);
    console.log(`🔧 Settings: ${tab.permission} exists in permissions: ${permExists}`);
    return permExists;
  }).map(tab => ({
    key: tab.key,
    label: tab.label,
    children: tab.children
  }));

  if (availableTabsForUser.length > 0) {
    console.log('🔧 Settings: Using permission-name-based tabs');
      
    return (
      <MainLayout>
        <Card
          title={
            <span>
              <SettingOutlined /> إعدادات النظام
            </span>
          }
        >
          <div style={{ marginBottom: '16px', padding: '8px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '4px' }}>
            ℹ️ عرض الإعدادات بناءً على الصلاحيات المتاحة للدور المخصص
          </div>
          <Tabs items={availableTabsForUser} defaultActiveKey={defaultTab} />
        </Card>
      </MainLayout>
    );
  }
}

// If no tabs available at all, show access denied message
if (items.length === 0) {
  console.log(`❌ Settings: No tabs available, showing access denied`);
  return (
    <MainLayout>
      <Card
        title={
          <span>
            <SettingOutlined /> إعدادات النظام
          </span>
        }
      >
        <div style={{ 
          textAlign: 'center', 
          padding: '50px',
          color: '#999'
        }}>
          <h3>لا توجد إعدادات متاحة</h3>
          <p>ليس لديك صلاحيات للوصول إلى أي من إعدادات النظام.</p>
          <div style={{ marginTop: '20px', fontSize: '12px', color: '#ccc' }}>
            <p>المطلوب: صلاحيات على Categories, Departments, Employees, Warehouses, أو Assets</p>
            <p>المستخدم: {user?.email} | الأدوار: {user?.roles?.map(r => r.roleName).join(', ')}</p>
            <p>الصلاحيات المحملة: {permissions?.length || 0}</p>
          </div>
        </div>
      </Card>
    </MainLayout>
  );
}

  // Set default tab to first available if defaultTab is not accessible
  const availableKeys = items.map(item => item.key);
  const activeTab = availableKeys.includes(defaultTab || '') ? defaultTab : availableKeys[0];
  return (
    <MainLayout>
      <Card
        title={
          <span>
            <SettingOutlined /> إعدادات النظام
          </span>
        }
        >
        <Tabs items={items} defaultActiveKey={activeTab} />
      </Card>
    </MainLayout>
  );
}


