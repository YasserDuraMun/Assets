import { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, DatePicker, Switch, Button, Card, Row, Col, message, Divider, Space } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { assetApi } from '../api/asset.api';
import { categoryApi } from '../api/category.api';
import { subCategoryApi, type SubCategory } from '../api/subcategory.api';
import { statusApi } from '../api/status.api';
import { employeeApi } from '../api/employee.api';
import { warehouseApi } from '../api/warehouse.api';
import { departmentApi } from '../api/department.api';
import { sectionApi } from '../api/section.api';
import type { AssetCategory, AssetStatus, Employee, Warehouse, Department, Section } from '../types';
import dayjs from 'dayjs';

export default function AddAssetPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [statuses, setStatuses] = useState<AssetStatus[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [hasWarranty, setHasWarranty] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchStatuses();
    fetchEmployees();
    fetchWarehouses();
    fetchDepartments();
  }, []);

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
    setLoading(true);
    try {
      // Determine location type based on which fields are filled
      let currentLocationType = 1; // Default to Warehouse
      
      if (values.currentEmployeeId) {
        currentLocationType = 2; // Employee
      } else if (values.currentSectionId) {
        currentLocationType = 4; // Section
      } else if (values.currentDepartmentId) {
        currentLocationType = 3; // Department
      } else if (values.currentWarehouseId) {
        currentLocationType = 1; // Warehouse
      }

      const payload = {
        ...values,
        currentLocationType,
        purchaseDate: values.purchaseDate ? values.purchaseDate.toISOString() : undefined,
        warrantyExpiryDate: values.warrantyExpiryDate ? values.warrantyExpiryDate.toISOString() : undefined,
        hasWarranty,
      };

      console.log('Sending payload:', payload); // Debug log

      await assetApi.create(payload);
      message.success('تم إنشاء الأصل بنجاح');
      navigate('/assets');
    } catch (error: any) {
      console.error('Failed to create asset:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('فشل إنشاء الأصل');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <Card title="إضافة أصل جديد">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            hasWarranty: false,
          }}
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

          <Divider>معلومات الموقع الحالي</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="currentEmployeeId" label="الموظف (اختياري)">
                <Select placeholder="اختر الموظف (اختياري)" showSearch optionFilterProp="children" allowClear>
                  {employees.map(emp => (
                    <Select.Option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeNumber}) - {emp.departmentName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="currentWarehouseId" label="المستودع (اختياري)">
                <Select placeholder="اختر المستودع (اختياري)" allowClear>
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
              <Form.Item name="currentDepartmentId" label="الإدارة (اختياري)">
                <Select placeholder="اختر الإدارة (اختياري)" onChange={handleDepartmentChange} allowClear>
                  {departments.map(dept => (
                    <Select.Option key={dept.id} value={dept.id}>
                      {dept.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="currentSectionId" label="القسم (اختياري)">
                <Select placeholder="اختر القسم (اختياري)" allowClear>
                  {sections.map(sec => (
                    <Select.Option key={sec.id} value={sec.id}>
                      {sec.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

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
              <Form.Item name="hasWarranty" label="لديه ضمان" valuePropName="checked">
                <Switch onChange={setHasWarranty} />
              </Form.Item>
            </Col>
            {hasWarranty && (
              <>
                <Col span={8}>
                  <Form.Item name="warrantyMonths" label="فترة الضمان (شهر)">
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
            <Space size="middle">
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                حفظ الأصل
              </Button>
              <Button icon={<CloseOutlined />} onClick={() => navigate('/assets')}>
                إلغاء
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </MainLayout>
  );
}
