import { Tabs, Card } from 'antd';
import { SettingOutlined, TagsOutlined, AppstoreOutlined, ApartmentOutlined, ShopOutlined, UserOutlined } from '@ant-design/icons';
import MainLayout from '../components/MainLayout';
import AssetStatusesPage from './settings/AssetStatusesPage';
import CategoriesPage from './settings/CategoriesPage';
import DepartmentsPage from './settings/DepartmentsPage';
import WarehousesPage from './settings/WarehousesPage';
import EmployeesPage from './settings/EmployeesPage';

export default function SettingsPage() {
  const items = [
    {
      key: 'statuses',
      label: (
        <span>
          <TagsOutlined /> حالات الأصول
        </span>
      ),
      children: <AssetStatusesPage />,
    },
    {
      key: 'categories',
      label: (
        <span>
          <AppstoreOutlined /> الفئات والفئات الفرعية
        </span>
      ),
      children: <CategoriesPage />,
    },
    {
      key: 'departments',
      label: (
        <span>
          <ApartmentOutlined /> الإدارات والأقسام
        </span>
      ),
      children: <DepartmentsPage />,
    },
    {
      key: 'employees',
      label: (
        <span>
          <UserOutlined /> الموظفون
        </span>
      ),
      children: <EmployeesPage />,
    },
    {
      key: 'warehouses',
      label: (
        <span>
          <ShopOutlined /> المستودعات
        </span>
      ),
      children: <WarehousesPage />,
    },
  ];

  return (
    <MainLayout>
      <Card
        title={
          <span>
            <SettingOutlined /> إعدادات النظام
          </span>
        }
      >
        <Tabs items={items} />
      </Card>
    </MainLayout>
  );
}


