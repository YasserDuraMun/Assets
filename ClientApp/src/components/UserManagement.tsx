import React, { useState, useEffect } from 'react';
import { User, Role, CreateUserRequest, UpdateUserRequest } from '../types/security';
import { usersAPI, permissionsAPI } from '../api/securityApi';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from './MainLayout';

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
        // ????? ?????? ?????
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
        // ????? ?????? ????
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
      password: '', // Don't pre-fill password
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

  if (!hasPermission('Users', 'view')) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p className="text-red-500">You don't have permission to access this page.</p>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          {hasPermission('Users', 'insert') && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
            >
              + Add New User
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roles
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.fullName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" dir="ltr">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((role) => (
                      <span
                        key={role.roleId}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {role.roleName}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2 space-x-reverse">
                    {hasPermission('Users', 'update') && (
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                    )}
                    {hasPermission('Users', 'update') && (
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                    {hasPermission('Users', 'delete') && user.email !== 'admin@assets.ps' && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal ?????/????? ?????? */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({...prev, fullName: e.target.value}))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password {editingUser && '(leave empty to keep current password)'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({...prev, isActive: e.target.checked}))}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <span className="mr-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
                  <div className="space-y-2">
                    {roles.map((role) => (
                      <label key={role.roleId} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.roleIds.includes(role.roleId)}
                          onChange={() => handleRoleToggle(role.roleId)}
                          className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                        <span className="mr-2 text-sm text-gray-700">{role.roleName}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 space-x-reverse pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    {editingUser ? 'Update' : 'Add'}
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