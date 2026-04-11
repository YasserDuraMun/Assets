import React, { useState, useEffect } from 'react';
import { Tabs, Card } from 'antd';
import { UserOutlined, SecurityScanOutlined } from '@ant-design/icons';
import MainLayout from '../components/MainLayout';
import UserManagement from '../components/UserManagement';
import RolePermissionsPage from './RolePermissionsPage';

const { TabPane } = Tabs;

const UserManagementTabs: React.FC = () => {
  return (
    <MainLayout>
      <Card>
        <Tabs defaultActiveKey="users" size="large">
          <TabPane 
            tab={
              <span>
                <UserOutlined />
                إدارة المستخدمين
              </span>
            } 
            key="users"
          >
            <UserManagement />
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <SecurityScanOutlined />
                صلاحيات الأدوار
              </span>
            } 
            key="permissions"
          >
            <RolePermissionsPage />
          </TabPane>
        </Tabs>
      </Card>
    </MainLayout>
  );
};

export default UserManagementTabs;