import React from 'react';
import { useAuth } from '../hooks/useAuth';
import PermissionGuard, { RoleGuard } from '../components/PermissionGuard';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout, hasPermission, hasRole } = useAuth();

  const menuItems = [
    {
      title: '??????',
      description: '????? ?????? ????????',
      href: '/assets',
      screen: 'Assets',
      action: 'view' as const,
      icon: '??',
      color: 'bg-blue-500'
    },
    {
      title: '??????????',
      description: '????? ?????????? ??????????',
      href: '/users',
      screen: 'Users',
      action: 'view' as const,
      icon: '??',
      color: 'bg-green-500'
    },
    {
      title: '?????????',
      description: '????? ??????? ??????',
      href: '/transfers',
      screen: 'Transfers',
      action: 'view' as const,
      icon: '??',
      color: 'bg-purple-500'
    },
    {
      title: '???????',
      description: '????? ????? ????? ???????',
      href: '/maintenance',
      screen: 'Maintenance',
      action: 'view' as const,
      icon: '??',
      color: 'bg-yellow-500'
    },
    {
      title: '????????',
      description: '??? ?????? ????????',
      href: '/reports',
      screen: 'Reports',
      action: 'view' as const,
      icon: '??',
      color: 'bg-red-500'
    },
    {
      title: '?????????',
      description: '??????? ?????? ??????',
      href: '/settings',
      screen: 'Dashboard',
      action: 'view' as const,
      icon: '??',
      color: 'bg-gray-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                ???? ????? ??????
              </h1>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="text-sm text-gray-700">
                ??????? <span className="font-medium">{user?.fullName}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {user?.roles.map((role: any) => (
                  <span
                    key={role.roleId}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {role.roleName}
                  </span>
                ))}
              </div>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
              >
                ????? ??????
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            ???? ?????? ????????
          </h2>
          <p className="text-gray-600">
            ???? ???? ??????? ????? ?? ????? ??????
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <PermissionGuard screenName="Assets" action="view">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">??</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        ?????? ??????
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        1,234
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </PermissionGuard>

          <RoleGuard roles={['Super Admin', 'Admin']}>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">??</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        ?????????? ???????
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        12
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </RoleGuard>

          <PermissionGuard screenName="Transfers" action="view">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">??</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        ????????? ???????
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        56
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </PermissionGuard>

          <PermissionGuard screenName="Maintenance" action="view">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">??</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        ????? ??????? ???????
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        8
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </PermissionGuard>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <PermissionGuard
              key={item.href}
              screenName={item.screen}
              action={item.action}
              fallback={
                <div className="bg-gray-100 rounded-lg p-6 opacity-50">
                  <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-4`}>
                    <span className="text-white text-xl">{item.icon}</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-500 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {item.description}
                  </p>
                  <span className="text-xs text-gray-400">??? ?????</span>
                </div>
              }
            >
              <Link
                to={item.href}
                className="bg-white rounded-lg p-6 shadow hover:shadow-md transition-shadow duration-200 block"
              >
                <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-4`}>
                  <span className="text-white text-xl">{item.icon}</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {item.description}
                </p>
                <div className="flex items-center text-indigo-600 text-sm font-medium">
                  ??? ??????
                  <span className="mr-1">?</span>
                </div>
              </Link>
            </PermissionGuard>
          ))}
        </div>

        {/* User Permissions Summary */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            ???? ????????
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['Assets', 'Users', 'Transfers', 'Maintenance', 'Reports'].map((screen) => (
              <div key={screen} className="border rounded-lg p-3">
                <h4 className="font-medium text-sm text-gray-900 mb-2">{screen}</h4>
                <div className="space-y-1">
                  {(['view', 'insert', 'update', 'delete'] as const).map((action) => (
                    <div key={action} className="flex items-center text-xs">
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        hasPermission(screen, action) ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                      <span className="capitalize">
                        {action === 'view' ? '???' : 
                         action === 'insert' ? '?????' :
                         action === 'update' ? '?????' : '???'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;