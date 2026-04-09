import React, { useState, useEffect } from 'react';
import { Card, Table, Switch, Button, Select, Space, message, Spin, Typography } from 'antd';
import { SecurityScanOutlined, SaveOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { permissionsAPI } from '../api/securityApi';
import MainLayout from '../components/MainLayout';

const { Title } = Typography;
const { Option } = Select;

interface ScreenPermission {
  screenName: string;
  allowView: boolean;
  allowInsert: boolean;
  allowUpdate: boolean;
  allowDelete: boolean;
}

interface Role {
  roleId: number;
  roleName: string;
  isActive: boolean;
}

interface RolePermissions {
  roleId: number;
  roleName: string;
  permissions: ScreenPermission[];
}

const RolePermissionsPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [rolePermissions, setRolePermissions] = useState<RolePermissions | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const { hasPermission } = useAuth();

  // ????? ??????? ??????? ?? ??????
  const availableScreens = [
    'Dashboard',
    'Assets', 
    'Categories',
    'Statuses',
    'Warehouses',
    'Departments',
    'Employees',
    'Transfers',
    'Disposals', 
    'Maintenance',
    'Reports',
    'Settings',
    'Users',
    'Permissions'
  ];

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await permissionsAPI.getRoles();
      if (response.success) {
        setRoles(response.data || []);
      }
    } catch (error) {
      message.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const loadRolePermissions = async (roleId: number) => {
    try {
      setLoading(true);
      
      // ????? ?? ????? ??????
      const selectedRole = roles.find(r => r.roleId === roleId);
      if (!selectedRole) {
        message.error('Role not found');
        return;
      }

      // ????? ??????? ????? (??? ???? ?????? ?? API)
      try {
        const response = await permissionsAPI.getRolePermissions(roleId);
        if (response.success && response.data) {
          setRolePermissions({
            roleId: roleId,
            roleName: selectedRole.roleName,
            permissions: response.data
          });
        } else {
          // ????? ??????? ???????? ??? ?? ??? ??????
          createDefaultPermissions(roleId, selectedRole.roleName);
        }
      } catch (error) {
        // ??? ?? ??? endpoint ????? ???? ??????? ????????
        createDefaultPermissions(roleId, selectedRole.roleName);
      }
    } catch (error) {
      message.error('Failed to load role permissions');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPermissions = (roleId: number, roleName: string) => {
    const defaultPermissions: ScreenPermission[] = availableScreens.map(screen => ({
      screenName: screen,
      allowView: roleName === 'Super Admin' || roleName === 'Admin', // ??????? ??????
      allowInsert: roleName === 'Super Admin' || roleName === 'Admin',
      allowUpdate: roleName === 'Super Admin' || roleName === 'Admin',
      allowDelete: roleName === 'Super Admin'
    }));

    setRolePermissions({
      roleId,
      roleName,
      permissions: defaultPermissions
    });
  };

  const handlePermissionChange = (screenName: string, action: string, value: boolean) => {
    if (!rolePermissions) return;

    const updatedPermissions = rolePermissions.permissions.map(permission => 
      permission.screenName === screenName 
        ? { ...permission, [action]: value }
        : permission
    );

    setRolePermissions({
      ...rolePermissions,
      permissions: updatedPermissions
    });
  };

  const saveRolePermissions = async () => {
    if (!rolePermissions) return;

    try {
      setSaving(true);
      
      // ??? ????????? (????? ????? endpoint ?? API)
      const response = await permissionsAPI.updateRolePermissions(
        rolePermissions.roleId, 
        rolePermissions.permissions
      );
      
      if (response.success) {
        message.success('Role permissions updated successfully');
      } else {
        message.error('Failed to update role permissions');
      }
    } catch (error) {
      message.error('Failed to save permissions');
      console.error('Error saving permissions:', error);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: 'Screen Name',
      dataIndex: 'screenName',
      key: 'screenName',
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: 'View',
      key: 'allowView',
      render: (record: ScreenPermission) => (
        <Switch 
          checked={record.allowView}
          onChange={(value) => handlePermissionChange(record.screenName, 'allowView', value)}
          size="small"
        />
      )
    },
    {
      title: 'Insert',
      key: 'allowInsert', 
      render: (record: ScreenPermission) => (
        <Switch 
          checked={record.allowInsert}
          onChange={(value) => handlePermissionChange(record.screenName, 'allowInsert', value)}
          size="small"
        />
      )
    },
    {
      title: 'Update',
      key: 'allowUpdate',
      render: (record: ScreenPermission) => (
        <Switch 
          checked={record.allowUpdate} 
          onChange={(value) => handlePermissionChange(record.screenName, 'allowUpdate', value)}
          size="small"
        />
      )
    },
    {
      title: 'Delete',
      key: 'allowDelete',
      render: (record: ScreenPermission) => (
        <Switch 
          checked={record.allowDelete}
          onChange={(value) => handlePermissionChange(record.screenName, 'allowDelete', value)}
          size="small"
        />
      )
    }
  ];

  if (!hasPermission('Permissions', 'view')) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p className="text-red-500">You don't have permission to access this page.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <Title level={2} className="mb-0">
              <SecurityScanOutlined className="mr-2" />
              Role Permissions Management
            </Title>
          </div>

          <div className="mb-6">
            <Space>
              <span className="font-medium">Select Role:</span>
              <Select
                style={{ width: 200 }}
                placeholder="Choose a role"
                value={selectedRoleId}
                onChange={(value) => {
                  setSelectedRoleId(value);
                  if (value) {
                    loadRolePermissions(value);
                  } else {
                    setRolePermissions(null);
                  }
                }}
                loading={loading}
              >
                {roles.map(role => (
                  <Option key={role.roleId} value={role.roleId}>
                    {role.roleName}
                  </Option>
                ))}
              </Select>
            </Space>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <Spin size="large" />
              <p className="mt-4">Loading permissions...</p>
            </div>
          ) : rolePermissions ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <Title level={4} className="mb-0">
                  Permissions for: <span className="text-blue-600">{rolePermissions.roleName}</span>
                </Title>
                
                {hasPermission('Permissions', 'update') && (
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={saving}
                    onClick={saveRolePermissions}
                  >
                    Save Permissions
                  </Button>
                )}
              </div>

              <Table
                columns={columns}
                dataSource={rolePermissions.permissions}
                rowKey="screenName"
                pagination={false}
                bordered
                size="middle"
              />

              <div className="mt-4 text-sm text-gray-600">
                <p><strong>Note:</strong> Changes will be applied to all users with this role.</p>
                <p>• <strong>View:</strong> Can see the screen/data</p>
                <p>• <strong>Insert:</strong> Can create new records</p>
                <p>• <strong>Update:</strong> Can modify existing records</p>
                <p>• <strong>Delete:</strong> Can remove records</p>
              </div>
            </div>
          ) : selectedRoleId ? (
            <div className="text-center py-8">
              <p>No permissions data found for the selected role.</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Please select a role to manage its permissions.</p>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default RolePermissionsPage;