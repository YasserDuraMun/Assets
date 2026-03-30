import { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, DatePicker, Switch, Button, Card, Row, Col, message, Divider, Spin, Space } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { assetApi } from '../api/asset.api';
import { categoryApi } from '../api/category.api';
import { subCategoryApi, type SubCategory } from '../api/subcategory.api';
import { statusApi } from '../api/status.api';
import { employeeApi } from '../api/employee.api';
import { warehouseApi } from '../api/warehouse.api';
import { departmentApi } from '../api/department.api';
import { sectionApi } from '../api/section.api';
import type { Asset, AssetCategory, AssetStatus, Employee, Warehouse, Department, Section } from '../types';
import dayjs from 'dayjs';

export default function EditAssetPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [statuses, setStatuses] = useState<AssetStatus[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [hasWarranty, setHasWarranty] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [locationType, setLocationType] = useState<string>('Warehouse');

  useEffect(() => {
    if (id) {
      loadAssetData(parseInt(id));
    }
  }, [id]);

  const loadAssetData = async (assetId: number) => {
    setLoading(true);
    try {
      // Fetch asset data
      const assetResponse = await assetApi.getById(assetId);
      if (assetResponse.data.success && assetResponse.data.data) {
        const assetData = assetResponse.data.data;
        setAsset(assetData);
        setHasWarranty(assetData.hasWarranty);
        
        // Convert enum number to string for locationType
        const locationTypeMap: Record<number, string> = {
          1: 'Warehouse',
          2: 'Employee',
          3: 'Department',
          4: 'Section'
        };
        setLocationType(locationTypeMap[assetData.currentLocationType as number] || 'Warehouse');
        setSelectedCategory(assetData.categoryId);

        // Load form data
        await Promise.all([
          fetchCategories(),
          fetchStatuses(),
          fetchEmployees(),
          fetchWarehouses(),
          fetchDepartments(),
        ]);

        // Load subcategories if category is selected
        if (assetData.categoryId) {
          await fetchSubCategories(assetData.categoryId);
        }

        // Load sections if department is selected
        if (assetData.currentDepartmentId) {
          await fetchSections(assetData.currentDepartmentId);
        }

        // Set form values
        form.setFieldsValue({
          ...assetData,
          purchaseDate: assetData.purchaseDate ? dayjs(assetData.purchaseDate) : null,
          warrantyExpiryDate: assetData.warrantyExpiryDate ? dayjs(assetData.warrantyExpiryDate) : null,
        });
      } else {
        message.error('Asset not found');
        navigate('/assets');
      }
    } catch (error) {
      console.error('Failed to load asset:', error);
      message.error('Failed to load asset data');
      navigate('/assets');
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

  const fetchSubCategories = async (categoryId: number) => {
    try {
      const response = await subCategoryApi.getByCategoryId(categoryId);
      if (response.data.success && response.data.data) {
        setSubCategories(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load subcategories:', error);
      setSubCategories([]);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await statusApi.getActive();
      if (response.data.success && response.data.data) {
        setStatuses(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load statuses:', error);
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

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategory(categoryId);
    form.setFieldValue('subCategoryId', undefined);
    fetchSubCategories(categoryId);
  };

  const handleLocationTypeChange = (value: string) => {
    setLocationType(value);
    form.setFieldsValue({
      currentEmployeeId: undefined,
      currentWarehouseId: undefined,
      currentDepartmentId: undefined,
      currentSectionId: undefined,
    });
  };

  const handleDepartmentChange = (departmentId: number) => {
    form.setFieldValue('currentSectionId', undefined);
    fetchSections(departmentId);
  };

  const calculateWarrantyExpiry = (purchaseDate: any, months: number) => {
    if (purchaseDate && months) {
      const expiry = dayjs(purchaseDate).add(months, 'month');
      form.setFieldValue('warrantyExpiryDate', expiry);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!id) return;

    setSaving(true);
    try {
      // Convert location type string to number for backend enum
      const locationTypeMap: Record<string, number> = {
        'Warehouse': 1,
        'Employee': 2, 
        'Department': 3,
        'Section': 4
      };

      const payload = {
        ...values,
        id: parseInt(id),
        currentLocationType: locationTypeMap[locationType] || 1,
        purchaseDate: values.purchaseDate ? values.purchaseDate.toISOString() : undefined,
        warrantyExpiryDate: values.warrantyExpiryDate ? values.warrantyExpiryDate.toISOString() : undefined,
        hasWarranty,
      };

      await assetApi.update(parseInt(id), payload);
      message.success('Asset updated successfully');
      navigate(`/assets/${id}`);
    } catch (error) {
      console.error('Failed to update asset:', error);
      message.error('Failed to update asset');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  if (!asset) {
    return (
      <MainLayout>
        <Card>
          <div style={{ textAlign: 'center', padding: 50 }}>
            Asset not found
          </div>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Card title={`Edit Asset: ${asset.name}`}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Divider>Basic Information</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Asset Name"
                rules={[{ required: true, message: 'Please enter asset name' }]}
              >
                <Input placeholder="Enter asset name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="serialNumber"
                label="Serial Number"
                rules={[{ required: true, message: 'Please enter serial number' }]}
              >
                <Input placeholder="Enter serial number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="barcode" label="Barcode">
                <Input placeholder="Enter barcode" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="qrCode" label="QR Code">
                <Input placeholder="Auto-generated" disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="statusId"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  {statuses.map(status => (
                    <Select.Option key={status.id} value={status.id}>
                      {status.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Enter description" />
          </Form.Item>

          <Divider>Category</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="categoryId"
                label="Main Category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select category" onChange={handleCategoryChange}>
                  {categories.map(cat => (
                    <Select.Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="subCategoryId" label="SubCategory">
                <Select placeholder="Select subcategory" disabled={!selectedCategory}>
                  {subCategories.map(sub => (
                    <Select.Option key={sub.id} value={sub.id}>
                      {sub.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider>Current Location</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="currentLocationType"
                label="Location Type"
                rules={[{ required: true }]}
              >
                <Select onChange={handleLocationTypeChange}>
                  <Select.Option value="Employee">Employee</Select.Option>
                  <Select.Option value="Warehouse">Warehouse</Select.Option>
                  <Select.Option value="Department">Department</Select.Option>
                  <Select.Option value="Section">Section</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={16}>
              {locationType === 'Employee' && (
                <Form.Item name="currentEmployeeId" label="Employee" rules={[{ required: true }]}>
                  <Select placeholder="Select employee" showSearch optionFilterProp="children">
                    {employees.map(emp => (
                      <Select.Option key={emp.id} value={emp.id}>
                        {emp.fullName} ({emp.employeeNumber})
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
              {locationType === 'Warehouse' && (
                <Form.Item name="currentWarehouseId" label="Warehouse" rules={[{ required: true }]}>
                  <Select placeholder="Select warehouse">
                    {warehouses.map(wh => (
                      <Select.Option key={wh.id} value={wh.id}>
                        {wh.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
              {locationType === 'Department' && (
                <Form.Item name="currentDepartmentId" label="Department" rules={[{ required: true }]}>
                  <Select placeholder="Select department">
                    {departments.map(dept => (
                      <Select.Option key={dept.id} value={dept.id}>
                        {dept.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
              {locationType === 'Section' && (
                <>
                  <Form.Item name="currentDepartmentId" label="Department" rules={[{ required: true }]}>
                    <Select placeholder="Select department" onChange={handleDepartmentChange}>
                      {departments.map(dept => (
                        <Select.Option key={dept.id} value={dept.id}>
                          {dept.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item name="currentSectionId" label="Section" rules={[{ required: true }]}>
                    <Select placeholder="Select section">
                      {sections.map(sec => (
                        <Select.Option key={sec.id} value={sec.id}>
                          {sec.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </>
              )}
            </Col>
          </Row>

          <Divider>Purchase Information</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="purchaseDate" label="Purchase Date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="purchasePrice" label="Purchase Price">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Warranty Information</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="hasWarranty" label="Has Warranty" valuePropName="checked">
                <Switch onChange={setHasWarranty} />
              </Form.Item>
            </Col>
            {hasWarranty && (
              <>
                <Col span={8}>
                  <Form.Item name="warrantyMonths" label="Warranty Period (Months)">
                    <InputNumber
                      style={{ width: '100%' }}
                      min={1}
                      onChange={(value) => {
                        const purchaseDate = form.getFieldValue('purchaseDate');
                        if (value) calculateWarrantyExpiry(purchaseDate, value);
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="warrantyExpiryDate" label="Warranty Expiry Date">
                    <DatePicker style={{ width: '100%' }} disabled />
                  </Form.Item>
                </Col>
              </>
            )}
          </Row>

          <Divider />
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                Update Asset
              </Button>
              <Button icon={<CloseOutlined />} onClick={() => navigate(`/assets/${id}`)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </MainLayout>
  );
}