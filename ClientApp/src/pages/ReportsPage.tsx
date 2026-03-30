import { useState, useEffect } from 'react';
import {
  Card, Row, Col, Space, Button, DatePicker, Select, Table, Tag, Statistic,
  Tabs, Typography, Spin, message, Divider, Empty, Timeline, Progress
} from 'antd';
import {
  FileTextOutlined, CalendarOutlined, BarChartOutlined, 
  DownloadOutlined, FilterOutlined, ReloadOutlined,
  DeleteOutlined, ToolOutlined, SwapOutlined, DashboardOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { reportsApi, AssetsSummaryReport, DisposalReport, MaintenanceReport, TransfersReport } from '../api/reports.api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

export default function ReportsPage() {
  console.log('?? ReportsPage component loaded');

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [dateRange, setDateRange] = useState<any>(null);
  
  // Reports data
  const [assetsSummary, setAssetsSummary] = useState<AssetsSummaryReport | null>(null);
  const [disposalReport, setDisposalReport] = useState<DisposalReport | null>(null);
  const [maintenanceReport, setMaintenanceReport] = useState<MaintenanceReport | null>(null);
  const [transfersReport, setTransfersReport] = useState<TransfersReport | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<any>(null);

  console.log('?? Reports state:', { 
    activeTab, 
    loading,
    hasAssetsSummary: !!assetsSummary,
    hasDisposalReport: !!disposalReport,
    hasMaintenanceReport: !!maintenanceReport,
    hasTransfersReport: !!transfersReport
  });

  useEffect(() => {
    loadInitialReports();
  }, []);

  const loadInitialReports = async () => {
    setLoading(true);
    console.log('?? Loading initial reports...');
    
    try {
      // Load reports for the last 6 months to ensure we have data
      const now = dayjs();
      const startDate = now.subtract(6, 'months').startOf('month');
      const endDate = now.endOf('month');

      console.log('?? Date range for reports:', {
        start: startDate.format('YYYY-MM-DD'),
        end: endDate.format('YYYY-MM-DD'),
        startISO: startDate.toISOString(),
        endISO: endDate.toISOString()
      });

      await Promise.all([
        loadAssetsSummary(startDate.toISOString(), endDate.toISOString()),
        loadMonthlySummary(now.year(), now.month() + 1)
      ]);

      console.log('? Initial reports loaded successfully');
    } catch (error) {
      console.error('?? Failed to load initial reports:', error);
      message.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const loadAssetsSummary = async (startDate?: string, endDate?: string) => {
    try {
      console.log('?? Loading assets summary...', { startDate, endDate });
      const response = await reportsApi.getAssetsSummary(startDate, endDate);
      console.log('?? Assets summary response:', response.data);
      
      if (response.data.success && response.data.data) {
        setAssetsSummary(response.data.data);
        console.log('? Assets summary loaded:', response.data.data);
      } else {
        console.log('? Assets summary failed:', response.data.message);
        setAssetsSummary(null);
      }
    } catch (error) {
      console.error('? Failed to load assets summary:', error);
      setAssetsSummary(null);
    }
  };

  const loadDisposalReport = async (startDate?: string, endDate?: string) => {
    try {
      console.log('??? Loading disposal report...');
      const response = await reportsApi.getDisposalReport({ startDate, endDate });
      if (response.data.success && response.data.data) {
        setDisposalReport(response.data.data);
        console.log('? Disposal report loaded');
      }
    } catch (error) {
      console.error('? Failed to load disposal report:', error);
    }
  };

  const loadMaintenanceReport = async (startDate?: string, endDate?: string) => {
    try {
      console.log('?? Loading maintenance report...');
      const response = await reportsApi.getMaintenanceReport({ startDate, endDate });
      if (response.data.success && response.data.data) {
        setMaintenanceReport(response.data.data);
        console.log('? Maintenance report loaded');
      }
    } catch (error) {
      console.error('? Failed to load maintenance report:', error);
    }
  };

  const loadTransfersReport = async (startDate?: string, endDate?: string) => {
    try {
      console.log('?? Loading transfers report...');
      const response = await reportsApi.getTransfersReport({ startDate, endDate });
      if (response.data.success && response.data.data) {
        setTransfersReport(response.data.data);
        console.log('? Transfers report loaded');
      }
    } catch (error) {
      console.error('? Failed to load transfers report:', error);
    }
  };

  const loadMonthlySummary = async (year: number, month: number) => {
    try {
      console.log('?? Loading monthly summary for', year, month);
      const response = await reportsApi.getMonthlySummary(year, month);
      if (response.data.success && response.data.data) {
        setMonthlyReport(response.data.data);
        console.log('? Monthly summary loaded');
      }
    } catch (error) {
      console.error('? Failed to load monthly summary:', error);
    }
  };

  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates);
    
    if (dates && dates.length === 2) {
      const startDate = dates[0].startOf('day').toISOString();
      const endDate = dates[1].endOf('day').toISOString();

      // Reload current tab data with new date range
      switch (activeTab) {
        case 'summary':
          loadAssetsSummary(startDate, endDate);
          break;
        case 'disposal':
          loadDisposalReport(startDate, endDate);
          break;
        case 'maintenance':
          loadMaintenanceReport(startDate, endDate);
          break;
        case 'transfers':
          loadTransfersReport(startDate, endDate);
          break;
      }
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    
    // Load data for the new tab if not already loaded
    const startDate = dateRange?.[0]?.startOf('day').toISOString();
    const endDate = dateRange?.[1]?.endOf('day').toISOString();

    switch (key) {
      case 'disposal':
        if (!disposalReport) loadDisposalReport(startDate, endDate);
        break;
      case 'maintenance':
        if (!maintenanceReport) loadMaintenanceReport(startDate, endDate);
        break;
      case 'transfers':
        if (!transfersReport) loadTransfersReport(startDate, endDate);
        break;
    }
  };

  const handleRefresh = () => {
    const startDate = dateRange?.[0]?.startOf('day').toISOString();
    const endDate = dateRange?.[1]?.endOf('day').toISOString();

    switch (activeTab) {
      case 'summary':
        loadAssetsSummary(startDate, endDate);
        break;
      case 'disposal':
        loadDisposalReport(startDate, endDate);
        break;
      case 'maintenance':
        loadMaintenanceReport(startDate, endDate);
        break;
      case 'transfers':
        loadTransfersReport(startDate, endDate);
        break;
      case 'monthly': {
        const now = dayjs();
        loadMonthlySummary(now.year(), now.month() + 1);
        break;
      }
    }
  };

  const renderAssetsSummaryTab = () => {
    if (!assetsSummary) {
      return <Empty description="No assets summary data available" />;
    }

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Summary Statistics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="?????? ??????"
                value={assetsSummary.summary.totalAssets}
                prefix={<DashboardOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="?????? ??????"
                value={assetsSummary.summary.activeAssets}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="?????? ????????"
                value={assetsSummary.summary.disposedAssets}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="?????? ??????"
                value={assetsSummary.summary.totalValue}
                precision={0}
                suffix={assetsSummary.summary.currency}
                valueStyle={{ color: '#1677ff' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Assets by Category */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="?????? ???? ???????" size="small">
              <Table
                dataSource={assetsSummary.assetsByCategory}
                columns={[
                  { 
                    title: '???????', 
                    dataIndex: 'category', 
                    key: 'category' 
                  },
                  { 
                    title: '?????', 
                    dataIndex: 'count', 
                    key: 'count',
                    render: (count: number) => (
                      <Tag color="blue">{count.toLocaleString()}</Tag>
                    )
                  }
                ]}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="?????? ???? ??????" size="small">
              <Table
                dataSource={assetsSummary.assetsByStatus}
                columns={[
                  { 
                    title: '??????', 
                    dataIndex: 'status', 
                    key: 'status' 
                  },
                  { 
                    title: '?????', 
                    dataIndex: 'count', 
                    key: 'count',
                    render: (count: number) => (
                      <Tag color="green">{count.toLocaleString()}</Tag>
                    )
                  }
                ]}
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </Space>
    );
  };

  const renderDisposalReportTab = () => {
    if (!disposalReport) {
      return <Empty description="No disposal report data available" />;
    }

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Summary */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Card>
              <Statistic
                title="?????? ?????? ????????"
                value={disposalReport.summary.totalDisposals}
                prefix={<DeleteOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card>
              <Text type="secondary">???? ???????</Text>
              <div>{disposalReport.summary.periodCovered}</div>
            </Card>
          </Col>
        </Row>

        {/* Disposal by Reason */}
        <Card title="??????? ???? ?????" size="small">
          <Table
            dataSource={disposalReport.disposalsByReason}
            columns={[
              { 
                title: '?????', 
                dataIndex: 'reasonText', 
                key: 'reasonText' 
              },
              { 
                title: '?????', 
                dataIndex: 'count', 
                key: 'count',
                render: (count: number) => (
                  <Tag color="red">{count.toLocaleString()}</Tag>
                )
              }
            ]}
            pagination={false}
            size="small"
          />
        </Card>

        {/* Recent Disposals */}
        <Card title="????????? ???????" size="small">
          <Table
            dataSource={disposalReport.recentDisposals}
            columns={[
              { 
                title: '??? ?????', 
                dataIndex: 'assetName', 
                key: 'assetName' 
              },
              { 
                title: '????? ???????', 
                dataIndex: 'assetSerialNumber', 
                key: 'assetSerialNumber' 
              },
              { 
                title: '?????', 
                dataIndex: 'reasonText', 
                key: 'reasonText',
                render: (text: string) => <Tag color="red">{text}</Tag>
              },
              { 
                title: '????? ???????', 
                dataIndex: 'disposalDate', 
                key: 'disposalDate',
                render: (date: string) => dayjs(date).format('DD/MM/YYYY')
              },
              { 
                title: '???????', 
                dataIndex: 'performedBy', 
                key: 'performedBy' 
              }
            ]}
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </Card>
      </Space>
    );
  };

  const renderMaintenanceReportTab = () => {
    if (!maintenanceReport) {
      return <Empty description="No maintenance report data available" />;
    }

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Summary */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Maintenance"
                value={maintenanceReport.summary.totalMaintenance}
                prefix={<ToolOutlined />}
                valueStyle={{ color: '#1677ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Cost"
                value={maintenanceReport.summary.totalCost}
                precision={0}
                suffix={maintenanceReport.summary.currency}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Text type="secondary">Report Period</Text>
              <div>{maintenanceReport.summary.periodCovered}</div>
            </Card>
          </Col>
        </Row>

        {/* Maintenance by Type */}
        <Card title="Maintenance by Type" size="small">
          <Table
            dataSource={maintenanceReport.maintenanceByType}
            columns={[
              { 
                title: 'Type', 
                dataIndex: 'typeText', 
                key: 'typeText' 
              },
              { 
                title: 'Count', 
                dataIndex: 'count', 
                key: 'count',
                render: (count: number) => (
                  <Tag color="blue">{count.toLocaleString()}</Tag>
                )
              },
              { 
                title: 'Total Cost', 
                dataIndex: 'totalCost', 
                key: 'totalCost',
                render: (cost: number) => `${cost.toLocaleString()} ILS`
              }
            ]}
            pagination={false}
            size="small"
          />
        </Card>

        {/* Upcoming Maintenance */}
        {maintenanceReport.upcomingMaintenance.length > 0 && (
          <Card title="Upcoming Maintenance" size="small">
            <Timeline>
              {maintenanceReport.upcomingMaintenance.slice(0, 10).map((item, index) => (
                <Timeline.Item 
                  key={index} 
                  color={item.daysUntilDue < 0 ? 'red' : item.daysUntilDue <= 7 ? 'orange' : 'blue'}
                >
                  <div>
                    <Text strong>{item.assetName}</Text> ({item.assetSerialNumber})
                    <br />
                    <Text type="secondary">{item.type}</Text>
                    <br />
                    <Tag color={item.daysUntilDue < 0 ? 'red' : 'blue'}>
                      {item.daysUntilDue < 0 ? `Overdue ${Math.abs(item.daysUntilDue)} days` : 
                       item.daysUntilDue === 0 ? 'Due Today' :
                       `${item.daysUntilDue} days remaining`}
                    </Tag>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        )}
      </Space>
    );
  };

  const renderTransfersReportTab = () => {
    if (!transfersReport) {
      return <Empty description="No transfers report data available" />;
    }

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Summary */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Card>
              <Statistic
                title="?????? ?????????"
                value={transfersReport.summary.totalTransfers}
                prefix={<SwapOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card>
              <Text type="secondary">???? ???????</Text>
              <div>{transfersReport.summary.periodCovered}</div>
            </Card>
          </Col>
        </Row>

        {/* Transfers by Category */}
        <Card title="????????? ???? ???????" size="small">
          <Table
            dataSource={transfersReport.transfersByCategory}
            columns={[
              { 
                title: '???????', 
                dataIndex: 'category', 
                key: 'category' 
              },
              { 
                title: '??? ?????????', 
                dataIndex: 'count', 
                key: 'count',
                render: (count: number) => (
                  <Tag color="green">{count.toLocaleString()}</Tag>
                )
              }
            ]}
            pagination={false}
            size="small"
          />
        </Card>

        {/* Recent Transfers */}
        <Card title="????????? ???????" size="small">
          <Table
            dataSource={transfersReport.recentTransfers}
            columns={[
              { 
                title: '??? ?????', 
                dataIndex: 'assetName', 
                key: 'assetName' 
              },
              { 
                title: '??', 
                dataIndex: 'fromLocation', 
                key: 'fromLocation' 
              },
              { 
                title: '???', 
                dataIndex: 'toLocation', 
                key: 'toLocation' 
              },
              { 
                title: '????? ?????', 
                dataIndex: 'movementDate', 
                key: 'movementDate',
                render: (date: string) => dayjs(date).format('DD/MM/YYYY')
              },
              { 
                title: '???????', 
                dataIndex: 'performedBy', 
                key: 'performedBy' 
              }
            ]}
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </Card>
      </Space>
    );
  };

  const renderMonthlyReportTab = () => {
    if (!monthlyReport) {
      return <Empty description="No monthly report data available" />;
    }

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="New Assets"
                value={monthlyReport.summary.assetsCreated}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Disposed Assets"
                value={monthlyReport.summary.disposals}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Maintenance Work"
                value={monthlyReport.summary.maintenanceRecords}
                valueStyle={{ color: '#1677ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Transfer Operations"
                value={monthlyReport.summary.transfers}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      </Space>
    );
  };

  return (
    <MainLayout>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FileTextOutlined style={{ marginRight: 8 }} />
              <span>Reports</span>
            </div>
            <Space>
              <RangePicker
                onChange={handleDateRangeChange}
                placeholder={['Start Date', 'End Date']}
                style={{ width: 250 }}
              />
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleRefresh}
                loading={loading}
              >
                Refresh
              </Button>
              <Button 
                icon={<DownloadOutlined />}
                type="primary"
                disabled
              >
                Export
              </Button>
            </Space>
          </div>
        }
      >
        <Spin spinning={loading}>
          <Tabs activeKey={activeTab} onChange={handleTabChange}>
            <Tabs.TabPane
              tab={
                <span>
                  <DashboardOutlined />
                  Assets Summary
                </span>
              }
              key="summary"
            >
              {renderAssetsSummaryTab()}
            </Tabs.TabPane>

            <Tabs.TabPane
              tab={
                <span>
                  <DeleteOutlined />
                  Disposed Assets
                </span>
              }
              key="disposal"
            >
              {renderDisposalReportTab()}
            </Tabs.TabPane>

            <Tabs.TabPane
              tab={
                <span>
                  <ToolOutlined />
                  Maintenance
                </span>
              }
              key="maintenance"
            >
              {renderMaintenanceReportTab()}
            </Tabs.TabPane>

            <Tabs.TabPane
              tab={
                <span>
                  <SwapOutlined />
                  Transfers
                </span>
              }
              key="transfers"
            >
              {renderTransfersReportTab()}
            </Tabs.TabPane>

            <Tabs.TabPane
              tab={
                <span>
                  <CalendarOutlined />
                  Monthly Report
                </span>
              }
              key="monthly"
            >
              {renderMonthlyReportTab()}
            </Tabs.TabPane>
          </Tabs>
        </Spin>
      </Card>
    </MainLayout>
  );
}