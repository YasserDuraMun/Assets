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
  const { hasPermission, user } = useAuth();
  
  console.log('?? SettingsWrapper: Checking permissions...');
  
  // Check if user is Super Admin (always has access)
  const isSuperAdmin = user?.roles?.some(role => 
    role.roleName === 'Super Admin' || role.roleName === 'SuperAdmin'
  ) || false;
  
  if (isSuperAdmin) {
    console.log('? SettingsWrapper: Super Admin access granted');
    return <SettingsPage />;
  }
  
  // Check if user has any settings-related permission
  const hasAnySettingsPermission = 
    hasPermission('Categories', 'view') ||
    hasPermission('Departments', 'view') ||
    hasPermission('Employees', 'view') ||
    hasPermission('Warehouses', 'view') ||
    hasPermission('Assets', 'view'); // For asset statuses
  
  console.log('?? SettingsWrapper: Has any settings permission:', hasAnySettingsPermission);
  
  if (hasAnySettingsPermission) {
    return <SettingsPage />;
  }
  
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
          
          <Route path="/settings" element={
            <PermissionGuard screenName="Settings" action="view">
              <SettingsPage />
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
              <SettingsPage defaultTab="categories" />
            </PermissionGuard>
          } />
          
          <Route path="/departments" element={
            <PermissionGuard screenName="Departments" action="view">
              <SettingsPage defaultTab="departments" />
            </PermissionGuard>
          } />
          
          <Route path="/employees" element={
            <PermissionGuard screenName="Employees" action="view">
              <SettingsPage defaultTab="employees" />
            </PermissionGuard>
          } />
          
          <Route path="/warehouses" element={
            <PermissionGuard screenName="Warehouses" action="view">
              <SettingsPage defaultTab="warehouses" />
            </PermissionGuard>
          } />
          
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
