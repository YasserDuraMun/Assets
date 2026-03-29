import { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Select, Tag, message, Card, DatePicker } from 'antd';
import { PlusOutlined, EyeOutlined, SwapOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { transferApi, type Transfer } from '../api/transfer.api';
import { assetApi } from '../api/asset.api';
import { employeeApi } from '../api/employee.api';
import type { Asset, Employee } from '../types';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export default function TransfersPage() {
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    assetId: undefined as number | undefined,
    employeeId: undefined as number | undefined,
    dateRange: undefined as [dayjs.Dayjs, dayjs.Dayjs] | undefined,
  });

  useEffect(() => {
    fetchTransfers();
    fetchAssets();
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchTransfers();
  }, [filters.assetId, filters.employeeId]);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const response = await transferApi.getAll(filters.assetId, filters.employeeId);
      if (response.data.success && response.data.data) {
        let transfersData = response.data.data;

        // Apply search filter
        if (filters.search) {
          transfersData = transfersData.filter(transfer =>
            transfer.assetName.toLowerCase().includes(filters.search.toLowerCase()) ||
            transfer.assetSerialNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
            transfer.performedBy.toLowerCase().includes(filters.search.toLowerCase())
          );
        }

        // Apply date range filter
        if (filters.dateRange) {
          const [startDate, endDate] = filters.dateRange;
          transfersData = transfersData.filter(transfer => {
            const transferDate = dayjs(transfer.transferDate);
            return transferDate.isAfter(startDate.startOf('day')) && 
                   transferDate.isBefore(endDate.endOf('day'));
          });
        }

        setTransfers(transfersData);
      }
    } catch (error) {
      console.error('Failed to load transfers:', error);
      message.error('Failed to load transfers');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      // Get first page of assets for dropdown (we'll need a separate API for this)
      const response = await assetApi.getAll({ pageNumber: 1, pageSize: 100 });
      if (response.data.success && response.data.data?.items) {
        setAssets(response.data.data.items);
      }
    } catch (error) {
      console.error('Failed to load assets:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeApi.getActive();
      if (response.data.success && response.data.data) {
        setEmployees(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    // Trigger re-filter
    setTimeout(fetchTransfers, 100);
  };

  const handleAssetFilter = (value: number | undefined) => {
    setFilters(prev => ({ ...prev, assetId: value }));
  };

  const handleEmployeeFilter = (value: number | undefined) => {
    setFilters(prev => ({ ...prev, employeeId: value }));
  };

  const handleDateRangeFilter = (dates: any) => {
    setFilters(prev => ({ 
      ...prev, 
      dateRange: dates && dates[0] && dates[1] ? [dates[0], dates[1]] : undefined 
    }));
    // Trigger re-filter
    setTimeout(fetchTransfers, 100);
  };

  const columns = [
    {
      title: 'Asset',
      key: 'asset',
      width: 200,
      render: (_: unknown, record: Transfer) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.assetName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            S/N: {record.assetSerialNumber}
          </div>
        </div>
      ),
    },
    {
      title: 'Transfer Date',
      dataIndex: 'transferDate',
      key: 'transferDate',
      width: 120,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
      sorter: (a: Transfer, b: Transfer) => 
        dayjs(a.transferDate).unix() - dayjs(b.transferDate).unix(),
    },
    {
      title: 'From Location',
      dataIndex: 'fromLocation',
      key: 'fromLocation',
      width: 150,
      render: (location: string) => location ? (
        <Tag color="orange">{location}</Tag>
      ) : (
        <Tag color="default">Unknown</Tag>
      ),
    },
    {
      title: 'To Location',
      dataIndex: 'toLocation',
      key: 'toLocation',
      width: 150,
      render: (location: string) => location ? (
        <Tag color="green">{location}</Tag>
      ) : (
        <Tag color="default">Unknown</Tag>
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      width: 150,
      render: (reason: string) => reason || '-',
    },
    {
      title: 'Performed By',
      dataIndex: 'performedBy',
      key: 'performedBy',
      width: 120,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: unknown, record: Transfer) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/transfers/${record.id}`)}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><SwapOutlined /> Asset Transfers</span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/transfers/new')}
            >
              New Transfer
            </Button>
          </div>
        }
      >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap>
            <Input.Search
              placeholder="Search by asset name, S/N, or performed by..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch('')}
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="Filter by Asset"
              allowClear
              style={{ width: 200 }}
              onChange={handleAssetFilter}
              showSearch
              optionFilterProp="children"
            >
              {assets.map(asset => (
                <Select.Option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.serialNumber})
                </Select.Option>
              ))}
            </Select>
            <Select
              placeholder="Filter by Employee"
              allowClear
              style={{ width: 200 }}
              onChange={handleEmployeeFilter}
              showSearch
              optionFilterProp="children"
            >
              {employees.map(employee => (
                <Select.Option key={employee.id} value={employee.id}>
                  {employee.fullName}
                </Select.Option>
              ))}
            </Select>
            <RangePicker
              placeholder={['Start Date', 'End Date']}
              onChange={handleDateRangeFilter}
              style={{ width: 250 }}
            />
          </Space>

          <Table
            columns={columns}
            dataSource={transfers}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} transfers`,
            }}
            scroll={{ x: 1000 }}
          />
        </Space>
      </Card>
    </MainLayout>
  );
}