import { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Input, Button, Card, Row, Col, message, Alert, Space, Divider } from 'antd';
import { SaveOutlined, CloseOutlined, SwapOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { transferApi, type CreateTransferData } from '../api/transfer.api';
import { assetApi } from '../api/asset.api';
import { employeeApi } from '../api/employee.api';
import { warehouseApi } from '../api/warehouse.api';
import { departmentApi } from '../api/department.api';
import { sectionApi } from '../api/section.api';
import type { Asset, Employee, Warehouse, Department, Section } from '../types';
import dayjs from 'dayjs';

export default function NewTransferPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  useEffect(() => {
    fetchAssets();
    fetchEmployees();
    fetchWarehouses();
    fetchDepartments();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await assetApi.getAll({ pageNumber: 1, pageSize: 100 });
      if (response.data.success && response.data.data?.items) {
        setAssets(response.data.data.items);
      }
    } catch (error) {
      console.error('Failed to load assets:', error);
      message.error('Failed to load assets');
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

  const handleAssetChange = async (assetId: number) => {
    try {
      // Fetch detailed asset information
      const response = await assetApi.getById(assetId);
      if (response.data.success && response.data.data) {
        const asset = response.data.data;
        setSelectedAsset(asset);
        
        // Debug: Log asset data to see what we're getting
        console.log('Selected Asset (Full Details):', asset);
        console.log('Asset Location Info:', {
          currentLocationType: asset.currentLocationType,
          currentEmployeeId: asset.currentEmployeeId,
          currentWarehouseId: asset.currentWarehouseId,
          currentDepartmentId: asset.currentDepartmentId,
          currentSectionId: asset.currentSectionId,
          currentEmployeeName: asset.currentEmployeeName,
          currentWarehouseName: asset.currentWarehouseName,
          currentDepartmentName: asset.currentDepartmentName,
          currentSectionName: asset.currentSectionName
        });
        
        // Pre-fill current locations as default values
        form.setFieldsValue({
          toEmployeeId: asset.currentEmployeeId,
          toWarehouseId: asset.currentWarehouseId,
          toDepartmentId: asset.currentDepartmentId,
          toSectionId: asset.currentSectionId,
        });
        
        // If asset has department, load its sections
        if (asset.currentDepartmentId) {
          fetchSections(asset.currentDepartmentId);
        }
      }
    } catch (error) {
      console.error('Failed to load asset details:', error);
      message.error('Failed to load asset details');
      setSelectedAsset(null);
    }
  };

  const handleToDepartmentChange = (departmentId: number) => {
    form.setFieldValue('toSectionId', undefined);
    fetchSections(departmentId);
  };

  const getCurrentLocation = (asset: Asset) => {
    // Handle both string and number values for currentLocationType
    const locationType = typeof asset.currentLocationType === 'number' 
      ? getLocationTypeString(asset.currentLocationType)
      : asset.currentLocationType;

    // Create a complete location description
    const locationParts: string[] = [];
    
    if (asset.currentEmployeeName) {
      locationParts.push(`Employee: ${asset.currentEmployeeName}`);
    }
    if (asset.currentWarehouseName) {
      locationParts.push(`Warehouse: ${asset.currentWarehouseName}`);
    }
    if (asset.currentDepartmentName) {
      locationParts.push(`Department: ${asset.currentDepartmentName}`);
    }
    if (asset.currentSectionName) {
      locationParts.push(`Section: ${asset.currentSectionName}`);
    }
    
    if (locationParts.length > 0) {
      return locationParts.join(', ');
    }

    // Fallback to single location type
    switch (locationType) {
      case 'Employee':
        return 'Employee Location (Name not available)';
      case 'Warehouse':
        return 'Warehouse Location (Name not available)';
      case 'Department':
        return 'Department Location (Name not available)';
      case 'Section':
        return 'Section Location (Name not available)';
      default:
        return 'Unknown Location';
    }
  };

  const getLocationTypeString = (locationType: number): string => {
    switch (locationType) {
      case 1: return 'Warehouse';
      case 2: return 'Employee';
      case 3: return 'Department';
      case 4: return 'Section';
      default: return 'Unknown';
    }
  };

  const handleSubmit = async (values: any) => {
    if (!selectedAsset) {
      message.error('Please select an asset');
      return;
    }

    // Check if at least one destination is selected
    if (!values.toEmployeeId && !values.toWarehouseId && !values.toDepartmentId && !values.toSectionId) {
      message.error('Please select at least one destination location');
      return;
    }

    // Check if there's any change from current location
    const hasChange = 
      values.toEmployeeId !== selectedAsset.currentEmployeeId ||
      values.toWarehouseId !== selectedAsset.currentWarehouseId ||
      values.toDepartmentId !== selectedAsset.currentDepartmentId ||
      values.toSectionId !== selectedAsset.currentSectionId;

    if (!hasChange) {
      message.warning('No changes detected. Please modify at least one location field to create a transfer.');
      return;
    }

    setLoading(true);
    try {
      const transferData: CreateTransferData = {
        assetId: values.assetId,
        transferDate: values.transferDate.toISOString(),
        reason: values.reason,
        notes: values.notes,
      };

      // Set FROM location based on current asset location - ???? ???????
      const currentLocationType = typeof selectedAsset.currentLocationType === 'number'
        ? getLocationTypeString(selectedAsset.currentLocationType)
        : selectedAsset.currentLocationType;

      switch (currentLocationType) {
        case 'Employee':
          transferData.fromEmployeeId = selectedAsset.currentEmployeeId;
          break;
        case 'Warehouse':
          transferData.fromWarehouseId = selectedAsset.currentWarehouseId;
          break;
        case 'Department':
          transferData.fromDepartmentId = selectedAsset.currentDepartmentId;
          break;
        case 'Section':
          transferData.fromSectionId = selectedAsset.currentSectionId;
          break;
      }

      // Set TO location - ???? ??????? ???????
      if (values.toEmployeeId) transferData.toEmployeeId = values.toEmployeeId;
      if (values.toWarehouseId) transferData.toWarehouseId = values.toWarehouseId;
      if (values.toDepartmentId) transferData.toDepartmentId = values.toDepartmentId;
      if (values.toSectionId) transferData.toSectionId = values.toSectionId;

      await transferApi.create(transferData);
      message.success('Transfer completed successfully');
      navigate('/transfers');
    } catch (error: any) {
      console.error('Failed to create transfer:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Failed to create transfer');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <Card title={<span><SwapOutlined /> New Asset Transfer</span>}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            transferDate: dayjs(),
          }}
        >
          <Divider>Asset Selection</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="assetId"
                label="Select Asset to Transfer"
                rules={[{ required: true, message: 'Please select an asset' }]}
              >
                <Select
                  placeholder="Search and select asset"
                  showSearch
                  optionFilterProp="children"
                  onChange={handleAssetChange}
                  filterOption={(input, option) => {
                    const text = option?.label || option?.children;
                    return String(text || '').toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {assets.map(asset => (
                    <Select.Option key={asset.id} value={asset.id}>
                      {asset.name} (S/N: {asset.serialNumber})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="transferDate"
                label="Transfer Date"
                rules={[{ required: true, message: 'Please select transfer date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          {selectedAsset && (
            <Alert
              message="Current Asset Location"
              description={
                <div>
                  <strong>From:</strong> {getCurrentLocation(selectedAsset)}
                  <br />
                  <strong>Status:</strong> {selectedAsset.statusName || 'Unknown Status'}
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Alert
            message="Smart Transfer - Current Location Pre-filled"
            description="The current location details are automatically filled in the form below. You can modify any field - for example, change only the employee while keeping the same department and warehouse."
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="toEmployeeId" label="Employee (Current Pre-filled)">
                <Select placeholder="Select employee" showSearch optionFilterProp="children" allowClear>
                  {employees.map(emp => (
                    <Select.Option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeNumber}) - {emp.departmentName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="toWarehouseId" label="Warehouse (Current Pre-filled)">
                <Select placeholder="Select warehouse" allowClear>
                  {warehouses.map(wh => (
                    <Select.Option key={wh.id} value={wh.id}>
                      {wh.name} - {wh.location}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="toDepartmentId" label="Department (Current Pre-filled)">
                <Select placeholder="Select department" onChange={handleToDepartmentChange} allowClear>
                  {departments.map(dept => (
                    <Select.Option key={dept.id} value={dept.id}>
                      {dept.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="toSectionId" label="Section (Current Pre-filled)">
                <Select placeholder="Select section" allowClear>
                  {sections.map(sec => (
                    <Select.Option key={sec.id} value={sec.id}>
                      {sec.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider>Transfer Details</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="reason" label="Transfer Reason">
                <Select placeholder="Select reason (optional)">
                  <Select.Option value="Employee Request">Employee Request</Select.Option>
                  <Select.Option value="Department Transfer">Department Transfer</Select.Option>
                  <Select.Option value="Maintenance">Maintenance</Select.Option>
                  <Select.Option value="Warehouse Storage">Warehouse Storage</Select.Option>
                  <Select.Option value="Project Assignment">Project Assignment</Select.Option>
                  <Select.Option value="Other">Other</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea
              rows={3}
              placeholder="Additional notes about the transfer (optional)"
            />
          </Form.Item>

          <Divider />
          <Form.Item>
            <Space size="middle">
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                Execute Transfer
              </Button>
              <Button icon={<CloseOutlined />} onClick={() => navigate('/transfers')}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </MainLayout>
  );
}