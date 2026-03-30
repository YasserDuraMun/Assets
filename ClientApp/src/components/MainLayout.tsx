import { type ReactNode, useState, useEffect } from 'react';
import { Layout, Menu, Button, Typography, Space } from 'antd';
import {
  DashboardOutlined,
  FileOutlined,
  UserOutlined,
  LogoutOutlined,
  ApartmentOutlined,
  ShopOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  SwapOutlined,
  DeleteOutlined,
  ToolOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../types';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
const [collapsed, setCollapsed] = useState(false);
const navigate = useNavigate();
const location = useLocation();
const { logout, user } = useAuth();
  
useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/login');
  }
}, [navigate]);

const handleLogout = () => {
  logout();
  navigate('/login');
};

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/dashboard')
    },
    {
      key: '/assets',
      icon: <FileOutlined />,
      label: 'Assets',
      onClick: () => navigate('/assets')
    },
    {
      key: '/transfers',
      icon: <SwapOutlined />,
      label: 'Transfers',
      onClick: () => navigate('/transfers')
    },
    {
      key: '/disposals',
      icon: <DeleteOutlined />,
      label: 'Disposed Assets',
      onClick: () => navigate('/disposals')
    },
    {
      key: '/maintenance',
      icon: <ToolOutlined />,
      label: 'Maintenance',
      onClick: () => navigate('/maintenance')
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
      onClick: () => navigate('/reports')
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings')
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Title level={4} style={{ margin: 0 }}>
            {collapsed ? 'AM' : 'Asset Management'}
          </Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ marginTop: 16 }}
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Header style={{
          padding: '0 24px',
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          />

          <Space>
            <Typography.Text strong>Welcome, {user?.fullName || 'User'}</Typography.Text>
            <Button
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              danger
            >
              Logout
            </Button>
          </Space>
        </Header>

        <Content style={{ margin: '24px', padding: 24, background: '#f0f2f5', minHeight: 280 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
