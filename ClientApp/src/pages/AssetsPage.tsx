import { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Select, Tag, message, Popconfirm, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined, QrcodeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import DisposalModal from '../components/DisposalModal';
import { assetApi } from '../api/asset.api';
import { categoryApi } from '../api/category.api';
import { statusApi } from '../api/status.api';
import { departmentApi } from '../api/department.api';
import { sectionApi } from '../api/section.api';
import { employeeApi } from '../api/employee.api';
import { warehouseApi } from '../api/warehouse.api';
import type { Asset, AssetCategory, AssetStatus, Department, Section, Employee, Warehouse } from '../types';

export default function AssetsPage() {
const navigate = useNavigate();
const [assets, setAssets] = useState<Asset[]>([]);
const [categories, setCategories] = useState<AssetCategory[]>([]);
const [statuses, setStatuses] = useState<AssetStatus[]>([]);
const [departments, setDepartments] = useState<Department[]>([]);
const [sections, setSections] = useState<Section[]>([]);
const [employees, setEmployees] = useState<Employee[]>([]);
const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
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
  departmentId: undefined as number | undefined,
  sectionId: undefined as number | undefined,
  employeeId: undefined as number | undefined,
  warehouseId: undefined as number | undefined,
});

  useEffect(() => {
    fetchCategories();
    fetchStatuses();
    fetchDepartments();
    fetchEmployees();
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = {
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
        search: filters.search || undefined,
        categoryId: filters.categoryId,
        statusId: filters.statusId,
        departmentId: filters.departmentId,
        sectionId: filters.sectionId,
        employeeId: filters.employeeId,
        warehouseId: filters.warehouseId,
      };
      
      console.log('🔍 Fetching assets with params:', params);
      
      const response = await assetApi.getAll(params);

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        console.log('📦 Assets received:', data.items?.length, 'items');
        setAssets(data.items || []);
        setPagination(prev => ({
          ...prev,
          total: data.totalCount || 0,
        }));
      }
    } catch (error) {
      console.error('Failed to load assets:', error);
      message.error('فشل تحميل الأصول');
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

  const fetchDepartments = async () => {
    try {
      const response = await departmentApi.getAll();
      if (response.data.success && response.data.data) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const fetchSections = async (departmentId: number) => {
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

  const fetchWarehouses = async () => {
    try {
      const response = await warehouseApi.getActive();
      if (response.data.success && response.data.data) {
        setWarehouses(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load warehouses:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await assetApi.delete(id);
      message.success('تم حذف الأصل بنجاح');
      fetchAssets();
    } catch (error) {
      message.error('فشل حذف الأصل');
    }
  };

  const handleDispose = (asset: Asset) => {
    if (asset.statusName === 'Disposed') {
      message.warning('تم استبعاد هذا الأصل مسبقاً');
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

  const handleDepartmentFilter = (value: number | undefined) => {
    console.log('🏢 Department filter changed:', value);
    setFilters(prev => ({ 
      ...prev, 
      departmentId: value,
      sectionId: undefined // Reset section when department changes
    }));
    setSections([]);
    if (value) {
      fetchSections(value);
    }
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleSectionFilter = (value: number | undefined) => {
    console.log('📋 Section filter changed:', value);
    setFilters(prev => ({ ...prev, sectionId: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleEmployeeFilter = (value: number | undefined) => {
    console.log('👤 Employee filter changed:', value);
    setFilters(prev => ({ ...prev, employeeId: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleWarehouseFilter = (value: number | undefined) => {
    console.log('🏪 Warehouse filter changed:', value);
    setFilters(prev => ({ ...prev, warehouseId: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const getLocationDisplay = (record: Asset) => {
    // Convert number to string for comparison
    const locationType = typeof record.currentLocationType === 'number' 
      ? {
          1: 'Warehouse',
          2: 'Employee', 
          3: 'Department',
          4: 'Section'
        }[record.currentLocationType] || 'Unknown'
      : record.currentLocationType;

    const locationParts: React.ReactElement[] = [];

    switch (locationType) {
      case 'Employee':
        if (record.currentEmployeeName) {
          locationParts.push(
            <Tag key="employee" color="blue">👤 {record.currentEmployeeName}</Tag>
          );
        }
        break;
      case 'Warehouse':
        if (record.currentWarehouseName) {
          locationParts.push(
            <Tag key="warehouse" color="green">🏪 {record.currentWarehouseName}</Tag>
          );
        }
        break;
      case 'Department':
        if (record.currentDepartmentName) {
          locationParts.push(
            <Tag key="department" color="orange">🏢 {record.currentDepartmentName}</Tag>
          );
        }
        break;
      case 'Section':
        if (record.currentSectionName) {
          locationParts.push(
            <Tag key="section" color="purple">📋 {record.currentSectionName}</Tag>
          );
        }
        break;
    }

    // Add department and section if they exist (for all types)
    if (record.currentDepartmentName && locationType !== 'Department') {
      locationParts.push(
        <Tag key="dept" color="orange" style={{ marginTop: 4 }}>🏢 {record.currentDepartmentName}</Tag>
      );
    }
    if (record.currentSectionName && locationType !== 'Section') {
      locationParts.push(
        <Tag key="sect" color="purple" style={{ marginTop: 4 }}>📋 {record.currentSectionName}</Tag>
      );
    }

    return locationParts.length > 0 ? (
      <Space direction="vertical" size={2}>
        {locationParts}
      </Space>
    ) : (
      <Tag color="default">غير معروف</Tag>
    );
  };

  const columns = [
    {
      title: 'الرقم التسلسلي',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      width: 150,
    },
    {
      title: 'الاسم',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'الفئة',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 150,
    },
    {
      title: 'الحالة',
      dataIndex: 'statusName',
      key: 'statusName',
      width: 120,
      render: (text: string, record: Asset) => (
        <Tag color={record.statusColor || 'default'}>{text}</Tag>
      ),
    },
    {
      title: 'الموقع الحالي',
      key: 'location',
      width: 250,
      render: (_: unknown, record: Asset) => getLocationDisplay(record),
    },
    {
      title: 'تاريخ الشراء',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      width: 120,
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'الإجراءات',
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
            عرض
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/assets/${record.id}/edit`)}
          >
            تعديل
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDispose(record)}
            disabled={record.statusName === 'Disposed'}
            title={record.statusName === 'Disposed' ? 'تم استبعاد الأصل مسبقاً' : 'استبعاد الأصل'}
          >
            استبعاد
          </Button>
          <Popconfirm
            title="حذف هذا الأصل؟"
            onConfirm={() => handleDelete(record.id)}
            okText="نعم"
            cancelText="لا"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              حذف
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
            <span>إدارة الأصول</span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/assets/add')}
            >
              إضافة أصل
            </Button>
          </div>
        }
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap>
            <Input.Search
              placeholder="البحث بالاسم أو الرقم التسلسلي..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch('')}
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="تصفية حسب الفئة"
              allowClear
              style={{ width: 180 }}
              onChange={handleCategoryFilter}
              value={filters.categoryId}
            >
              {categories.map(cat => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
            <Select
              placeholder="تصفية حسب الحالة"
              allowClear
              style={{ width: 180 }}
              onChange={handleStatusFilter}
              value={filters.statusId}
            >
              {statuses.map(status => (
                <Select.Option key={status.id} value={status.id}>
                  {status.name}
                </Select.Option>
              ))}
            </Select>
          </Space>

          <Space wrap>
            <Select
              placeholder="الموظف"
              allowClear
              showSearch
              style={{ width: 200 }}
              onChange={handleEmployeeFilter}
              value={filters.employeeId}
              filterOption={(input, option) =>
                String(option?.label || '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {employees.map(emp => (
                <Select.Option key={emp.id} value={emp.id} label={emp.fullName}>
                  {emp.fullName}
                </Select.Option>
              ))}
            </Select>

            <Select
              placeholder="المستودع"
              allowClear
              style={{ width: 180 }}
              onChange={handleWarehouseFilter}
              value={filters.warehouseId}
            >
              {warehouses.map(wh => (
                <Select.Option key={wh.id} value={wh.id}>
                  {wh.name}
                </Select.Option>
              ))}
            </Select>

            <Select
              placeholder="الدائرة"
              allowClear
              style={{ width: 180 }}
              onChange={handleDepartmentFilter}
              value={filters.departmentId}
            >
              {departments.map(dept => (
                <Select.Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Select.Option>
              ))}
            </Select>

            {filters.departmentId && (
              <Select
                placeholder="القسم"
                allowClear
                style={{ width: 180 }}
                onChange={handleSectionFilter}
                value={filters.sectionId}
              >
                {sections.map(sec => (
                  <Select.Option key={sec.id} value={sec.id}>
                    {sec.name}
                  </Select.Option>
                ))}
              </Select>
            )}
            
            <Button 
              onClick={() => {
                setFilters({
                  search: '',
                  categoryId: undefined,
                  statusId: undefined,
                  departmentId: undefined,
                  sectionId: undefined,
                  employeeId: undefined,
                  warehouseId: undefined,
                });
                setSections([]);
                setPagination(prev => ({ ...prev, current: 1 }));
              }}
            >
              مسح الفلاتر
            </Button>
            
            <Button 
              onClick={() => navigate('/disposals')}
            >
              عرض الأصول المستبعدة
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
              showTotal: (total) => `إجمالي ${total} أصل`,
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
