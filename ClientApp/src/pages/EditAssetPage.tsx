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

  // Update form when asset data or reference data changes
  useEffect(() => {
    if (asset && categories.length > 0 && statuses.length > 0) {
      console.log('Updating form with complete data'); // Debug log
      
      const formValues = {
        ...asset,
        currentLocationType: locationType,
        purchaseDate: asset.purchaseDate ? dayjs(asset.purchaseDate) : null,
        warrantyExpiryDate: asset.warrantyExpiryDate ? dayjs(asset.warrantyExpiryDate) : null,
      };
      
      form.setFieldsValue(formValues);
    }
  }, [asset, categories, statuses, employees, warehouses, departments, locationType, form]);

  const loadAssetData = async (assetId: number) => {
    setLoading(true);
    try {
      // Load all reference data first
      await Promise.all([
        fetchCategories(),
        fetchStatuses(),
        fetchEmployees(),
        fetchWarehouses(),
        fetchDepartments(),
      ]);

      // Then fetch asset data
      const assetResponse = await assetApi.getById(assetId);
      if (assetResponse.data.success && assetResponse.data.data) {
        const assetData = assetResponse.data.data;
        console.log('Loading asset data:', assetData); // Debug log
        
        setAsset(assetData);
        setHasWarranty(!!assetData.hasWarranty);
        setSelectedCategory(assetData.categoryId);

        // Convert enum number to string for locationType
        const locationTypeMap: Record<number, string> = {
          1: 'Warehouse',
          2: 'Employee',
          3: 'Department',
          4: 'Section'
        };
        
        const currentLocationType = locationTypeMap[assetData.currentLocationType as number] || 'Warehouse';
        setLocationType(currentLocationType);
        console.log('Current Location Type:', currentLocationType, 'Raw:', assetData.currentLocationType); // Debug log

        // Load subcategories if category is selected
        if (assetData.categoryId) {
          await fetchSubCategories(assetData.categoryId);
        }

        // Load sections if department is selected
        if (assetData.currentDepartmentId) {
          await fetchSections(assetData.currentDepartmentId);
        }

        // Wait for all data to be loaded before setting form values
        setTimeout(() => {
          const formValues = {
            name: assetData.name,
            description: assetData.description,
            serialNumber: assetData.serialNumber,
            barcode: assetData.barcode,
            qrCode: assetData.qrCode,
            categoryId: assetData.categoryId,
            subCategoryId: assetData.subCategoryId,
            statusId: assetData.statusId,
            currentLocationType: currentLocationType,
            currentEmployeeId: assetData.currentEmployeeId,
            currentWarehouseId: assetData.currentWarehouseId,
            currentDepartmentId: assetData.currentDepartmentId,
            currentSectionId: assetData.currentSectionId,
            purchaseDate: assetData.purchaseDate ? dayjs(assetData.purchaseDate) : null,
            purchasePrice: assetData.purchasePrice,
            hasWarranty: assetData.hasWarranty,
            warrantyMonths: assetData.warrantyMonths,
            warrantyExpiryDate: assetData.warrantyExpiryDate ? dayjs(assetData.warrantyExpiryDate) : null,
            notes: assetData.notes,
          };
          
          console.log('Setting detailed form values:', formValues); // Debug log
          
          // Set form values with a small delay to ensure all reference data is loaded
          form.setFieldsValue(formValues);
        }, 100);
      } else {
        message.error('لم يتم العثور على الأصل');
        navigate('/assets');
      }
    } catch (error) {
      console.error('Failed to load asset:', error);
      message.error('فشل تحميل بيانات الأصل');
      navigate('/assets');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      if (response.data.success && response.data.data) {
        console.log('Categories loaded:', response.data.data.length);
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
        console.log('SubCategories loaded for category', categoryId, ':', response.data.data.length);
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
        console.log('Statuses loaded:', response.data.data.length);
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
        console.log('Employees loaded:', response.data.data.length);
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
        console.log('Warehouses loaded:', response.data.data.length);
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
        console.log('Departments loaded:', response.data.data.length);
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
        console.log('Sections loaded for department', departmentId, ':', response.data.data.length);
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
      message.success('تم تحديث الأصل بنجاح');
      navigate(`/assets/${id}`);
    } catch (error) {
      console.error('Failed to update asset:', error);
      message.error('فشل في تحديث الأصل');
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
            لم يتم العثور على الأصل
          </div>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Card title={`تعديل الأصل: ${asset.name}`}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Divider>المعلومات الأساسية</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="اسم الأصل"
                rules={[{ required: true, message: 'الرجاء إدخال اسم الأصل' }]}
              >
                <Input placeholder="أدخل اسم الأصل" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="serialNumber"
                label="الرقم التسلسلي"
                rules={[{ required: true, message: 'الرجاء إدخال الرقم التسلسلي' }]}
              >
                <Input placeholder="أدخل الرقم التسلسلي" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="barcode" label="الباركود">
                <Input placeholder="أدخل الباركود" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="qrCode" label="رمز QR">
                <Input placeholder="يتم إنشاؤه تلقائياً" disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="statusId"
                label="الحالة"
                rules={[{ required: true, message: 'الرجاء اختيار الحالة' }]}
              >
                <Select placeholder="اختر الحالة">
                  {statuses.map(status => (
                    <Select.Option key={status.id} value={status.id}>
                      {status.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="الوصف">
            <Input.TextArea rows={3} placeholder="أدخل الوصف" />
          </Form.Item>

          <Divider>الفئة</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="categoryId"
                label="الفئة الرئيسية"
                rules={[{ required: true, message: 'الرجاء اختيار الفئة' }]}
              >
                <Select placeholder="اختر الفئة" onChange={handleCategoryChange}>
                  {categories.map(cat => (
                    <Select.Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="subCategoryId" label="الفئة الفرعية">
                <Select placeholder="اختر الفئة الفرعية" disabled={!selectedCategory}>
                  {subCategories.map(sub => (
                    <Select.Option key={sub.id} value={sub.id}>
                      {sub.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider>الموقع الحالي</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="currentLocationType"
                label="نوع الموقع"
                rules={[{ required: true }]}
              >
                <Select onChange={handleLocationTypeChange}>
                  <Select.Option value="Employee">موظف</Select.Option>
                  <Select.Option value="Warehouse">مستودع</Select.Option>
                  <Select.Option value="Department">قسم</Select.Option>
                  <Select.Option value="Section">شعبة</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={16}>
              {locationType === 'Employee' && (
                <Form.Item name="currentEmployeeId" label="الموظف" rules={[{ required: true }]}>
                  <Select placeholder="اختر الموظف" showSearch optionFilterProp="children">
                    {employees.map(emp => (
                      <Select.Option key={emp.id} value={emp.id}>
                        {emp.fullName} ({emp.employeeNumber})
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
              {locationType === 'Warehouse' && (
                <Form.Item name="currentWarehouseId" label="المستودع" rules={[{ required: true }]}>
                  <Select placeholder="اختر المستودع">
                    {warehouses.map(wh => (
                      <Select.Option key={wh.id} value={wh.id}>
                        {wh.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
              {locationType === 'Department' && (
                <Form.Item name="currentDepartmentId" label="القسم" rules={[{ required: true }]}>
                  <Select placeholder="اختر القسم">
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
                  <Form.Item name="currentDepartmentId" label="القسم" rules={[{ required: true }]}>
                    <Select placeholder="اختر القسم" onChange={handleDepartmentChange}>
                      {departments.map(dept => (
                        <Select.Option key={dept.id} value={dept.id}>
                          {dept.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </>
              )}
            </Col>
          </Row>

          {locationType === 'Section' && (
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="currentSectionId" label="الشعبة" rules={[{ required: true }]}>
                  <Select placeholder="اختر الشعبة">
                    {sections.map(sec => (
                      <Select.Option key={sec.id} value={sec.id}>
                        {sec.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}

          <Divider>معلومات الشراء</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="purchaseDate" label="تاريخ الشراء">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="purchasePrice" label="سعر الشراء">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider>معلومات الضمان</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="hasWarranty" label="يوجد ضمان" valuePropName="checked">
                <Switch onChange={setHasWarranty} />
              </Form.Item>
            </Col>
            {hasWarranty && (
              <>
                <Col span={8}>
                  <Form.Item name="warrantyMonths" label="مدة الضمان (بالأشهر)">
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
                  <Form.Item name="warrantyExpiryDate" label="تاريخ انتهاء الضمان">
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
                حفظ التعديلات
              </Button>
              <Button icon={<CloseOutlined />} onClick={() => navigate(`/assets/${id}`)}>
                إلغاء
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </MainLayout>
  );
}