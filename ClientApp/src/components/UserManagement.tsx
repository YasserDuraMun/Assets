import React, { useState, useEffect } from 'react';
import { User, Role, CreateUserRequest, UpdateUserRequest } from '../types/security';
import { usersAPI, permissionsAPI } from '../api/securityApi';
import { useAuth } from '../hooks/useAuth';
import MainLayout from './MainLayout';

// Inline styles for beautiful design
const styles = {
  container: {
    padding: '24px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh'
  },
  gradientHeader: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    color: 'white',
    padding: '32px',
    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
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
  addButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  },
  searchContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e5e7eb',
    marginBottom: '32px'
  },
  searchInput: {
    width: '100%',
    maxWidth: '400px',
    padding: '12px 16px 12px 48px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    backgroundColor: '#f9fafb'
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px'
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    transition: 'all 0.3s ease'
  },
  cardHeader: {
    background: 'linear-gradient(135deg, #f7fafc 0%, #e2e8f0 100%)',
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb'
  },
  userAvatar: {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
  },
  cardBody: {
    padding: '24px'
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  statusActive: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    border: '1px solid #bbf7d0'
  },
  statusInactive: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca'
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    margin: '2px',
    border: '1px solid'
  },
  actionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  actionEdit: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8'
  },
  actionToggle: {
    backgroundColor: '#fefce8',
    color: '#ca8a04'
  },
  actionDelete: {
    backgroundColor: '#fef2f2',
    color: '#dc2626'
  },
  modal: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '9999',
    padding: '20px'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  modalHeader: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '24px',
    borderRadius: '20px 20px 0 0'
  }
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserRequest>({
    fullName: '',
    email: '',
    password: '',
    isActive: true,
    roleIds: []
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const { hasPermission } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersResponse, rolesResponse] = await Promise.all([
        usersAPI.getAll(),
        permissionsAPI.getRoles()
      ]);

      if (usersResponse.success) {
        setUsers(usersResponse.data || []);
      }
      if (rolesResponse.success) {
        setRoles(rolesResponse.data || []);
      }
    } catch (err: any) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingUser) {
        const updateData: UpdateUserRequest = {
          fullName: formData.fullName,
          email: formData.email,
          isActive: formData.isActive,
          roleIds: formData.roleIds,
          ...(formData.password && { password: formData.password })
        };
        
        const response = await usersAPI.update(editingUser.id, updateData);
        if (response.success) {
          setSuccess('User updated successfully');
          await loadData();
          resetForm();
        }
      } else {
        const response = await usersAPI.create(formData);
        if (response.success) {
          setSuccess('User created successfully');
          await loadData();
          resetForm();
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during the operation');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      password: '',
      isActive: user.isActive,
      roleIds: user.roles.map(r => r.roleId)
    });
    setShowModal(true);
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await usersAPI.delete(userId);
      if (response.success) {
        setSuccess('User deleted successfully');
        await loadData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      const response = await usersAPI.toggleStatus(userId);
      if (response.success) {
        setSuccess(response.message);
        await loadData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change user status');
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      isActive: true,
      roleIds: []
    });
    setEditingUser(null);
    setShowModal(false);
  };

  const handleRoleToggle = (roleId: number) => {
    setFormData(prev => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter(id => id !== roleId)
        : [...prev.roleIds, roleId]
    }));
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleStyles = (roleName: string) => {
    const roleStyles = {
      'SuperAdmin': { backgroundColor: '#f3e8ff', color: '#7c3aed', borderColor: '#e9d5ff' },
      'Admin': { backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' },
      'Manager': { backgroundColor: '#eff6ff', color: '#2563eb', borderColor: '#dbeafe' },
      'Employee': { backgroundColor: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' },
      'User': { backgroundColor: '#f8fafc', color: '#475569', borderColor: '#e2e8f0' }
    };
    return roleStyles[roleName as keyof typeof roleStyles] || roleStyles['User'];
  };

  if (!hasPermission('Users', 'view')) {
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
              ??
            </div>
            <h3 style={{fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '8px'}}>Access Denied</h3>
            <p style={{color: '#6b7280'}}>You don't have permission to access User Management.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
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
              borderTop: '3px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span style={{color: '#374151', fontWeight: '500'}}>Loading Users...</span>
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
              <h1 style={styles.headerTitle}>?? User Management</h1>
              <p style={styles.headerSubtitle}>Manage system users and their permissions</p>
              <div style={styles.statsContainer}>
                <div style={styles.statItem}>
                  <div style={{...styles.statDot, backgroundColor: '#10b981'}}></div>
                  <span>{users.filter(u => u.isActive).length} Active Users</span>
                </div>
                <div style={styles.statItem}>
                  <div style={{...styles.statDot, backgroundColor: '#ef4444'}}></div>
                  <span>{users.filter(u => !u.isActive).length} Inactive Users</span>
                </div>
                <div style={styles.statItem}>
                  <div style={{...styles.statDot, backgroundColor: '#f59e0b'}}></div>
                  <span>{roles.length} Roles Available</span>
                </div>
              </div>
            </div>
            {hasPermission('Users', 'insert') && (
              <button
                style={styles.addButton}
                onClick={() => setShowModal(true)}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span style={{fontSize: '16px'}}>?</span>
                <span>Add New User</span>
              </button>
            )}
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderLeft: '4px solid #ef4444',
            color: '#991b1b',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{fontSize: '18px'}}>??</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderLeft: '4px solid #10b981',
            color: '#065f46',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{fontSize: '18px'}}>?</span>
            <span>{success}</span>
          </div>
        )}

        {/* Search Section */}
        <div style={styles.searchContainer}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'}}>
            <div style={{position: 'relative', flex: '1', maxWidth: '400px'}}>
              <div style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                fontSize: '18px'
              }}>
                ??
              </div>
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.backgroundColor = 'white';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: '500'
            }}>
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>
        </div>

        {/* Users Cards Grid */}
        <div style={styles.cardsGrid}>
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              style={styles.userCard}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)';
                e.currentTarget.style.borderColor = '#c7d2fe';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              {/* Card Header */}
              <div style={styles.cardHeader}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <div style={styles.userAvatar}>
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{fontWeight: '600', color: '#1f2937', fontSize: '16px', margin: '0'}}>{user.fullName}</h3>
                      <p style={{color: '#6b7280', fontSize: '14px', margin: '4px 0 0 0'}} dir="ltr">{user.email}</p>
                    </div>
                  </div>
                  <div style={{
                    ...styles.statusBadge,
                    ...(user.isActive ? styles.statusActive : styles.statusInactive)
                  }}>
                    <span>{user.isActive ? '??' : '??'}</span>
                    <span>{user.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div style={styles.cardBody}>
                <div style={{marginBottom: '20px'}}>
                  <h4 style={{fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px'}}>??? Roles:</h4>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px'}}>
                    {user.roles.length > 0 ? (
                      user.roles.map((role) => (
                        <span
                          key={role.roleId}
                          style={{
                            ...styles.roleBadge,
                            ...(getRoleStyles(role.roleName))
                          }}
                        >
                          {role.roleName}
                        </span>
                      ))
                    ) : (
                      <span style={{color: '#9ca3af', fontSize: '14px', fontStyle: 'italic'}}>No roles assigned</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  paddingTop: '16px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  {hasPermission('Users', 'update') && (
                    <button
                      onClick={() => handleEdit(user)}
                      style={{...styles.actionButton, ...styles.actionEdit, flex: '1', minWidth: '80px'}}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#dbeafe';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#eff6ff';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <span>??</span>
                      <span>Edit</span>
                    </button>
                  )}
                  {hasPermission('Users', 'update') && (
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      style={{
                        ...styles.actionButton,
                        ...(user.isActive ? styles.actionToggle : {backgroundColor: '#f0fdf4', color: '#16a34a'}),
                        flex: '1',
                        minWidth: '80px'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = user.isActive ? '#fef3c7' : '#dcfce7';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = user.isActive ? '#fefce8' : '#f0fdf4';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <span>{user.isActive ? '??' : '??'}</span>
                      <span>{user.isActive ? 'Disable' : 'Enable'}</span>
                    </button>
                  )}
                  {hasPermission('Users', 'delete') && user.email !== 'admin@assets.ps' && (
                    <button
                      onClick={() => handleDelete(user.id)}
                      style={{...styles.actionButton, ...styles.actionDelete}}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#fee2e2';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#fef2f2';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <span>???</span>
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
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
              ??
            </div>
            <h3 style={{fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px'}}>No users found</h3>
            <p style={{color: '#6b7280', marginBottom: '24px'}}>
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first user'}
            </p>
            {hasPermission('Users', 'insert') && !searchTerm && (
              <button
                onClick={() => setShowModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span>?</span>
                <span>Add First User</span>
              </button>
            )}
          </div>
        )}

        {/* Beautiful Modal */}
        {showModal && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              {/* Modal Header */}
              <div style={styles.modalHeader}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>
                    <h3 style={{fontSize: '24px', fontWeight: '700', margin: '0 0 8px 0'}}>
                      {editingUser ? '?? Edit User' : '? Add New User'}
                    </h3>
                    <p style={{opacity: '0.9', margin: '0'}}>
                      {editingUser ? 'Update user information and roles' : 'Create a new user account'}
                    </p>
                  </div>
                  <button
                    onClick={resetForm}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      fontSize: '24px',
                      cursor: 'pointer',
                      opacity: '0.8',
                      transition: 'opacity 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'}
                  >
                    ??
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div style={{padding: '32px'}}>
                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        color: '#374151',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        ?? Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({...prev, fullName: e.target.value}))}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '16px',
                          transition: 'all 0.2s ease'
                        }}
                        placeholder="Enter full name"
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea';
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        color: '#374151',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        ?? Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '16px',
                          transition: 'all 0.2s ease'
                        }}
                        placeholder="Enter email address"
                        dir="ltr"
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea';
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      color: '#374151',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      ?? Password {editingUser && <span style={{color: '#6b7280', fontWeight: '400'}}>(leave empty to keep current password)</span>}
                    </label>
                    <input
                      type="password"
                      required={!editingUser}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        transition: 'all 0.2s ease'
                      }}
                      placeholder={editingUser ? "Enter new password (optional)" : "Enter password"}
                      dir="ltr"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div>
                      <label style={{fontSize: '14px', fontWeight: '600', color: '#374151'}}>Account Status</label>
                      <p style={{fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0'}}>Enable or disable this user account</p>
                    </div>
                    <label style={{
                      position: 'relative',
                      display: 'inline-flex',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({...prev, isActive: e.target.checked}))}
                        style={{display: 'none'}}
                      />
                      <div style={{
                        width: '48px',
                        height: '24px',
                        backgroundColor: formData.isActive ? '#667eea' : '#cbd5e0',
                        borderRadius: '24px',
                        position: 'relative',
                        transition: 'all 0.3s ease'
                      }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          position: 'absolute',
                          top: '2px',
                          left: formData.isActive ? '26px' : '2px',
                          transition: 'all 0.3s ease'
                        }}></div>
                      </div>
                      <span style={{marginLeft: '12px', fontSize: '14px', fontWeight: '500', color: '#1f2937'}}>
                        {formData.isActive ? '?? Active' : '?? Inactive'}
                      </span>
                    </label>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '16px',
                      color: '#374151',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      ??? User Roles & Permissions
                    </label>
                    <div style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      padding: '20px',
                      border: '1px solid #e5e7eb'
                    }}>
                      {roles.map((role) => (
                        <label key={role.roleId} style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px 16px',
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          marginBottom: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <input
                            type="checkbox"
                            checked={formData.roleIds.includes(role.roleId)}
                            onChange={() => handleRoleToggle(role.roleId)}
                            style={{
                              width: '16px',
                              height: '16px',
                              marginRight: '12px',
                              accentColor: '#667eea'
                            }}
                          />
                          <div style={{flex: '1'}}>
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                              <span style={{fontSize: '14px', fontWeight: '500', color: '#1f2937'}}>{role.roleName}</span>
                              <span style={{
                                ...styles.roleBadge,
                                ...getRoleStyles(role.roleName)
                              }}>
                                {role.roleName}
                              </span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '16px',
                    paddingTop: '24px',
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    <button
                      type="button"
                      onClick={resetForm}
                      style={{
                        padding: '12px 24px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        color: '#374151',
                        backgroundColor: 'white',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.3)';
                      }}
                    >
                      {editingUser ? '?? Update User' : '? Create User'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default UserManagement;