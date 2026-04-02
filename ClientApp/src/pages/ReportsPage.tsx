import { useState, useEffect, useRef } from 'react';
import {
  Card, Row, Col, Space, Button, DatePicker, Select, Table, Tag, Statistic,
  Tabs, Typography, Spin, message, Divider, Empty, Timeline, Progress, QRCode
} from 'antd';
import {
  FileTextOutlined, CalendarOutlined, BarChartOutlined, 
  DownloadOutlined, FilterOutlined, ReloadOutlined,
  DeleteOutlined, ToolOutlined, SwapOutlined, DashboardOutlined,
  QrcodeOutlined, PrinterOutlined, EnvironmentOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { reportsApi, AssetsSummaryReport, DisposalReport, MaintenanceReport, TransfersReport, AssetLocationDetailReport } from '../api/reports.api';
import { departmentApi } from '../api/department.api';
import { sectionApi } from '../api/section.api';
import type { Department, Section } from '../types';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

// Helper function to translate transfer reasons
const getReasonInArabic = (reason: string | undefined): string => {
  if (!reason) return '-';
  
  const translations: { [key: string]: string } = {
    'Employee Request': 'طلب موظف',
    'Transfer Request': 'طلب نقل',
    'Relocation': 'إعادة توزيع',
    'Department Reorganization': 'إعادة تنظيم الأقسام',
    'Equipment Upgrade': 'ترقية المعدات',
    'Maintenance': 'صيانة',
    'End of Project': 'انتهاء المشروع',
    'Employee Termination': 'إنهاء خدمة موظف',
    'New Assignment': 'تكليف جديد',
    'Temporary Loan': 'إعارة مؤقتة',
    'Other': 'أخرى'
  };
  
  return translations[reason] || reason;
};

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
  const [locationDetailReport, setLocationDetailReport] = useState<AssetLocationDetailReport | null>(null);

  // Location filters
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | undefined>(undefined);
  const [selectedSectionId, setSelectedSectionId] = useState<number | undefined>(undefined);
  
  const printRef = useRef<HTMLDivElement>(null);

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
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await departmentApi.getAll();
      if (response.data.success && response.data.data) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const loadSectionsByDepartment = async (departmentId: number) => {
    try {
      const response = await sectionApi.getByDepartment(departmentId);
      if (response.data.success && response.data.data) {
        setSections(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load sections:', error);
      setSections([]);
    }
  };

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
      message.error('فشل تحميل التقارير');
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
  const loadLocationDetailReport = async (departmentId?: number, sectionId?: number) => {
    try {
      console.log('📍 Loading location detail report...', { departmentId, sectionId });
      setLoading(true);
      const response = await reportsApi.getAssetsByLocationDetail({ 
        departmentId, 
        sectionId 
      });
      if (response.data.success && response.data.data) {
        setLocationDetailReport(response.data.data);
        console.log('✅ Location detail report loaded:', response.data.data);
        message.success(`تم تحميل ${response.data.data.summary.totalAssets} أصل`);
      }
    } catch (error) {
      console.error('❌ Failed to load location detail report:', error);
      message.error('فشل تحميل التقرير');
    } finally {
      setLoading(false);
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
      case 'locationDetail':
        // Load location detail report with current filters
        loadLocationDetailReport(selectedDepartmentId, selectedSectionId);
        break;
    }
  };

  const handleDepartmentChange = (value: number | undefined) => {
    setSelectedDepartmentId(value);
    setSelectedSectionId(undefined); // Reset section when department changes
    setSections([]); // Clear sections list
    
    if (value) {
      loadSectionsByDepartment(value);
    }
  };

  const handleSectionChange = (value: number | undefined) => {
    setSelectedSectionId(value);
  };

  const handleFilterApply = () => {
    loadLocationDetailReport(selectedDepartmentId, selectedSectionId);
  };

  const handlePrintReport = () => {
    window.print();
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
      return <Empty description="لا توجد بيانات ملخص الأصول" />;
    }

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Summary Statistics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="إجمالي الأصول"
                value={assetsSummary.summary.totalAssets}
                prefix={<DashboardOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="الأصول النشطة"
                value={assetsSummary.summary.activeAssets}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="الأصول المستبعدة"
                value={assetsSummary.summary.disposedAssets}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="القيمة الإجمالية"
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
            <Card title="الأصول حسب الفئة" size="small">
              <Table
                dataSource={assetsSummary.assetsByCategory}
                columns={[
                  { 
                    title: 'الفئة', 
                    dataIndex: 'category', 
                    key: 'category' 
                  },
                  { 
                    title: 'العدد', 
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
            <Card title="الأصول حسب الحالة" size="small">
              <Table
                dataSource={assetsSummary.assetsByStatus}
                columns={[
                  { 
                    title: 'الحالة', 
                    dataIndex: 'status', 
                    key: 'status' 
                  },
                  { 
                    title: 'العدد', 
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
      return <Empty description="لا توجد بيانات تقرير الاستبعاد" />;
    }

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Summary */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Card>
              <Statistic
                title="إجمالي الأصول المستبعدة"
                value={disposalReport.summary.totalDisposals}
                prefix={<DeleteOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card>
              <Text type="secondary">فترة التقرير</Text>
              <div>{disposalReport.summary.periodCovered}</div>
            </Card>
          </Col>
        </Row>

        {/* Disposal by Reason */}
        <Card title="الاستبعادات حسب السبب" size="small">
          <Table
            dataSource={disposalReport.disposalsByReason}
            columns={[
              { 
                title: 'السبب', 
                dataIndex: 'reasonText', 
                key: 'reasonText' 
              },
              { 
                title: 'العدد', 
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
        <Card title="الاستبعادات الأخيرة" size="small">
          <Table
            dataSource={disposalReport.recentDisposals}
            columns={[
              { 
                title: 'اسم الأصل', 
                dataIndex: 'assetName', 
                key: 'assetName' 
              },
              { 
                title: 'الرقم التسلسلي', 
                dataIndex: 'assetSerialNumber', 
                key: 'assetSerialNumber' 
              },
              { 
                title: 'السبب', 
                dataIndex: 'reasonText', 
                key: 'reasonText',
                render: (text: string) => <Tag color="red">{text}</Tag>
              },
              { 
                title: 'تاريخ الاستبعاد', 
                dataIndex: 'disposalDate', 
                key: 'disposalDate',
                render: (date: string) => dayjs(date).format('DD/MM/YYYY')
              },
              { 
                title: 'المنفذ', 
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
      return <Empty description="لا توجد بيانات تقرير الصيانة" />;
    }

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Summary */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="إجمالي الصيانات"
                value={maintenanceReport.summary.totalMaintenance}
                prefix={<ToolOutlined />}
                valueStyle={{ color: '#1677ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="التكلفة الإجمالية"
                value={maintenanceReport.summary.totalCost}
                precision={0}
                suffix={maintenanceReport.summary.currency}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Text type="secondary">فترة التقرير</Text>
              <div>{maintenanceReport.summary.periodCovered}</div>
            </Card>
          </Col>
        </Row>

        {/* Maintenance by Type */}
        <Card title="الصيانات حسب النوع" size="small">
          <Table
            dataSource={maintenanceReport.maintenanceByType}
            columns={[
              { 
                title: 'النوع', 
                dataIndex: 'typeText', 
                key: 'typeText' 
              },
              { 
                title: 'العدد', 
                dataIndex: 'count', 
                key: 'count',
                render: (count: number) => (
                  <Tag color="blue">{count.toLocaleString()}</Tag>
                )
              },
              { 
                title: 'التكلفة الإجمالية', 
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
          <Card title="الصيانات القادمة" size="small">
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
                      {item.daysUntilDue < 0 ? `متأخر ${Math.abs(item.daysUntilDue)} يوم` : 
                       item.daysUntilDue === 0 ? 'مستحق اليوم' :
                       `${item.daysUntilDue} يوم متبقي`}
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
      return <Empty description="لا توجد بيانات تقرير التحويلات" />;
    }

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Summary */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Card>
              <Statistic
                title="إجمالي التحويلات"
                value={transfersReport.summary.totalTransfers}
                prefix={<SwapOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card>
              <Text type="secondary">فترة التقرير</Text>
              <div>{transfersReport.summary.periodCovered}</div>
            </Card>
          </Col>
        </Row>

        {/* Transfers by Category */}
        <Card title="التحويلات حسب الفئة" size="small">
          <Table
            dataSource={transfersReport.transfersByCategory}
            columns={[
              { 
                title: 'الفئة', 
                dataIndex: 'category', 
                key: 'category' 
              },
              { 
                title: 'عدد التحويلات', 
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
        <Card title="التحويلات الأخيرة" size="small">
          <Table
            dataSource={transfersReport.recentTransfers}
            columns={[
              { 
                title: 'اسم الأصل', 
                dataIndex: 'assetName', 
                key: 'assetName' 
              },
              { 
                title: 'من', 
                dataIndex: 'fromLocation', 
                key: 'fromLocation' 
              },
              { 
                title: 'إلى', 
                dataIndex: 'toLocation', 
                key: 'toLocation' 
              },
              { 
                title: 'تاريخ النقل', 
                dataIndex: 'movementDate', 
                key: 'movementDate',
                render: (date: string) => dayjs(date).format('DD/MM/YYYY')
              },
              { 
                title: 'المنفذ', 
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
      return <Empty description="لا توجد بيانات التقرير الشهري" />;
    }

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="الأصول الجديدة"
                value={monthlyReport.summary.assetsCreated}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="الأصول المستبعدة"
                value={monthlyReport.summary.disposals}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="أعمال الصيانة"
                value={monthlyReport.summary.maintenanceRecords}
                valueStyle={{ color: '#1677ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="عمليات النقل"
                value={monthlyReport.summary.transfers}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      </Space>
    );
  };

  const renderLocationDetailReportTab = () => {
    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Filters */}
        <Card size="small" className="no-print">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8}>
              <Select
                style={{ width: '100%' }}
                placeholder="اختر الدائرة"
                allowClear
                value={selectedDepartmentId}
                onChange={handleDepartmentChange}
                options={departments.map(dept => ({
                  label: dept.name,
                  value: dept.id
                }))}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Select
                style={{ width: '100%' }}
                placeholder="اختر القسم"
                allowClear
                value={selectedSectionId}
                onChange={handleSectionChange}
                disabled={!selectedDepartmentId}
                options={sections.map(sec => ({
                  label: sec.name,
                  value: sec.id
                }))}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Space>
                <Button
                  type="primary"
                  icon={<FilterOutlined />}
                  onClick={handleFilterApply}
                  loading={loading}
                >
                  عرض التقرير
                </Button>
                {locationDetailReport && (
                  <Button
                    icon={<PrinterOutlined />}
                    onClick={handlePrintReport}
                  >
                    طباعة
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Report Content */}
        {!locationDetailReport ? (
          <Empty description="اختر الدائرة أو القسم لعرض التقرير" />
        ) : (
          <div ref={printRef} id="print-area">
            {/* Summary */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Statistic
                    title="إجمالي الأصول"
                    value={locationDetailReport.summary.totalAssets}
                    prefix={<DashboardOutlined />}
                    valueStyle={{ color: '#1677ff' }}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <div>
                    <Text type="secondary">الموقع</Text>
                    <div style={{ fontSize: 16, fontWeight: 'bold' }}>
                      {locationDetailReport.summary.locationFilter}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Assets Grid with QR Codes */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px',
              pageBreakInside: 'avoid'
            }}>
              {locationDetailReport.assets.map((asset) => (
                <Card
                  key={asset.id}
                  size="small"
                  style={{
                    pageBreakInside: 'avoid',
                    border: '1px solid #d9d9d9'
                  }}
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {/* Asset Name */}
                    <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>
                      {asset.name}
                    </div>
                    
                    {/* QR Code */}
                    {asset.qrCode && (
                      <div style={{ textAlign: 'center', padding: '8px 0' }}>
                        <QRCode 
                          value={asset.qrCode} 
                          size={120}
                          style={{ margin: '0 auto' }}
                        />
                        <div style={{ fontSize: 12, marginTop: 4, color: '#666' }}>
                          {asset.qrCode}
                        </div>
                      </div>
                    )}
                    
                    {/* Asset Details */}
                    <Divider style={{ margin: '8px 0' }} />
                    <div style={{ fontSize: 13 }}>
                      <div><strong>الرقم التسلسلي:</strong> {asset.serialNumber}</div>
                      {asset.barcode && (
                        <div><strong>الباركود:</strong> {asset.barcode}</div>
                      )}
                      <div><strong>الفئة:</strong> {asset.categoryName}</div>
                      <div>
                        <strong>الحالة:</strong>{' '}
                        <Tag color={asset.statusColor}>{asset.statusName}</Tag>
                      </div>
                      
                      {/* Current Location */}
                      {(asset.currentEmployeeName || asset.currentWarehouseName || 
                        asset.currentDepartmentName || asset.currentSectionName) && (
                        <>
                          <Divider style={{ margin: '8px 0' }} />
                          <div style={{ fontSize: 12 }}>
                            <strong>الموقع الحالي:</strong>
                            {asset.currentEmployeeName && <div>👤 {asset.currentEmployeeName}</div>}
                            {asset.currentDepartmentName && <div>🏢 {asset.currentDepartmentName}</div>}
                            {asset.currentSectionName && <div>📋 {asset.currentSectionName}</div>}
                            {asset.currentWarehouseName && <div>🏪 {asset.currentWarehouseName}</div>}
                          </div>
                        </>
                      )}
                      
                      {/* Additional Info */}
                      {(asset.purchaseDate || asset.purchasePrice) && (
                        <>
                          <Divider style={{ margin: '8px 0' }} />
                          <div style={{ fontSize: 12 }}>
                            {asset.purchaseDate && (
                              <div><strong>تاريخ الشراء:</strong> {dayjs(asset.purchaseDate).format('DD/MM/YYYY')}</div>
                            )}
                            {asset.purchasePrice && (
                              <div><strong>السعر:</strong> {asset.purchasePrice.toLocaleString()} ILS</div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </Space>
                </Card>
              ))}
            </div>

            {/* Print Footer */}
            <div style={{ 
              marginTop: 24, 
              textAlign: 'center', 
              fontSize: 12, 
              color: '#999',
              pageBreakBefore: 'avoid'
            }}>
              تم إنشاء التقرير في: {dayjs(locationDetailReport.summary.generatedAt).format('DD/MM/YYYY HH:mm')}
            </div>
          </div>
        )}
      </Space>
    );
  };

  return (
    <MainLayout>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #print-area, #print-area * {
              visibility: visible;
            }
            #print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
            @page {
              size: A4;
              margin: 10mm;
            }
          }
        `}
      </style>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FileTextOutlined style={{ marginRight: 8 }} />
              <span>التقارير</span>
            </div>
            <Space>
              <RangePicker
                onChange={handleDateRangeChange}
                placeholder={['تاريخ البداية', 'تاريخ النهاية']}
                style={{ width: 250 }}
              />
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleRefresh}
                loading={loading}
              >
                تحديث
              </Button>
              <Button 
                icon={<DownloadOutlined />}
                type="primary"
                disabled
              >
                تصدير
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
                  ملخص الأصول
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
                  الأصول المستبعدة
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
                  الصيانة
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
                  التحويلات
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
                  التقرير الشهري
                </span>
              }
              key="monthly"
            >
              {renderMonthlyReportTab()}
            </Tabs.TabPane>

            <Tabs.TabPane
              tab={
                <span>
                  <QrcodeOutlined />
                  طباعة QR Code حسب الموقع
                </span>
              }
              key="locationDetail"
            >
              {renderLocationDetailReportTab()}
            </Tabs.TabPane>
          </Tabs>
        </Spin>
      </Card>
    </MainLayout>
  );
}