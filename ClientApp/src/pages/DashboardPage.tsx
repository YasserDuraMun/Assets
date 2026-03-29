import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin, Alert, List, Badge, Tag } from 'antd';
import { Pie, Column } from '@ant-design/charts';
import {
  DashboardOutlined,
  FileOutlined,
  UserOutlined,
  ApartmentOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SafetyCertificateOutlined,
  DeleteOutlined,
  WarningOutlined
} from '@ant-design/icons';
import MainLayout from '../components/MainLayout';
import { 
  dashboardApi, 
  type DashboardStats, 
  type AssetsByCategory, 
  type AssetsByStatus, 
  type RecentActivity, 
  type DashboardAlert 
} from '../api/dashboard.api';

const { Title } = Typography;

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categoryData, setCategoryData] = useState<AssetsByCategory[]>([]);
  const [statusData, setStatusData] = useState<AssetsByStatus[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, categoryRes, statusRes, activitiesRes, alertsRes] = await Promise.all([
        dashboardApi.getStatistics(),
        dashboardApi.getAssetsByCategory(),
        dashboardApi.getAssetsByStatus(),
        dashboardApi.getRecentActivities(5),
        dashboardApi.getAlerts()
      ]);

      if (statsRes.data.success && statsRes.data.data) setStats(statsRes.data.data);
      if (categoryRes.data.success && categoryRes.data.data) setCategoryData(categoryRes.data.data);
      if (statusRes.data.success && statusRes.data.data) setStatusData(statusRes.data.data);
      if (activitiesRes.data.success && activitiesRes.data.data) setActivities(activitiesRes.data.data);
      if (alertsRes.data.success && alertsRes.data.data) setAlerts(alertsRes.data.data);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const pieConfig = {
    data: categoryData,
    angleField: 'assetsCount',
    colorField: 'categoryName',
    color: categoryData.map(item => item.color || '#1890ff'),
    radius: 0.8,
    label: {
      type: 'spider',
      labelHeight: 28,
      content: '{name}: {percentage}',
    },
    interactions: [{ type: 'element-active' }],
  };

  const columnConfig = {
    data: statusData,
    xField: 'statusName',
    yField: 'assetsCount',
    color: statusData.map(item => item.color || '#52c41a'),
    label: {
      position: 'middle' as const,
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'medium': return <WarningOutlined style={{ color: '#faad14' }} />;
      default: return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      default: return 'green';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
          <p>Loading dashboard...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Alert message="Error" description={error} type="error" showIcon />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Title level={2} style={{ marginBottom: 24 }}>
        <DashboardOutlined /> Dashboard
      </Title>

      {/* Main Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card hoverable>
            <Statistic
              title="Total Assets"
              value={stats?.totalAssets || 0}
              prefix={<FileOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card hoverable>
            <Statistic
              title="Employees"
              value={stats?.totalEmployees || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card hoverable>
            <Statistic
              title="Departments"
              value={stats?.totalDepartments || 0}
              prefix={<ApartmentOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card hoverable>
            <Statistic
              title="Warehouses"
              value={stats?.totalWarehouses || 0}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Asset Status Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Active Assets"
              value={stats?.activeAssets || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Assets with Warranty"
              value={stats?.assetsWithWarranty || 0}
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Expiring Warranties"
              value={stats?.expiringWarranties || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Disposed Assets"
              value={stats?.disposedAssets || 0}
              prefix={<DeleteOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Second row of stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Inactive Assets"
              value={stats?.inactiveAssets || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Assets by Category" size="small">
            {categoryData.length > 0 ? (
              <Pie {...pieConfig} height={300} />
            ) : (
              <div style={{ textAlign: 'center', padding: 50 }}>
                No data available
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Assets by Status" size="small">
            {statusData.length > 0 ? (
              <Column {...columnConfig} height={300} />
            ) : (
              <div style={{ textAlign: 'center', padding: 50 }}>
                No data available
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Activities and Alerts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Recent Activities" size="small">
            <List
              itemLayout="horizontal"
              dataSource={activities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<FileOutlined style={{ color: '#1890ff' }} />}
                    title={item.description}
                    description={`By ${item.userName} • ${new Date(item.createdAt).toLocaleDateString()}`}
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'No recent activities' }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span>
                Alerts {alerts.length > 0 && <Badge count={alerts.length} />}
              </span>
            } 
            size="small"
          >
            <List
              itemLayout="horizontal"
              dataSource={alerts}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={getPriorityIcon(item.priority)}
                    title={
                      <span>
                        {item.title}
                        <Tag color={getPriorityColor(item.priority)} style={{ marginLeft: 8 }}>
                          {item.priority}
                        </Tag>
                      </span>
                    }
                    description={item.description}
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'No alerts' }}
            />
          </Card>
        </Col>
      </Row>
    </MainLayout>
  );
}
