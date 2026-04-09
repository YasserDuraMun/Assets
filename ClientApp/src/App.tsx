import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/assets/add" element={<AddAssetPage />} />
          <Route path="/assets/:id" element={<AssetDetailsPage />} />
          <Route path="/assets/:id/edit" element={<EditAssetPage />} />
          <Route path="/transfers" element={<TransfersPage />} />
          <Route path="/transfers/new" element={<NewTransferPage />} />
          <Route path="/transfers/:id" element={<TransferDetailsPage />} />
          <Route path="/disposals" element={<DisposalsPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          
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
