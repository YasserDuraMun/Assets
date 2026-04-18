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
  TeamOutlined,
  SafetyOutlined,
  AppstoreOutlined
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
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'الإعدادات',
      children: [
        {
          key: '/settings?tab=categories',
          label: 'الفئات والفئات الفرعية',
          onClick: () => navigate('/settings?tab=categories'),
          permission: 'Categories',
          action: 'view' as const,
          icon: <AppstoreOutlined />
        },
        {
          key: '/settings?tab=departments',
          label: 'الإدارات والأقسام',
          onClick: () => navigate('/settings?tab=departments'),
          permission: 'Departments',
          action: 'view' as const,
          icon: <ApartmentOutlined />
        },
        {
          key: '/settings?tab=employees',
          label: 'الموظفون',
          onClick: () => navigate('/settings?tab=employees'),
          permission: 'Employees',
          action: 'view' as const,
          icon: <UserOutlined />
        },
        {
          key: '/settings?tab=warehouses',
          label: 'المستودعات',
          onClick: () => navigate('/settings?tab=warehouses'),
          permission: 'Warehouses',
          action: 'view' as const,
          icon: <ShopOutlined />
        },
        {
          key: '/settings?tab=statuses',
          label: 'حالات الأصول',
          onClick: () => navigate('/settings?tab=statuses'),
          permission: 'Assets',
          action: 'view' as const,
          icon: <SafetyOutlined />
        }
      ]
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
      label: 'إدارة المستخدمين',
      onClick: () => navigate('/users'),
      permission: 'Users',
      action: 'view' as const
    },
    {
      key: '/permissions',
      icon: <SafetyOutlined />,
      label: 'إدارة الأدوار والصلاحيات',
      onClick: () => navigate('/permissions'),
      permission: 'Permissions',
      action: 'view' as const
    }
  ];

  // فلترة عناصر القائمة بناءً على الصلاحيات
  const buildMenuItems = (items: typeof allMenuItems): any[] => {
    return items.filter(item => {
      // للإعدادات: اظهرها إذا كان المستخدم له صلاحية على أي من التبويبات الفرعية
      if (item.key === 'settings' && item.children) {
        const hasAnySubPermission = item.children.some(child => 
          hasPermission(child.permission, child.action)
        );
        console.log(`🔍 Settings dropdown access check: Has any sub-permission = ${hasAnySubPermission}`);
        return hasAnySubPermission;
      }
      
      // للعناصر الأخرى: فحص الصلاحية العادية
      if (!item.permission || !item.action) return true; // إذا لم تكن هناك صلاحية مطلوبة
      const canAccess = hasPermission(item.permission, item.action);
      console.log(`🔍 Menu access check: ${item.permission}.${item.action} = ${canAccess}`);
      return canAccess;
    }).map(item => {
      const menuItem: any = {
        key: item.key,
        icon: item.icon,
        label: item.label,
        onClick: item.onClick
      };

      // إذا كان العنصر يحتوي على عناصر فرعية (مثل الإعدادات)
      if (item.children) {
        const filteredChildren = item.children.filter(child => 
          hasPermission(child.permission, child.action)
        ).map(child => ({
          key: child.key,
          label: child.label,
          onClick: child.onClick,
          icon: child.icon
        }));

        if (filteredChildren.length > 0) {
          menuItem.children = filteredChildren;
          // حذف onClick من العنصر الأب للـ dropdown
          delete menuItem.onClick;
        }
      }

      return menuItem;
    });
  };

  const menuItems = buildMenuItems(allMenuItems);

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
          defaultOpenKeys={['settings']} // فتح قائمة الإعدادات افتراضياً
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
              مرحباً، {user?.fullName || 'مستخدم'}
            </Typography.Text>
            <Button
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              danger
            >
              تسجيل الخروج
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
