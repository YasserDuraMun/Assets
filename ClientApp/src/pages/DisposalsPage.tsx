import { useState, useEffect } from 'react';
import { Table, Card, Input, Select, DatePicker, Space, Tag, Button, message } from 'antd';
import { SearchOutlined, CalendarOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { disposalApi } from '../api/disposal.api';
import type { AssetDisposal, DisposalReason } from '../types';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export default function DisposalsPage() {
console.log('??? DisposalsPage component loaded');
  
const navigate = useNavigate();
const [disposals, setDisposals] = useState<AssetDisposal[]>([]);
const [disposalReasons, setDisposalReasons] = useState<DisposalReason[]>([]);
const [loading, setLoading] = useState(false);
const [pagination, setPagination] = useState({
  current: 1,
  pageSize: 10,
  total: 0,
});
const [filters, setFilters] = useState({
  search: '',
  disposalReason: undefined as number | undefined,
  dateRange: null as any,
});

console.log('?? Current state:', { disposals: disposals.length, loading, pagination });

  useEffect(() => {
    fetchDisposalReasons();
  }, []);

  useEffect(() => {
    fetchDisposals();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchDisposals = async () => {
    setLoading(true);
    console.log('?? Loading disposals...');
    try {
      const params: any = {
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
        searchTerm: filters.search || undefined,
        disposalReason: filters.disposalReason,
      };

      if (filters.dateRange?.length === 2) {
        params.startDate = filters.dateRange[0].startOf('day').toISOString();
        params.endDate = filters.dateRange[1].endOf('day').toISOString();
      }

      console.log('?? API params:', params);

      const response = await disposalApi.getAll(params);
      console.log('?? API response:', response);

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        console.log('? Disposals data:', data);
        setDisposals(data.items || []);
        setPagination(prev => ({
          ...prev,
          total: data.totalCount || 0,
        }));
      } else {
        console.warn('?? API response not successful:', response.data);
        setDisposals([]);
        
        // ??? ?? ??? ???? ??????? ???? ?????
        if (pagination.current === 1) {
          message.info('No disposed assets found. Try disposing an asset first.');
        }
      }
    } catch (error) {
      console.error('?? Failed to load disposals:', error);
      message.error('Failed to load disposed assets');
      setDisposals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDisposalReasons = async () => {
    try {
      const response = await disposalApi.getDisposalReasons();
      if (response.data.success && response.data.data) {
        setDisposalReasons(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load disposal reasons:', error);
    }
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleReasonFilter = (value: number | undefined) => {
    setFilters(prev => ({ ...prev, disposalReason: value }));
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

  const getReasonColor = (reason: string): string => {
    switch (reason.toLowerCase()) {
      case 'damaged': return 'red';
      case 'obsolete': return 'orange';
      case 'lost': return 'purple';
      case 'stolen': return 'magenta';
      case 'endoflife': return 'blue';
      case 'maintenance': return 'cyan';
      case 'replacement': return 'green';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Asset Name',
      dataIndex: 'assetName',
      key: 'assetName',
      width: 200,
    },
    {
      title: 'Serial Number',
      dataIndex: 'assetSerialNumber',
      key: 'assetSerialNumber',
      width: 150,
    },
    {
      title: 'Disposal Date',
      dataIndex: 'disposalDate',
      key: 'disposalDate',
      width: 120,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Reason',
      dataIndex: 'disposalReason',
      key: 'disposalReason',
      width: 150,
      render: (reason: string) => (
        <Tag color={getReasonColor(reason)}>
          {reason}
        </Tag>
      ),
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: 'Performed By',
      dataIndex: 'performedBy',
      key: 'performedBy',
      width: 150,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_: unknown, record: AssetDisposal) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/assets/${record.assetId}?includeDeleted=true`)}
        >
          View Asset
        </Button>
      ),
    },
  ];

  return (
    <MainLayout>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CalendarOutlined style={{ marginRight: 8 }} />
              <span>Disposed Assets</span>
            </div>
            <Button 
              type="primary" 
              onClick={() => navigate('/assets')}
            >
              Back to Assets
            </Button>
          </div>
        }
      >
        {/* Filters */}
        <Space size="middle" style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Input.Search
              placeholder="Search by asset name or serial number"
              style={{ width: 250 }}
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
            />
            <Select
              placeholder="Filter by reason"
              style={{ width: 200 }}
              allowClear
              onChange={handleReasonFilter}
            >
              {disposalReasons.map(reason => (
                <Select.Option key={reason.value} value={reason.value}>
                  {reason.label}
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
          dataSource={disposals}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} disposed assets`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
          size="small"
          locale={{
            emptyText: loading ? 'Loading...' : (
              <div style={{ padding: 20, textAlign: 'center' }}>
                <CalendarOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
                <div>No disposed assets found</div>
                <div style={{ color: '#999', marginTop: 8 }}>
                  {disposals.length === 0 && !loading 
                    ? 'Try disposing an asset from the Assets page first'
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