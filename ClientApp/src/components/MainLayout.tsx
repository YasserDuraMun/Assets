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
  BarChartOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
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
const { logout, user, hasPermission } = useAuth();
  
useEffect(() => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    navigate('/login');
  }
}, [navigate]);

const handleLogout = () => {
  logout();
  navigate('/login');
};

  // تعريف كافة عناصر القائمة مع شروط الصلاحيات
  const allMenuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'لوحة التحكم',
      onClick: () => navigate('/dashboard'),
      permission: 'Dashboard',
      action: 'view' as const
    },
    {
      key: '/assets',
      icon: <FileOutlined />,
      label: 'الأصول',
      onClick: () => navigate('/assets'),
      permission: 'Assets',
      action: 'view' as const
    },
    {
      key: '/categories',
      icon: <ApartmentOutlined />,
      label: 'التصنيفات',
      onClick: () => navigate('/categories'),
      permission: 'Categories',
      action: 'view' as const
    },
    {
      key: '/departments',
      icon: <ShopOutlined />,
      label: 'الأقسام',
      onClick: () => navigate('/departments'),
      permission: 'Departments',
      action: 'view' as const
    },
    {
      key: '/employees',
      icon: <TeamOutlined />,
      label: 'الموظفين',
      onClick: () => navigate('/employees'),
      permission: 'Employees',
      action: 'view' as const
    },
    {
      key: '/warehouses',
      icon: <ShopOutlined />,
      label: 'المخازن',
      onClick: () => navigate('/warehouses'),
      permission: 'Warehouses',
      action: 'view' as const
    },
    {
      key: '/transfers',
      icon: <SwapOutlined />,
      label: 'التحويلات',
      onClick: () => navigate('/transfers'),
      permission: 'Transfers',
      action: 'view' as const
    },
    {
      key: '/disposal',
      icon: <DeleteOutlined />,
      label: 'الأصول المستبعدة',
      onClick: () => navigate('/disposal'),
      permission: 'Disposal',
      action: 'view' as const
    },
    {
      key: '/maintenance',
      icon: <ToolOutlined />,
      label: 'الصيانة',
      onClick: () => navigate('/maintenance'),
      permission: 'Maintenance',
      action: 'view' as const
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: 'التقارير',
      onClick: () => navigate('/reports'),
      permission: 'Reports',
      action: 'view' as const
    },
    {
      key: '/users',
      icon: <TeamOutlined />,
      label: 'User Management',
      onClick: () => navigate('/users'),
      permission: 'Users',
      action: 'view' as const
    },
    {
      key: '/permissions',
      icon: <ApartmentOutlined />,
      label: 'Role Permissions',
      onClick: () => navigate('/permissions'),
      permission: 'Permissions',
      action: 'view' as const
    }
  ];

  // فلترة عناصر القائمة بناءً على الصلاحيات
  const menuItems = allMenuItems.filter(item => {
    const canAccess = hasPermission(item.permission, item.action);
    console.log(`🔍 Menu access check: ${item.permission}.${item.action} = ${canAccess}`);
    return canAccess;
  }).map(item => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
    onClick: item.onClick
  }));

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
            {collapsed ? 'إأ' : 'إدارة الأصول'}
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
            <Typography.Text strong>
              Welcome, {user?.fullName || 'User'}
            </Typography.Text>
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
