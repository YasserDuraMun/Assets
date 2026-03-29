import { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Select, Tag, message, Popconfirm, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined, QrcodeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import DisposalModal from '../components/DisposalModal';
import { assetApi } from '../api/asset.api';
import { categoryApi } from '../api/category.api';
import { statusApi } from '../api/status.api';
import type { Asset, AssetCategory, AssetStatus } from '../types';

export default function AssetsPage() {
const navigate = useNavigate();
const [assets, setAssets] = useState<Asset[]>([]);
const [categories, setCategories] = useState<AssetCategory[]>([]);
const [statuses, setStatuses] = useState<AssetStatus[]>([]);
const [loading, setLoading] = useState(false);
  
// Disposal modal state
const [disposalModalVisible, setDisposalModalVisible] = useState(false);
const [selectedAssetForDisposal, setSelectedAssetForDisposal] = useState<Asset | undefined>();
  
const [pagination, setPagination] = useState({
  current: 1,
  pageSize: 10,
  total: 0,
});
const [filters, setFilters] = useState({
  search: '',
  categoryId: undefined as number | undefined,
  statusId: undefined as number | undefined,
});

  useEffect(() => {
    fetchCategories();
    fetchStatuses();
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await assetApi.getAll({
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
        search: filters.search || undefined,
        categoryId: filters.categoryId,
        statusId: filters.statusId,
      });

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setAssets(data.items || []);
        setPagination(prev => ({
          ...prev,
          total: data.totalCount || 0,
        }));
      }
    } catch (error) {
      console.error('Failed to load assets:', error);
      message.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      if (response.data.success && response.data.data) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await statusApi.getAll();
      if (response.data.success && response.data.data) {
        setStatuses(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load statuses:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await assetApi.delete(id);
      message.success('Asset deleted successfully');
      fetchAssets();
    } catch (error) {
      message.error('Failed to delete asset');
    }
  };

  const handleDispose = (asset: Asset) => {
    if (asset.statusName === 'Disposed') {
      message.warning('This asset has already been disposed');
      return;
    }
    setSelectedAssetForDisposal(asset);
    setDisposalModalVisible(true);
  };

  const handleDisposalSuccess = () => {
    setDisposalModalVisible(false);
    setSelectedAssetForDisposal(undefined);
    fetchAssets(); // Refresh the list
  };

  const handleDisposalCancel = () => {
    setDisposalModalVisible(false);
    setSelectedAssetForDisposal(undefined);
  };

  const handleTableChange = (newPagination: any) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: pagination.total,
    });
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleCategoryFilter = (value: number | undefined) => {
    setFilters(prev => ({ ...prev, categoryId: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleStatusFilter = (value: number | undefined) => {
    setFilters(prev => ({ ...prev, statusId: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const columns = [
    {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      width: 150,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Category',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 150,
    },
    {
      title: 'Status',
      dataIndex: 'statusName',
      key: 'statusName',
      width: 120,
      render: (text: string, record: Asset) => (
        <Tag color={record.statusColor || 'default'}>{text}</Tag>
      ),
    },
    {
      title: 'Current Location',
      key: 'location',
      width: 200,
      render: (_: unknown, record: Asset) => {
        switch (record.currentLocationType) {
          case 'Employee':
            return <Tag color="blue">Employee: {record.currentEmployeeName}</Tag>;
          case 'Warehouse':
            return <Tag color="green">Warehouse: {record.currentWarehouseName}</Tag>;
          case 'Department':
            return <Tag color="orange">Department: {record.currentDepartmentName}</Tag>;
          case 'Section':
            return <Tag color="purple">Section: {record.currentSectionName}</Tag>;
          default:
            return <Tag color="default">Unknown</Tag>;
        }
      },
    },
    {
      title: 'Purchase Date',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      width: 120,
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 280,
      fixed: 'right' as const,
      render: (_: unknown, record: Asset) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/assets/${record.id}`)}
          >
            View
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/assets/${record.id}/edit`)}
          >
            Edit
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDispose(record)}
            disabled={record.statusName === 'Disposed'}
            title={record.statusName === 'Disposed' ? 'Asset already disposed' : 'Dispose asset'}
          >
            Dispose
          </Button>
          <Popconfirm
            title="Delete this asset?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Assets Management</span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/assets/add')}
            >
              Add Asset
            </Button>
          </div>
        }
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap>
            <Input.Search
              placeholder="Search by name or serial number..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch('')}
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="Filter by Category"
              allowClear
              style={{ width: 200 }}
              onChange={handleCategoryFilter}
            >
              {categories.map(cat => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
            <Select
              placeholder="Filter by Status"
              allowClear
              style={{ width: 200 }}
              onChange={handleStatusFilter}
            >
              {statuses.map(status => (
                <Select.Option key={status.id} value={status.id}>
                  {status.name}
                </Select.Option>
              ))}
            </Select>
            
            <Button 
              onClick={() => navigate('/disposals')}
              style={{ marginLeft: 8 }}
            >
              View Disposed Assets
            </Button>
          </Space>

          <Table
            columns={columns}
            dataSource={assets}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} assets`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
          />
        </Space>
      </Card>

      {/* Disposal Modal */}
      <DisposalModal
        visible={disposalModalVisible}
        asset={selectedAssetForDisposal}
        onCancel={handleDisposalCancel}
        onSuccess={handleDisposalSuccess}
      />
    </MainLayout>
  );
}
