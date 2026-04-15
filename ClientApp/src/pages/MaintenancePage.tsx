import { useState, useEffect } from 'react';
import { 
  Table, Card, Input, Select, DatePicker, Space, Tag, Button, message, 
  Tooltip, Dropdown, Modal, Statistic, Row, Col 
} from 'antd';
import { 
  SearchOutlined, CalendarOutlined, PlusOutlined, ToolOutlined,
  CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
  EyeOutlined, EditOutlined, DeleteOutlined, MoreOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import PermissionWrapper from '../components/PermissionWrapper';
import usePermissions from '../hooks/usePermissions';
import { maintenanceApi, AssetMaintenance, MaintenanceType, MaintenanceStatus } from '../api/maintenance.api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { confirm } = Modal;

export default function MaintenancePage() {
console.log('📋 MaintenancePage component loaded');

const navigate = useNavigate();
const { getScreenPermissions } = usePermissions();
const maintenancePermissions = getScreenPermissions('Maintenance');
const [maintenance, setMaintenance] = useState<AssetMaintenance[]>([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState<MaintenanceType[]>([]);
  const [maintenanceStatuses, setMaintenanceStatuses] = useState<MaintenanceStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    maintenanceType: undefined as number | undefined,
    status: undefined as number | undefined,
    dateRange: null as any,
  });

  console.log('?? Current state:', { 
    maintenance: maintenance.length, 
    loading, 
    pagination,
    stats: !!stats 
  });

  useEffect(() => {
    fetchMaintenanceTypes();
    fetchMaintenanceStatuses();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchMaintenance();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchMaintenance = async () => {
    setLoading(true);
    console.log('?? Loading maintenance records...');
    try {
      const params: any = {
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
        searchTerm: filters.search || undefined,
        maintenanceType: filters.maintenanceType,
        status: filters.status,
      };

      if (filters.dateRange?.length === 2) {
        params.startDate = filters.dateRange[0].startOf('day').toISOString();
        params.endDate = filters.dateRange[1].endOf('day').toISOString();
      }

      console.log('?? API params:', params);

      const response = await maintenanceApi.getAll(params);
      console.log('?? API response:', response);

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        console.log('? Maintenance data:', data);
        setMaintenance(data.items || []);
        setPagination(prev => ({
          ...prev,
          total: data.totalCount || 0,
        }));
      } else {
        console.warn('?? API response not successful:', response.data);
        setMaintenance([]);
        
        if (pagination.current === 1) {
          message.info('لم يتم العثور على سجلات صيانة. إنشاء سجلات صيانة لأصولك.');
        }
      }
    } catch (error) {
      console.error('?? Failed to load maintenance records:', error);
      message.error('فشل تحميل سجلات الصيانة');
      setMaintenance([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaintenanceTypes = async () => {
    try {
      console.log('?? Loading maintenance types...');
      const response = await maintenanceApi.getMaintenanceTypes();
      if (response.data.success && response.data.data) {
        setMaintenanceTypes(response.data.data);
        console.log('? Maintenance types loaded:', response.data.data.length);
      }
    } catch (error) {
      console.error('Failed to load maintenance types:', error);
    }
  };

  const fetchMaintenanceStatuses = async () => {
    try {
      console.log('?? Loading maintenance statuses...');
      const response = await maintenanceApi.getMaintenanceStatuses();
      if (response.data.success && response.data.data) {
        setMaintenanceStatuses(response.data.data);
        console.log('? Maintenance statuses loaded:', response.data.data.length);
      }
    } catch (error) {
      console.error('Failed to load maintenance statuses:', error);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('?? Loading maintenance statistics...');
      const response = await maintenanceApi.getStats();
      if (response.data.success && response.data.data) {
        setStats(response.data.data);
        console.log('? Statistics loaded:', response.data.data);
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleTypeFilter = (value: number | undefined) => {
    setFilters(prev => ({ ...prev, maintenanceType: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleStatusFilter = (value: number | undefined) => {
    setFilters(prev => ({ ...prev, status: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleDateRangeChange = (dates: any) => {
    setFilters(prev => ({ ...prev, dateRange: dates }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (pag: any) => {
    setPagination(prev => ({
      ...prev,
      current: pag.current,
      pageSize: pag.pageSize,
    }));
  };

  const handleCompleteMaintenance = async (id: number) => {
    try {
      const completeData = {
        id,
        completedDate: new Date().toISOString(),
      };

      await maintenanceApi.complete(id, completeData);
      message.success('تم إكمال الصيانة بنجاح');
      fetchMaintenance();
      fetchStats();
    } catch (error) {
      console.error('Failed to complete maintenance:', error);
      message.error('فشل إكمال الصيانة');
    }
  };

  const handleCancelMaintenance = (id: number) => {
    confirm({
      title: 'إلغاء الصيانة',
      content: 'هل أنت متأكد من إلغاء هذه الصيانة؟',
      okText: 'نعم، إلغاء',
      okType: 'danger',
      cancelText: 'لا',
      async onOk() {
        try {
          await maintenanceApi.cancel(id, 'Cancelled by user');
          message.success('تم إلغاء الصيانة بنجاح');
          fetchMaintenance();
          fetchStats();
        } catch (error) {
          console.error('Failed to cancel maintenance:', error);
          message.error('فشل إلغاء الصيانة');
        }
      },
    });
  };

  const handleDeleteMaintenance = (id: number) => {
    confirm({
      title: 'حذف سجل الصيانة',
      content: 'هل أنت متأكد من حذف سجل الصيانة هذا؟ لا يمكن التراجع عن هذا الإجراء.',
      okText: 'نعم، حذف',
      okType: 'danger',
      cancelText: 'لا',
      async onOk() {
        try {
          await maintenanceApi.delete(id);
          message.success('تم حذف سجل الصيانة بنجاح');
          fetchMaintenance();
          fetchStats();
        } catch (error) {
          console.error('Failed to delete maintenance:', error);
          message.error('فشل حذف سجل الصيانة');
        }
      },
    });
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 1: return <ClockCircleOutlined />; // Scheduled
      case 2: return <ToolOutlined />; // InProgress
      case 3: return <CheckCircleOutlined />; // Completed
      case 4: return <ExclamationCircleOutlined />; // Cancelled
      default: return <ClockCircleOutlined />;
    }
  };

  const getTypeColor = (type: number): string => {
    switch (type) {
      case 1: return 'blue';      // Preventive
      case 2: return 'orange';    // Corrective
      case 3: return 'red';       // Emergency
      case 4: return 'green';     // Routine
      case 5: return 'purple';    // Upgrade
      default: return 'default';
    }
  };

  const getActionMenuItems = (record: AssetMaintenance) => {
    const items = [];

    console.log(`🔍 MaintenancePage: Getting actions for maintenance ${record.id}`);
    console.log(`📋 Maintenance permissions:`, maintenancePermissions);
    console.log(`📋 Record status: ${record.status} (1=Scheduled, 2=InProgress, 3=Completed, 4=Cancelled)`);

    // View asset action - show if user has view permission
    if (maintenancePermissions.canView) {
      console.log('✅ Adding view action');
      items.push({
        key: 'view',
        label: (
          <Space>
            <EyeOutlined />
            عرض الأصل
          </Space>
        ),
        onClick: () => navigate(`/assets/${record.assetId}`),
      });
    }

    // Add complete action for scheduled/in-progress maintenance - requires update permission
    if (maintenancePermissions.canUpdate && (record.status === 1 || record.status === 2)) {
      console.log('✅ Adding complete action');
      items.push({
        key: 'complete',
        label: (
          <Space>
            <CheckCircleOutlined />
            إكمال
          </Space>
        ),
        onClick: () => handleCompleteMaintenance(record.id),
      });
    } else {
      console.log(`❌ Complete action NOT added - canUpdate: ${maintenancePermissions.canUpdate}, status: ${record.status}`);
    }

    // Add cancel action for scheduled maintenance - requires update permission
    if (maintenancePermissions.canUpdate && record.status === 1) {
      console.log('✅ Adding cancel action');
      items.push({
        key: 'cancel',
        label: (
          <Space style={{ color: 'red' }}>
            <ExclamationCircleOutlined />
            إلغاء
          </Space>
        ),
        onClick: () => handleCancelMaintenance(record.id),
      });
    } else {
      console.log(`❌ Cancel action NOT added - canUpdate: ${maintenancePermissions.canUpdate}, status: ${record.status}`);
    }

    // Add delete action - requires delete permission
    if (maintenancePermissions.canDelete) {
      console.log('✅ Adding delete action');
      items.push({
        key: 'delete',
        label: (
          <Space style={{ color: 'red' }}>
            <DeleteOutlined />
            حذف
          </Space>
        ),
        onClick: () => handleDeleteMaintenance(record.id),
      });
    } else {
      console.log(`❌ Delete action NOT added - canDelete: ${maintenancePermissions.canDelete}`);
    }

    console.log(`📋 Final actions for maintenance ${record.id}:`, items.map(i => i.key));
    return items;
  };

  const columns = [
    {
      title: 'الأصل',
      key: 'asset',
      width: 200,
      render: (_: any, record: AssetMaintenance) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.assetName}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.assetSerialNumber}</div>
        </div>
      ),
    },
    {
      title: 'النوع',
      dataIndex: 'maintenanceType',
      key: 'maintenanceType',
      width: 120,
      render: (type: number, record: AssetMaintenance) => (
        <Tag color={getTypeColor(type)}>
          {record.maintenanceTypeText}
        </Tag>
      ),
    },
    {
      title: 'الوصف',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: 'التاريخ',
      dataIndex: 'maintenanceDate',
      key: 'maintenanceDate',
      width: 100,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'الحالة',
      key: 'status',
      width: 120,
      render: (_: any, record: AssetMaintenance) => (
        <Tag 
          color={record.statusColor} 
          icon={getStatusIcon(record.status)}
        >
          {record.statusText}
        </Tag>
      ),
    },
    {
      title: 'التكلفة',
      dataIndex: 'cost',
      key: 'cost',
      width: 100,
      render: (cost: number, record: AssetMaintenance) => 
        cost ? `${cost.toLocaleString()} ${record.currency}` : '-',
    },
    {
      title: 'الصيانة التالية',
      dataIndex: 'nextMaintenanceDate',
      key: 'nextMaintenanceDate',
      width: 100,
      render: (date: string, record: AssetMaintenance) => {
        if (!date) return '-';
        
        const isOverdue = record.isOverdue;
        const isUpcoming = record.isUpcoming;
        
        return (
          <div style={{ 
            color: isOverdue ? 'red' : isUpcoming ? 'orange' : 'inherit' 
          }}>
            {dayjs(date).format('DD/MM/YYYY')}
            {isOverdue && <div style={{ fontSize: 10 }}>متأخرة</div>}
            {isUpcoming && !isOverdue && <div style={{ fontSize: 10 }}>قريبة</div>}
          </div>
        );
      },
    },
    {
      title: 'نفذها',
      dataIndex: 'performedBy',
      key: 'performedBy',
      width: 120,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      width: 80,
      fixed: 'right' as const,
      render: (_: any, record: AssetMaintenance) => {
        const menuItems = getActionMenuItems(record);
        
        // Only show dropdown if there are items available
        if (menuItems.length === 0) {
          console.log(`❌ No actions available for maintenance ${record.id}`);
          return null;
        }

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
          >
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <MainLayout>
      {/* Statistics Cards */}
      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="إجمالي السجلات"
                value={stats.totalMaintenanceRecords}
                prefix={<ToolOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="قيد الانتظار"
                value={stats.pendingMaintenance}
                valueStyle={{ color: '#1677ff' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="متأخرة"
                value={stats.overdueMaintenance}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="تكلفة هذا الشهر"
                value={stats.totalCostThisMonth}
                precision={0}
                suffix={stats.currency}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ToolOutlined style={{ marginRight: 8 }} />
              <span>سجلات الصيانة</span>
            </div>
            <PermissionWrapper screenName="Maintenance" permission="create">
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => navigate('/assets')}
              >
                جدولة صيانة
              </Button>
            </PermissionWrapper>
          </div>
        }
      >
        {/* Filters */}
        <Space size="middle" style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space wrap>
            <Input.Search
              placeholder="البحث باسم الأصل، الوصف، أو الفني"
              style={{ width: 300 }}
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
            />
            <Select
              placeholder="التصفية حسب النوع"
              style={{ width: 160 }}
              allowClear
              onChange={handleTypeFilter}
            >
              {maintenanceTypes.map(type => (
                <Select.Option key={type.value} value={type.value}>
                  {type.label}
                </Select.Option>
              ))}
            </Select>
            <Select
              placeholder="التصفية حسب الحالة"
              style={{ width: 160 }}
              allowClear
              onChange={handleStatusFilter}
            >
              {maintenanceStatuses.map(status => (
                <Select.Option key={status.value} value={status.value}>
                  <Tag color={status.color}>{status.label}</Tag>
                </Select.Option>
              ))}
            </Select>
            <RangePicker
              placeholder={['تاريخ البداية', 'تاريخ النهاية']}
              onChange={handleDateRangeChange}
              style={{ width: 250 }}
            />
          </Space>
        </Space>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={maintenance}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} من ${total} سجل صيانة`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          size="small"
          locale={{
            emptyText: loading ? 'جاري التحميل...' : (
              <div style={{ padding: 20, textAlign: 'center' }}>
                <ToolOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
                <div>لم يتم العثور على سجلات صيانة</div>
                <div style={{ color: '#999', marginTop: 8 }}>
                  {maintenance.length === 0 && !loading 
                    ? 'جدول صيانة لأصولك للبدء'
                    : 'جرّب تعديل معايير البحث'
                  }
                </div>
              </div>
            )
          }}
        />
      </Card>
    </MainLayout>
  );
}