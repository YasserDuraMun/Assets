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
      message.error('فشل تحميل الأصول');
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
      message.error('فشل تحميل تفاصيل الأصل');
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
      locationParts.push(`موظف: ${asset.currentEmployeeName}`);
    }
    if (asset.currentWarehouseName) {
      locationParts.push(`مستودع: ${asset.currentWarehouseName}`);
    }
    if (asset.currentDepartmentName) {
      locationParts.push(`قسم: ${asset.currentDepartmentName}`);
    }
    if (asset.currentSectionName) {
      locationParts.push(`شعبة: ${asset.currentSectionName}`);
    }
    
    if (locationParts.length > 0) {
      return locationParts.join(', ');
    }

    // Fallback to single location type
    switch (locationType) {
      case 'Employee':
        return 'موقع موظف (الاسم غير متاح)';
      case 'Warehouse':
        return 'موقع مستودع (الاسم غير متاح)';
      case 'Department':
        return 'موقع قسم (الاسم غير متاح)';
      case 'Section':
        return 'موقع شعبة (الاسم غير متاح)';
      default:
        return 'موقع غير معروف';
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
      message.error('يرجى اختيار أصل');
      return;
    }

    // Check if at least one destination is selected
    if (!values.toEmployeeId && !values.toWarehouseId && !values.toDepartmentId && !values.toSectionId) {
      message.error('يرجى اختيار موقع وجهة واحد على الأقل');
      return;
    }

    // Check if there's any change from current location
    const hasChange = 
      values.toEmployeeId !== selectedAsset.currentEmployeeId ||
      values.toWarehouseId !== selectedAsset.currentWarehouseId ||
      values.toDepartmentId !== selectedAsset.currentDepartmentId ||
      values.toSectionId !== selectedAsset.currentSectionId;

    if (!hasChange) {
      message.warning('لم يتم اكتشاف أي تغييرات. يرجى تعديل حقل موقع واحد على الأقل لإنشاء نقل.');
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
      message.success('تم إتمام النقل بنجاح');
      navigate('/transfers');
    } catch (error: any) {
      console.error('Failed to create transfer:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('فشل في إنشاء النقل');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <Card title={<span><SwapOutlined /> نقل أصل جديد</span>}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            transferDate: dayjs(),
          }}
        >
          <Divider>اختيار الأصل</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="assetId"
                label="اختر الأصل لنقله"
                rules={[{ required: true, message: 'يرجى اختيار أصل' }]}
              >
                <Select
                  placeholder="ابحث واختر أصل"
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
                label="تاريخ النقل"
                rules={[{ required: true, message: 'يرجى اختيار تاريخ النقل' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          {selectedAsset && (
            <Alert
              message="الموقع الحالي للأصل"
              description={
                <div>
                  <strong>من:</strong> {getCurrentLocation(selectedAsset)}
                  <br />
                  <strong>الحالة:</strong> {selectedAsset.statusName || 'حالة غير معروفة'}
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Alert
            message="نقل ذكي - الموقع الحالي معبأ تلقائياً"
            description="تم ملء تفاصيل الموقع الحالي تلقائياً في النموذج أدناه. يمكنك تعديل أي حقل - على سبيل المثال، تغيير الموظف فقط مع الاحتفاظ بنفس القسم والمستودع."
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="toEmployeeId" label="الموظف (معبأ تلقائياً)">
                <Select placeholder="اختر موظف" showSearch optionFilterProp="children" allowClear>
                  {employees.map(emp => (
                    <Select.Option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeNumber}) - {emp.departmentName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="toWarehouseId" label="المستودع (معبأ تلقائياً)">
                <Select placeholder="اختر مستودع" allowClear>
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
              <Form.Item name="toDepartmentId" label="القسم (معبأ تلقائياً)">
                <Select placeholder="اختر قسم" onChange={handleToDepartmentChange} allowClear>
                  {departments.map(dept => (
                    <Select.Option key={dept.id} value={dept.id}>
                      {dept.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="toSectionId" label="الشعبة (معبأ تلقائياً)">
                <Select placeholder="اختر شعبة" allowClear>
                  {sections.map(sec => (
                    <Select.Option key={sec.id} value={sec.id}>
                      {sec.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider>تفاصيل النقل</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="reason" label="سبب النقل">
                <Select placeholder="اختر السبب (اختياري)">
                  <Select.Option value="Employee Request">طلب موظف</Select.Option>
                  <Select.Option value="Department Transfer">نقل قسم</Select.Option>
                  <Select.Option value="Maintenance">صيانة</Select.Option>
                  <Select.Option value="Warehouse Storage">تخزين في مستودع</Select.Option>
                  <Select.Option value="Project Assignment">تعيين مشروع</Select.Option>
                  <Select.Option value="Other">أخرى</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="ملاحظات">
            <Input.TextArea
              rows={3}
              placeholder="ملاحظات إضافية حول النقل (اختياري)"
            />
          </Form.Item>

          <Divider />
          <Form.Item>
            <Space size="middle">
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                تنفيذ النقل
              </Button>
              <Button icon={<CloseOutlined />} onClick={() => navigate('/transfers')}>
                إلغاء
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </MainLayout>
  );
}