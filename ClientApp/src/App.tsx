import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import RolePermissionsPage from './pages/RolePermissionsPage';
import PermissionGuard, { RoleGuard } from './components/PermissionGuard';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import AssetsPage from './pages/AssetsPage';
import AddAssetPage from './pages/AddAssetPage';
import AssetDetailsPage from './pages/AssetDetailsPage';
import EditAssetPage from './pages/EditAssetPage';
import TransfersPage from './pages/TransfersPage';
import NewTransferPage from './pages/NewTransferPage';
import TransferDetailsPage from './pages/TransferDetailsPage';
import DisposalsPage from './pages/DisposalsPage';
import MaintenancePage from './pages/MaintenancePage';
import ReportsPage from './pages/ReportsPage';
import './App.css';

// Settings page wrapper that checks for any sub-permission
const SettingsPagePermissionWrapper: React.FC = () => {
  const { hasPermission, user, permissions } = useAuth();
  
  console.log('?? SettingsWrapper: Checking permissions...');
  console.log('?? SettingsWrapper: User:', user?.email);
  console.log('?? SettingsWrapper: Total permissions:', permissions?.length || 0);
  
  // Check if user is Super Admin (always has access)
  const isSuperAdmin = user?.roles?.some(role => 
    role.roleName === 'Super Admin' || role.roleName === 'SuperAdmin'
  ) || false;
  
  if (isSuperAdmin) {
    console.log('? SettingsWrapper: Super Admin access granted');
    return <SettingsPage />;
  }
  
  // Check each permission individually
  const categoriesPermission = hasPermission('Categories', 'view');
  const departmentsPermission = hasPermission('Departments', 'view');
  const employeesPermission = hasPermission('Employees', 'view');
  const warehousesPermission = hasPermission('Warehouses', 'view');
  const assetsPermission = hasPermission('Assets', 'view');
  
  console.log('?? SettingsWrapper: Individual permissions:');
  console.log('  - Categories.view:', categoriesPermission);
  console.log('  - Departments.view:', departmentsPermission);
  console.log('  - Employees.view:', employeesPermission);
  console.log('  - Warehouses.view:', warehousesPermission);
  console.log('  - Assets.view (for statuses):', assetsPermission);
  
  // Check if user has any settings-related permission
  const hasAnySettingsPermission = 
    categoriesPermission ||
    departmentsPermission ||
    employeesPermission ||
    warehousesPermission ||
    assetsPermission; // For asset statuses
  
  console.log('?? SettingsWrapper: Has any settings permission:', hasAnySettingsPermission);
  
  if (hasAnySettingsPermission) {
    console.log('? SettingsWrapper: Access granted - user has at least one settings permission');
    return <SettingsPage />;
  }
  
  console.log('? SettingsWrapper: Access denied - no settings permissions found');
  
  // No access - show access denied
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <h2 style={{ color: '#ff4d4f' }}>?? Access Denied</h2>
      <p>You don't have permission to access this section.</p>
      <p>Required: Any of Categories.view, Departments.view, Employees.view, Warehouses.view, or Assets.view</p>
      <p style={{ fontSize: '12px', color: '#999' }}>
        User: {user?.email} | Roles: {user?.roles?.map(r => r.roleName).join(', ')}
      </p>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <ConfigProvider 
        direction="rtl"
        theme={{
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 6,
          },
        }}
      >
        <AntdApp>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AntdApp>
      </ConfigProvider>
    </AuthProvider>
  );
}

// Separate component for routes to use AuthContext
function AppRoutes() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {isAuthenticated ? (
        <>
          <Route path="/dashboard" element={
            <PermissionGuard screenName="Dashboard" action="view">
              <DashboardPage />
            </PermissionGuard>
          } />
          
          <Route path="/assets" element={
            <PermissionGuard screenName="Assets" action="view">
              <AssetsPage />
            </PermissionGuard>
          } />
          
          <Route path="/assets/add" element={
            <PermissionGuard screenName="Assets" action="insert">
              <AddAssetPage />
            </PermissionGuard>
          } />
          
          <Route path="/assets/:id" element={
            <PermissionGuard screenName="Assets" action="view">
              <AssetDetailsPage />
            </PermissionGuard>
          } />
          
          <Route path="/assets/:id/edit" element={
            <PermissionGuard screenName="Assets" action="update">
              <EditAssetPage />
            </PermissionGuard>
          } />
          
          <Route path="/categories" element={
            <PermissionGuard screenName="Categories" action="view">
              <SettingsPage />
            </PermissionGuard>
          } />
          
          <Route path="/departments" element={
            <PermissionGuard screenName="Departments" action="view">
              <SettingsPage />
            </PermissionGuard>
          } />
          
          <Route path="/employees" element={
            <PermissionGuard screenName="Employees" action="view">
              <SettingsPage />
            </PermissionGuard>
          } />
          
          <Route path="/warehouses" element={
            <PermissionGuard screenName="Warehouses" action="view">
              <SettingsPage />
            </PermissionGuard>
          } />
          
          <Route path="/statuses" element={
            <PermissionGuard screenName="Assets" action="view">
              <SettingsPage />
            </PermissionGuard>
          } />
          
          {/* Main settings route - uses custom permission wrapper */}
          <Route path="/settings" element={<SettingsPagePermissionWrapper />} />
          
          <Route path="/transfers" element={
            <PermissionGuard screenName="Transfers" action="view">
              <TransfersPage />
            </PermissionGuard>
          } />
          
          <Route path="/transfers/new" element={
            <PermissionGuard screenName="Transfers" action="insert">
              <NewTransferPage />
            </PermissionGuard>
          } />
          
          <Route path="/transfers/:id" element={
            <PermissionGuard screenName="Transfers" action="view">
              <TransferDetailsPage />
            </PermissionGuard>
          } />
          
          <Route path="/disposal" element={
            <PermissionGuard screenName="Disposal" action="view">
              <DisposalsPage />
            </PermissionGuard>
          } />
          
          <Route path="/maintenance" element={
            <PermissionGuard screenName="Maintenance" action="view">
              <MaintenancePage />
            </PermissionGuard>
          } />
          
          <Route path="/reports" element={
            <PermissionGuard screenName="Reports" action="view">
              <ReportsPage />
            </PermissionGuard>
          } />
          
          {/* Security Management Routes */}
          <Route 
            path="/users" 
            element={
              <PermissionGuard screenName="Users" action="view">
                <UserManagement />
              </PermissionGuard>
            } 
          />
          
          <Route 
            path="/permissions" 
            element={
              <PermissionGuard screenName="Permissions" action="view">
                <RolePermissionsPage />
              </PermissionGuard>
            } 
          />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}

export default App;
