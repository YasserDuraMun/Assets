import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { permissionsAPI } from '../api/securityApi';
import MainLayout from '../components/MainLayout';

// Inline styles for beautiful design
const styles = {
  container: {
    padding: '24px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh'
  },
  gradientHeader: {
    background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
    borderRadius: '16px',
    color: 'white',
    padding: '32px',
    boxShadow: '0 8px 32px rgba(124, 58, 237, 0.3)',
    marginBottom: '32px'
  },
  headerTitle: {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '8px'
  },
  headerSubtitle: {
    fontSize: '16px',
    opacity: '0.9',
    marginBottom: '24px'
  },
  statsContainer: {
    display: 'flex',
    gap: '32px',
    flexWrap: 'wrap'
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  statDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  roleSelector: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e5e7eb',
    marginBottom: '32px'
  },
  selectContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap'
  },
  selectLabel: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151'
  },
  select: {
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    minWidth: '200px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  permissionsContainer: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden'
  },
  permissionsHeader: {
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    padding: '24px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '16px'
  },
  permissionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
    padding: '32px'
  },
  permissionCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.3s ease'
  },
  cardHeader: {
    padding: '16px 20px',
    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  cardBody: {
    padding: '20px'
  },
  permissionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #f1f5f9'
  },
  permissionLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  saveButton: {
    padding: '14px 28px',
    background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 16px rgba(124, 58, 237, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  infoBox: {
    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    padding: '20px',
    marginTop: '24px'
  }
};

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
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const { hasPermission } = useAuth();

  // Available screens in the system
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

  const getScreenIcon = (screenName: string) => {
    const icons: {[key: string]: string} = {
      'Dashboard': '??',
      'Assets': '??',
      'Categories': '??',
      'Statuses': '???',
      'Warehouses': '??',
      'Departments': '???',
      'Employees': '??',
      'Transfers': '??',
      'Disposals': '???',
      'Maintenance': '??',
      'Reports': '??',
      'Settings': '??',
      'Users': '??',
      'Permissions': '???'
    };
    return icons[screenName] || '??';
  };

  const getPermissionColor = (permission: string, enabled: boolean) => {
    if (!enabled) return { bg: '#f1f5f9', color: '#64748b' };
    
    const colors: {[key: string]: {bg: string, color: string}} = {
      'allowView': { bg: '#dbeafe', color: '#1d4ed8' },
      'allowInsert': { bg: '#dcfce7', color: '#16a34a' },
      'allowUpdate': { bg: '#fef3c7', color: '#d97706' },
      'allowDelete': { bg: '#fecaca', color: '#dc2626' }
    };
    return colors[permission] || { bg: '#f3f4f6', color: '#374151' };
  };

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
      setMessage({type: 'error', text: 'Failed to load roles'});
    } finally {
      setLoading(false);
    }
  };

  const loadRolePermissions = async (roleId: number) => {
    try {
      setLoading(true);
      
      const selectedRole = roles.find(r => r.roleId === roleId);
      if (!selectedRole) {
        setMessage({type: 'error', text: 'Role not found'});
        return;
      }

      try {
        const response = await permissionsAPI.getRolePermissions(roleId);
        if (response.success && response.data) {
          setRolePermissions({
            roleId: roleId,
            roleName: selectedRole.roleName,
            permissions: response.data
          });
        } else {
          createDefaultPermissions(roleId, selectedRole.roleName);
        }
      } catch (error) {
        createDefaultPermissions(roleId, selectedRole.roleName);
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Failed to load role permissions'});
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPermissions = (roleId: number, roleName: string) => {
    const defaultPermissions: ScreenPermission[] = availableScreens.map(screen => ({
      screenName: screen,
      allowView: roleName === 'SuperAdmin' || roleName === 'Admin',
      allowInsert: roleName === 'SuperAdmin' || roleName === 'Admin',
      allowUpdate: roleName === 'SuperAdmin' || roleName === 'Admin',
      allowDelete: roleName === 'SuperAdmin'
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
      
      const response = await permissionsAPI.updateRolePermissions(
        rolePermissions.roleId, 
        rolePermissions.permissions
      );
      
      if (response.success) {
        setMessage({type: 'success', text: 'Role permissions updated successfully!'});
      } else {
        setMessage({type: 'error', text: 'Failed to update role permissions'});
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Failed to save permissions'});
      console.error('Error saving permissions:', error);
    } finally {
      setSaving(false);
    }
  };

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: (value: boolean) => void }) => (
    <label style={{
      position: 'relative',
      display: 'inline-block',
      width: '48px',
      height: '24px',
      cursor: 'pointer'
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ display: 'none' }}
      />
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: checked ? '#7c3aed' : '#cbd5e0',
        borderRadius: '24px',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          position: 'absolute',
          content: '""',
          height: '20px',
          width: '20px',
          left: checked ? '26px' : '2px',
          bottom: '2px',
          backgroundColor: 'white',
          borderRadius: '50%',
          transition: 'all 0.3s ease'
        }}></div>
      </div>
    </label>
  );

  if (!hasPermission('Permissions', 'view')) {
    return (
      <MainLayout>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid #fecaca',
            maxWidth: '400px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#fef2f2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '32px'
            }}>
              ???
            </div>
            <h3 style={{fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '8px'}}>Access Denied</h3>
            <p style={{color: '#6b7280'}}>You don't have permission to access Role Permissions Management.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (loading && roles.length === 0) {
    return (
      <MainLayout>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '24px 32px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid #e0e7ff'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: '3px solid #f3f4f6',
              borderTop: '3px solid #7c3aed',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span style={{color: '#374151', fontWeight: '500'}}>Loading Roles...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={styles.container}>
        {/* Beautiful Gradient Header */}
        <div style={styles.gradientHeader}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px'}}>
            <div>
              <h1 style={styles.headerTitle}>??? Role Permissions Management</h1>
              <p style={styles.headerSubtitle}>Configure access permissions for each role in the system</p>
              <div style={styles.statsContainer}>
                <div style={styles.statItem}>
                  <div style={{...styles.statDot, backgroundColor: '#10b981'}}></div>
                  <span>{roles.filter(r => r.isActive).length} Active Roles</span>
                </div>
                <div style={styles.statItem}>
                  <div style={{...styles.statDot, backgroundColor: '#f59e0b'}}></div>
                  <span>{availableScreens.length} System Screens</span>
                </div>
                <div style={styles.statItem}>
                  <div style={{...styles.statDot, backgroundColor: '#8b5cf6'}}></div>
                  <span>4 Permission Types</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {message && (
          <div style={{
            backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            borderLeft: `4px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
            color: message.type === 'success' ? '#065f46' : '#991b1b',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{fontSize: '18px'}}>{message.type === 'success' ? '?' : '??'}</span>
            <span>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                opacity: '0.7'
              }}
            >
              ??
            </button>
          </div>
        )}

        {/* Role Selection */}
        <div style={styles.roleSelector}>
          <div style={styles.selectContainer}>
            <span style={styles.selectLabel}>?? Select Role:</span>
            <select
              style={{
                ...styles.select,
                borderColor: selectedRoleId ? '#7c3aed' : '#e5e7eb'
              }}
              value={selectedRoleId || ''}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value) : null;
                setSelectedRoleId(value);
                if (value) {
                  loadRolePermissions(value);
                } else {
                  setRolePermissions(null);
                }
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#7c3aed';
                e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = selectedRoleId ? '#7c3aed' : '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">Choose a role to manage...</option>
              {roles.map(role => (
                <option key={role.roleId} value={role.roleId}>
                  {role.roleName} {role.isActive ? '??' : '??'}
                </option>
              ))}
            </select>
            {selectedRoleId && (
              <div style={{
                fontSize: '14px',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                Managing permissions for: <strong style={{color: '#7c3aed'}}>{rolePermissions?.roleName}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Permissions Display */}
        {loading && selectedRoleId ? (
          <div style={{
            textAlign: 'center',
            padding: '48px',
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #7c3aed',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{color: '#6b7280', fontWeight: '500'}}>Loading permissions...</p>
          </div>
        ) : rolePermissions ? (
          <div style={styles.permissionsContainer}>
            {/* Permissions Header */}
            <div style={styles.permissionsHeader}>
              <div>
                <h3 style={{fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0'}}>
                  ??? Permissions for: <span style={{color: '#7c3aed'}}>{rolePermissions.roleName}</span>
                </h3>
                <p style={{fontSize: '14px', color: '#6b7280', margin: '0'}}>
                  Configure what this role can access and modify
                </p>
              </div>
              
              {hasPermission('Permissions', 'update') && (
                <button
                  style={styles.saveButton}
                  onClick={saveRolePermissions}
                  disabled={saving}
                  onMouseOver={(e) => {
                    if (!saving) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(124, 58, 237, 0.4)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!saving) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(124, 58, 237, 0.3)';
                    }
                  }}
                >
                  <span style={{fontSize: '16px'}}>{saving ? '?' : '??'}</span>
                  <span>{saving ? 'Saving...' : 'Save Permissions'}</span>
                </button>
              )}
            </div>

            {/* Permissions Grid */}
            <div style={styles.permissionsGrid}>
              {rolePermissions.permissions.map((permission) => (
                <div
                  key={permission.screenName}
                  style={styles.permissionCard}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                    e.currentTarget.style.borderColor = '#c7d2fe';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  {/* Card Header */}
                  <div style={styles.cardHeader}>
                    <span style={{fontSize: '24px'}}>{getScreenIcon(permission.screenName)}</span>
                    <div>
                      <h4 style={{fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0'}}>
                        {permission.screenName}
                      </h4>
                      <p style={{fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0'}}>
                        Screen Access Control
                      </p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={styles.cardBody}>
                    <div style={styles.permissionRow}>
                      <div style={styles.permissionLabel}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          ...getPermissionColor('allowView', permission.allowView)
                        }}>
                          ??? VIEW
                        </span>
                        <span>Can see this screen</span>
                      </div>
                      <ToggleSwitch
                        checked={permission.allowView}
                        onChange={(value) => handlePermissionChange(permission.screenName, 'allowView', value)}
                      />
                    </div>

                    <div style={styles.permissionRow}>
                      <div style={styles.permissionLabel}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          ...getPermissionColor('allowInsert', permission.allowInsert)
                        }}>
                          ? INSERT
                        </span>
                        <span>Can create new records</span>
                      </div>
                      <ToggleSwitch
                        checked={permission.allowInsert}
                        onChange={(value) => handlePermissionChange(permission.screenName, 'allowInsert', value)}
                      />
                    </div>

                    <div style={styles.permissionRow}>
                      <div style={styles.permissionLabel}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          ...getPermissionColor('allowUpdate', permission.allowUpdate)
                        }}>
                          ?? UPDATE
                        </span>
                        <span>Can modify existing records</span>
                      </div>
                      <ToggleSwitch
                        checked={permission.allowUpdate}
                        onChange={(value) => handlePermissionChange(permission.screenName, 'allowUpdate', value)}
                      />
                    </div>

                    <div style={{...styles.permissionRow, borderBottom: 'none'}}>
                      <div style={styles.permissionLabel}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          ...getPermissionColor('allowDelete', permission.allowDelete)
                        }}>
                          ??? DELETE
                        </span>
                        <span>Can remove records</span>
                      </div>
                      <ToggleSwitch
                        checked={permission.allowDelete}
                        onChange={(value) => handlePermissionChange(permission.screenName, 'allowDelete', value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Info Box */}
            <div style={styles.infoBox}>
              <h4 style={{fontSize: '14px', fontWeight: '600', color: '#1e40af', margin: '0 0 12px 0'}}>
                ?? Permission Guidelines:
              </h4>
              <div style={{fontSize: '13px', color: '#1e3a8a', lineHeight: '1.6'}}>
                <p style={{margin: '0 0 8px 0'}}>
                  <strong>?? Important:</strong> Changes will be applied to all users with the <strong>{rolePermissions.roleName}</strong> role.
                </p>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginTop: '12px'}}>
                  <div><strong>??? View:</strong> Access to see the screen/data</div>
                  <div><strong>? Insert:</strong> Permission to create new records</div>
                  <div><strong>?? Update:</strong> Permission to modify existing records</div>
                  <div><strong>??? Delete:</strong> Permission to remove records</div>
                </div>
              </div>
            </div>
          </div>
        ) : selectedRoleId ? (
          <div style={{
            textAlign: 'center',
            padding: '48px',
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              width: '96px',
              height: '96px',
              backgroundColor: '#fef3c7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '48px'
            }}>
              ??
            </div>
            <h3 style={{fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px'}}>No permissions data found</h3>
            <p style={{color: '#6b7280'}}>Unable to load permissions for the selected role. Please try again.</p>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '48px',
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              width: '96px',
              height: '96px',
              backgroundColor: '#f3f4f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '48px'
            }}>
              ???
            </div>
            <h3 style={{fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px'}}>Select a Role to Manage</h3>
            <p style={{color: '#6b7280'}}>Choose a role from the dropdown above to configure its permissions.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RolePermissionsPage;