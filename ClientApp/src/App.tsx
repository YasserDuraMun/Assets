import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
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
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };

    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  return (
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
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/login" replace />} />
            )}
          </Routes>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
