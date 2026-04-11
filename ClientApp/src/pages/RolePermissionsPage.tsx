import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { permissionsAPI } from '../api/securityApi';
import MainLayout from '../components/MainLayout';

// Inline styles for beautiful table design
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
    flexWrap: 'wrap',
    gap: '16px'
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
    margin: '24px 32px 0 32px'
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

  // Available screens in the system - Updated to match database
  const availableScreens = [
    'Dashboard', 'Assets', 'Categories', 'Departments', 'Employees', 'Warehouses', 
    'Transfers', 'Disposal', 'Maintenance', 'Reports', 'Users', 'Permissions'
  ];

  const getScreenIcon = (screenName: string) => {
    const icons: {[key: string]: string} = {
      'Dashboard': '📊', 'Assets': '💻', 'Categories': '📂', 'Statuses': '☑',
      'Warehouses': '🏪', 'Departments': '🏛', 'Employees': '👥', 'Transfers': '🔄',
      'Disposals': '🗑', 'Maintenance': '🔧', 'Reports': '📄', 'Settings': '⚙',
      'Users': '👤', 'Permissions': '🔒'
    };
    return icons[screenName] || '📝';
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
      setMessage({type: 'error', text: 'فشل تحميل الأدوار'});
    } finally {
      setLoading(false);
    }
  };

  const loadRolePermissions = async (roleId: number) => {
    try {
      setLoading(true);
      
      const selectedRole = roles.find(r => r.roleId === roleId);
      if (!selectedRole) {
        setMessage({type: 'error', text: 'لم يتم العثور على الدور'});
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
      setMessage({type: 'error', text: 'فشل تحميل صلاحيات الدور'});
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
      setMessage(null); // Clear previous messages
      
      console.log('Saving permissions for role:', rolePermissions.roleName);
      console.log('Permissions data:', rolePermissions.permissions);
      
      const response = await permissionsAPI.updateRolePermissions(
        rolePermissions.roleId, 
        rolePermissions.permissions
      );
      
      console.log('? Save response:', response);
      
      if (response.success) {
        setMessage({type: 'success', text: `تم تحديث صلاحيات ${rolePermissions.roleName} بنجاح! ✅`});
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setMessage(null);
        }, 5000);
        
      } else {
        setMessage({type: 'error', text: response.message || 'فشل تحديث صلاحيات الدور'});
      }
    } catch (error: any) {
      console.error('? Error saving permissions:', error);
      
      let errorMessage = 'فشل حفظ الصلاحيات. ';
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.response?.status === 403) {
        errorMessage += 'ليس لديك صلاحية لتعديل صلاحيات الأدوار.';
      } else if (error.response?.status === 404) {
        errorMessage += 'لم يتم العثور على الدور.';
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'يرجى المحاولة مرة أخرى أو الاتصال بالدعم.';
      }
      
      setMessage({type: 'error', text: errorMessage});
    } finally {
      setSaving(false);
    }
  };

  const ToggleSwitch = ({ checked, onChange, color = '#7c3aed' }: { checked: boolean, onChange: (value: boolean) => void, color?: string }) => (
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
        backgroundColor: checked ? color : '#cbd5e0',
        borderRadius: '24px',
        transition: 'all 0.3s ease',
        boxShadow: checked ? `0 2px 8px ${color}40` : 'none'
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
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
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
              ⚠
            </div>
            <h3 style={{fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '8px'}}>تم رفض الوصول</h3>
            <p style={{color: '#6b7280'}}>ليس لديك صلاحية للوصول إلى إدارة صلاحيات الأدوار.</p>
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
            <span style={{color: '#374151', fontWeight: '500'}}>جاري تحميل الأدوار...</span>
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
              <h1 style={styles.headerTitle}>إدارة صلاحيات الأدوار</h1>
              <p style={styles.headerSubtitle}>تكوين صلاحيات الوصول لكل دور في النظام باستخدام واجهة الجدول الجميلة</p>
              <div style={styles.statsContainer}>
                <div style={styles.statItem}>
                  <div style={{...styles.statDot, backgroundColor: '#10b981'}}></div>
                  <span>{roles.filter(r => r.isActive).length} دور نشط</span>
                </div>
                <div style={styles.statItem}>
                  <div style={{...styles.statDot, backgroundColor: '#f59e0b'}}></div>
                  <span>{availableScreens.length} شاشات النظام</span>
                </div>
                <div style={styles.statItem}>
                  <div style={{...styles.statDot, backgroundColor: '#8b5cf6'}}></div>
                  <span>4 أنواع صلاحيات</span>
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
            <span style={{fontSize: '18px'}}>{message.type === 'success' ? '✓' : '⚠'}</span>
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
              ✕
            </button>
          </div>
        )}

        {/* Role Selection */}
        <div style={styles.roleSelector}>
          <div style={styles.selectContainer}>
            <span style={styles.selectLabel}>اختر الدور:</span>
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
              <option value="">اختر دوراً للإدارة...</option>
              {roles.map(role => (
                <option key={role.roleId} value={role.roleId}>
                  {role.roleName} {role.isActive ? '✓' : '✗'}
                </option>
              ))}
            </select>
            {selectedRoleId && (
              <div style={{
                fontSize: '14px',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                إدارة الصلاحيات لـ: <strong style={{color: '#7c3aed'}}>{rolePermissions?.roleName}</strong>
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
            <p style={{color: '#6b7280', fontWeight: '500'}}>جاري تحميل الصلاحيات...</p>
          </div>
        ) : rolePermissions ? (
          <div style={styles.permissionsContainer}>
            {/* Permissions Header */}
            <div style={styles.permissionsHeader}>
              <div>
                <h3 style={{fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0'}}>
                  الصلاحيات لـ: <span style={{color: '#7c3aed'}}>{rolePermissions.roleName}</span>
                </h3>
                <p style={{fontSize: '14px', color: '#6b7280', margin: '0'}}>
                  استخدم الجدول الجميل أدناه لإدارة الصلاحيات بسهولة - انقر على مفاتيح التبديل للتفعيل/التعطيل
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
                  <span style={{fontSize: '16px'}}>{saving ? '⏳' : '💾'}</span>
                  <span>{saving ? 'جاري الحفظ...' : 'حفظ الصلاحيات'}</span>
                </button>
              )}
            </div>

            {/* Beautiful Permissions Table */}
            <div style={{padding: '32px'}}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid #e5e7eb'
              }}>
                {/* Table Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                  gap: '0',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  <div style={{
                    padding: '20px 24px',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderRight: '1px solid #e5e7eb'
                  }}>
                    <span style={{fontSize: '18px'}}>📱</span>
                    <span>الشاشة / الوحدة</span>
                  </div>
                  <div style={{
                    padding: '20px 24px',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#1d4ed8',
                    textAlign: 'center',
                    borderRight: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}>
                    <span>???</span>
                    <span>عرض</span>
                  </div>
                  <div style={{
                    padding: '20px 24px',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#16a34a',
                    textAlign: 'center',
                    borderRight: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}>
                    <span>?</span>
                    <span>إضافة</span>
                  </div>
                  <div style={{
                    padding: '20px 24px',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#d97706',
                    textAlign: 'center',
                    borderRight: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}>
                    <span>??</span>
                    <span>تعديل</span>
                  </div>
                  <div style={{
                    padding: '20px 24px',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#dc2626',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}>
                    <span>???</span>
                    <span>حذف</span>
                  </div>
                </div>

                {/* Table Rows */}
                {rolePermissions.permissions.map((permission, index) => (
                  <div
                    key={permission.screenName}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                      gap: '0',
                      borderBottom: index < rolePermissions.permissions.length - 1 ? '1px solid #f1f5f9' : 'none',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#eff6ff';
                      e.currentTarget.style.transform = 'scale(1.002)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8fafc';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {/* Screen Name Column */}
                    <div style={{
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      borderRight: '1px solid #f1f5f9'
                    }}>
                      <span style={{fontSize: '24px'}}>{getScreenIcon(permission.screenName)}</span>
                      <div>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#1f2937',
                          margin: '0 0 2px 0'
                        }}>
                          {permission.screenName}
                        </h4>
                        <p style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          margin: '0'
                        }}>
                          وحدة النظام
                        </p>
                      </div>
                    </div>

                    {/* View Permission Column */}
                    <div style={{
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRight: '1px solid #f1f5f9'
                    }}>
                      <ToggleSwitch
                        checked={permission.allowView}
                        onChange={(value) => handlePermissionChange(permission.screenName, 'allowView', value)}
                        color="#1d4ed8"
                      />
                    </div>

                    {/* Insert Permission Column */}
                    <div style={{
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRight: '1px solid #f1f5f9'
                    }}>
                      <ToggleSwitch
                        checked={permission.allowInsert}
                        onChange={(value) => handlePermissionChange(permission.screenName, 'allowInsert', value)}
                        color="#16a34a"
                      />
                    </div>

                    {/* Update Permission Column */}
                    <div style={{
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRight: '1px solid #f1f5f9'
                    }}>
                      <ToggleSwitch
                        checked={permission.allowUpdate}
                        onChange={(value) => handlePermissionChange(permission.screenName, 'allowUpdate', value)}
                        color="#d97706"
                      />
                    </div>

                    {/* Delete Permission Column */}
                    <div style={{
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ToggleSwitch
                        checked={permission.allowDelete}
                        onChange={(value) => handlePermissionChange(permission.screenName, 'allowDelete', value)}
                        color="#dc2626"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div style={{
                marginTop: '24px',
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap' as const
              }}>
                <button
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#dbeafe',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onClick={() => {
                    const updatedPermissions = rolePermissions.permissions.map(p => ({
                      ...p,
                      allowView: true,
                      allowInsert: true,
                      allowUpdate: true,
                      allowDelete: true
                    }));
                    setRolePermissions({ ...rolePermissions, permissions: updatedPermissions });
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#bfdbfe';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(29, 78, 216, 0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#dbeafe';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span style={{fontSize: '16px'}}>?</span>
                  <span>تمكين جميع الصلاحيات</span>
                </button>

                <button
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onClick={() => {
                    const updatedPermissions = rolePermissions.permissions.map(p => ({
                      ...p,
                      allowView: false,
                      allowInsert: false,
                      allowUpdate: false,
                      allowDelete: false
                    }));
                    setRolePermissions({ ...rolePermissions, permissions: updatedPermissions });
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#fecaca';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(220, 38, 38, 0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#fee2e2';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span style={{fontSize: '16px'}}>?</span>
                  <span>تعطيل جميع الصلاحيات</span>
                </button>

                <button
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#dcfce7',
                    color: '#16a34a',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onClick={() => {
                    const updatedPermissions = rolePermissions.permissions.map(p => ({
                      ...p,
                      allowView: true,
                      allowInsert: false,
                      allowUpdate: false,
                      allowDelete: false
                    }));
                    setRolePermissions({ ...rolePermissions, permissions: updatedPermissions });
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#bbf7d0';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(22, 163, 74, 0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#dcfce7';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span style={{fontSize: '16px'}}>???</span>
                  <span>وضع العرض فقط</span>
                </button>
              </div>
            </div>

            {/* Info Box */}
            <div style={styles.infoBox}>
              <h4 style={{fontSize: '16px', fontWeight: '600', color: '#1e40af', margin: '0 0 12px 0'}}>
                ?? إدارة صلاحيات الجدول الجميل:
              </h4>
              <div style={{fontSize: '13px', color: '#1e3a8a', lineHeight: '1.6'}}>
                <p style={{margin: '0 0 8px 0'}}>
                  <strong>?? Important:</strong> All changes will be applied to users with the <strong>{rolePermissions.roleName}</strong> role.
                </p>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginTop: '12px'}}>
                  <div><strong>??? View:</strong> Access to see the screen/data</div>
                  <div><strong>? Insert:</strong> Permission to create new records</div>
                  <div><strong>?? Update:</strong> Permission to modify existing records</div>
                  <div><strong>??? Delete:</strong> Permission to remove records</div>
                </div>
                <p style={{margin: '12px 0 0 0', padding: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)'}}>
                  <strong>?? How to use:</strong> Simply click the toggle switches in the table to enable/disable permissions. Use quick action buttons for bulk operations. Don't forget to <strong>Save Permissions</strong> when done!
                </p>
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
            <h3 style={{fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px'}}>لم يتم العثور على بيانات الصلاحيات</h3>
            <p style={{color: '#6b7280'}}>غير قادر على تحميل الصلاحيات للدور المحدد. يرجى المحاولة مرة أخرى.</p>
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
            <h3 style={{fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px'}}>اختر دوراً للإدارة</h3>
            <p style={{color: '#6b7280'}}>اختر دوراً من القائمة المنسدلة أعلاه لعرض وتعديل صلاحياته في واجهة الجدول الجميل.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RolePermissionsPage;