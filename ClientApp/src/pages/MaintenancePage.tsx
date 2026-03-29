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
import { maintenanceApi, AssetMaintenance, MaintenanceType, MaintenanceStatus } from '../api/maintenance.api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { confirm } = Modal;

export default function MaintenancePage() {
  console.log('?? MaintenancePage component loaded');

  const navigate = useNavigate();
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
          message.info('No maintenance records found. Create maintenance records for your assets.');
        }
      }
    } catch (error) {
      console.error('?? Failed to load maintenance records:', error);
      message.error('Failed to load maintenance records');
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
      message.success('Maintenance completed successfully');
      fetchMaintenance();
      fetchStats();
    } catch (error) {
      console.error('Failed to complete maintenance:', error);
      message.error('Failed to complete maintenance');
    }
  };

  const handleCancelMaintenance = (id: number) => {
    confirm({
      title: 'Cancel Maintenance',
      content: 'Are you sure you want to cancel this maintenance?',
      okText: 'Yes, Cancel',
      okType: 'danger',
      cancelText: 'No',
      async onOk() {
        try {
          await maintenanceApi.cancel(id, 'Cancelled by user');
          message.success('Maintenance cancelled successfully');
          fetchMaintenance();
          fetchStats();
        } catch (error) {
          console.error('Failed to cancel maintenance:', error);
          message.error('Failed to cancel maintenance');
        }
      },
    });
  };

  const handleDeleteMaintenance = (id: number) => {
    confirm({
      title: 'Delete Maintenance Record',
      content: 'Are you sure you want to delete this maintenance record? This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No',
      async onOk() {
        try {
          await maintenanceApi.delete(id);
          message.success('Maintenance record deleted successfully');
          fetchMaintenance();
          fetchStats();
        } catch (error) {
          console.error('Failed to delete maintenance:', error);
          message.error('Failed to delete maintenance record');
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
      case 1: return 'blue';      // Preventive (????? ??????)
      case 2: return 'orange';    // Corrective (????? ???????)
      case 3: return 'red';       // Emergency (????? ?????)
      case 4: return 'green';     // Routine (????? ?????)
      case 5: return 'purple';    // Upgrade (????? ??????)
      default: return 'default';
    }
  };

  const getActionMenuItems = (record: AssetMaintenance) => {
    const items = [
      {
        key: 'view',
        label: (
          <Space>
            <EyeOutlined />
            View Asset
          </Space>
        ),
        onClick: () => navigate(`/assets/${record.assetId}`),
      },
    ];

    // Add complete action for scheduled/in-progress maintenance
    if (record.status === 1 || record.status === 2) {
      items.push({
        key: 'complete',
        label: (
          <Space>
            <CheckCircleOutlined />
            Complete
          </Space>
        ),
        onClick: () => handleCompleteMaintenance(record.id),
      });
    }

    // Add cancel action for scheduled maintenance
    if (record.status === 1) {
      items.push({
        key: 'cancel',
        label: (
          <Space style={{ color: 'red' }}>
            <ExclamationCircleOutlined />
            Cancel
          </Space>
        ),
        onClick: () => handleCancelMaintenance(record.id),
      });
    }

    // Add delete action (Admin only)
    items.push({
      key: 'delete',
      label: (
        <Space style={{ color: 'red' }}>
          <DeleteOutlined />
          Delete
        </Space>
      ),
      onClick: () => handleDeleteMaintenance(record.id),
    });

    return items;
  };

  const columns = [
    {
      title: 'Asset',
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
      title: 'Type',
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
      title: 'Description',
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
      title: 'Date',
      dataIndex: 'maintenanceDate',
      key: 'maintenanceDate',
      width: 100,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Status',
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
      title: 'Cost',
      dataIndex: 'cost',
      key: 'cost',
      width: 100,
      render: (cost: number, record: AssetMaintenance) => 
        cost ? `${cost.toLocaleString()} ${record.currency}` : '-',
    },
    {
      title: 'Next Due',
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
            {isOverdue && <div style={{ fontSize: 10 }}>OVERDUE</div>}
            {isUpcoming && !isOverdue && <div style={{ fontSize: 10 }}>DUE SOON</div>}
          </div>
        );
      },
    },
    {
      title: 'Performed By',
      dataIndex: 'performedBy',
      key: 'performedBy',
      width: 120,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right' as const,
      render: (_: any, record: AssetMaintenance) => (
        <Dropdown
          menu={{ items: getActionMenuItems(record) }}
          trigger={['click']}
        >
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined />}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      ),
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
                title="Total Records"
                value={stats.totalMaintenanceRecords}
                prefix={<ToolOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Pending"
                value={stats.pendingMaintenance}
                valueStyle={{ color: '#1677ff' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Overdue"
                value={stats.overdueMaintenance}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="This Month Cost"
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
              <span>Maintenance Records</span>
            </div>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => navigate('/assets')}
              >
                Schedule Maintenance
              </Button>
            </Space>
          </div>
        }
      >
        {/* Filters */}
        <Space size="middle" style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space wrap>
            <Input.Search
              placeholder="Search by asset name, description, or technician"
              style={{ width: 300 }}
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
            />
            <Select
              placeholder="Filter by type"
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
              placeholder="Filter by status"
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
              placeholder={['Start date', 'End date']}
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
              `${range[0]}-${range[1]} of ${total} maintenance records`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          size="small"
          locale={{
            emptyText: loading ? 'Loading...' : (
              <div style={{ padding: 20, textAlign: 'center' }}>
                <ToolOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
                <div>No maintenance records found</div>
                <div style={{ color: '#999', marginTop: 8 }}>
                  {maintenance.length === 0 && !loading 
                    ? 'Schedule maintenance for your assets to get started'
                    : 'Try adjusting your search filters'
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