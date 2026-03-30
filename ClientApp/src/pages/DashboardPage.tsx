import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Space, Spin, message, Progress } from 'antd';
import {
  DashboardOutlined, FileOutlined, SwapOutlined, 
  DeleteOutlined, ToolOutlined, WarningOutlined
} from '@ant-design/icons';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MainLayout from '../components/MainLayout';
import { dashboardApi, type DashboardStats, type CategoryData, type StatusData } from '../api/dashboard.api';

export default function DashboardPage() {
const [loading, setLoading] = useState(true);
const [stats, setStats] = useState<DashboardStats | null>(null);
const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
const [statusData, setStatusData] = useState<StatusData | null>(null);

useEffect(() => {
  loadDashboardData();
}, []);

const loadDashboardData = async () => {
  setLoading(true);
  try {
    console.log('?? Loading dashboard data...');
      
    // Load all dashboard data in parallel
    const [statsResponse, categoryResponse, statusResponse] = await Promise.all([
      dashboardApi.getStats(),
      dashboardApi.getAssetsByCategory(),
      dashboardApi.getAssetsByStatus()
    ]);
      
    if (statsResponse.data.success && statsResponse.data.data) {
      setStats(statsResponse.data.data);
      console.log('? Dashboard stats loaded successfully');
    }
      
      if (categoryResponse.data.success && categoryResponse.data.data) {
        setCategoryData(categoryResponse.data.data);
        console.log('? Category data loaded successfully:', categoryResponse.data.data);
      } else {
        console.log('? Category data failed:', categoryResponse.data);
      }
      
      if (statusResponse.data.success && statusResponse.data.data) {
        setStatusData(statusResponse.data.data);
        console.log('? Status data loaded successfully:', statusResponse.data.data);
      } else {
        console.log('? Status data failed:', statusResponse.data);
      }
      
  } catch (error) {
    console.error('?? Dashboard error:', error);
    message.error('Error loading dashboard data');
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading dashboard...</div>
        </div>
      </MainLayout>
    );
  }

  if (!stats) {
    return (
      <MainLayout>
        <Card>
          <div style={{ textAlign: 'center', padding: 50 }}>
            <WarningOutlined style={{ fontSize: 48, color: '#faad14' }} />
            <div style={{ marginTop: 16 }}>No dashboard data available</div>
          </div>
        </Card>
      </MainLayout>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <MainLayout>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Main Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Assets"
                value={stats.totalAssets}
                prefix={<FileOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Active Assets"
                value={stats.activeAssets}
                prefix={<DashboardOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Under Maintenance"
                value={stats.assetsUnderMaintenance}
                prefix={<ToolOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Disposed Assets"
                value={stats.disposedAssets}
                prefix={<DeleteOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row gutter={[16, 16]}>
          {/* Assets by Category - Pie Chart */}
          <Col xs={24} lg={12}>
            <Card title="Assets by Category" size="small">
              {categoryData?.categoryDistribution && categoryData.categoryDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData.categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                       {categoryData.categoryDistribution?.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                       )) || null}
                     </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  {categoryData ? 'No data to display' : <Spin />}
                </div>
              )}
            </Card>
          </Col>

          {/* Assets by Status - Bar Chart */}
          <Col xs={24} lg={12}>
            <Card title="Assets by Status" size="small">
              {statusData?.statusDistribution && statusData.statusDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusData.statusDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8">
                       {statusData.statusDistribution?.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                       )) || null}
                     </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  {statusData ? 'No data to display' : <Spin />}
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Recent Activities Section */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Recent Transfers" size="small">
              <Statistic
                title="This Month"
                value={stats.recentTransfers}
                prefix={<SwapOutlined />}
              />
              <Progress
                percent={Math.min((stats.recentTransfers / 50) * 100, 100)}
                showInfo={false}
                strokeColor="#52c41a"
                style={{ marginTop: 8 }}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Recent Disposals" size="small">
              <Statistic
                title="This Month"
                value={stats.recentDisposals}
                prefix={<DeleteOutlined />}
              />
              <Progress
                percent={Math.min((stats.recentDisposals / 20) * 100, 100)}
                showInfo={false}
                strokeColor="#ff4d4f"
                style={{ marginTop: 8 }}
              />
            </Card>
          </Col>
        </Row>

        {/* Asset Status Overview */}
        <Card title="Asset Status Overview" size="small">
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                  {stats.activeAssets}
                </div>
                <div>Active Assets</div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
                  {stats.assetsUnderMaintenance}
                </div>
                <div>Under Maintenance</div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff4d4f' }}>
                  {stats.disposedAssets}
                </div>
                <div>Disposed</div>
              </div>
            </Col>
          </Row>
        </Card>
      </Space>
    </MainLayout>
  );
}