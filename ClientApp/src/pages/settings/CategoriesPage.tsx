import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm, Tag, Row, Col, Select, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { categoryApi } from '../../api/category.api';
import { subCategoryApi, type SubCategory, type CreateSubCategoryDto } from '../../api/subcategory.api';
import type { AssetCategory } from '../../types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [subModalVisible, setSubModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AssetCategory | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [form] = Form.useForm();
  const [subForm] = Form.useForm();

  useEffect(() => {
    fetchCategories();
    fetchAllSubCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryApi.getAll();
      if (response.data.success && response.data.data) {
        setCategories(response.data.data);
      }
    } catch (error) {
      message.error('فشل تحميل الفئات');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSubCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      if (response.data.success && response.data.data) {
        const allSubCats: SubCategory[] = [];
        for (const category of response.data.data) {
          try {
            const subResponse = await subCategoryApi.getByCategoryId(category.id);
            if (subResponse.data.success && subResponse.data.data) {
              allSubCats.push(...subResponse.data.data);
            }
          } catch (err) {
            // Skip
          }
        }
        setSubCategories(allSubCats);
      }
    } catch (error) {
      console.error('Failed to load subcategories:', error);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditCategory = (record: AssetCategory) => {
    setEditingCategory(record);
    // Don't include code in the form - it's auto-generated
    const { code, ...formData } = record;
    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await categoryApi.delete(id);
      message.success('تم حذف الفئة بنجاح');
      fetchCategories();
    } catch (error) {
      message.error('فشل حذف الفئة');
    }
  };

  const handleSubmitCategory = async (values: Partial<AssetCategory>) => {
    try {
      if (editingCategory) {
        // For updates, ensure we include the ID and preserve isActive
        const updateData = {
          ...values,
          id: editingCategory.id,
          isActive: values.isActive !== undefined ? values.isActive : editingCategory.isActive
        };
        await categoryApi.update(editingCategory.id, updateData);
        message.success('تم تحديث الفئة بنجاح');
      } else {
        // For creation, don't include code - it will be generated
        const { code, ...createData } = values;
        await categoryApi.create(createData);
        message.success('تم إنشاء الفئة بنجاح');
      }
      setModalVisible(false);
      fetchCategories();
    } catch (error) {
      console.error('Category operation error:', error);
      message.error(editingCategory ? 'فشل تحديث الفئة' : 'فشل إنشاء الفئة');
    }
  };

  const handleAddSubCategory = () => {
    setEditingSubCategory(null);
    subForm.resetFields();
    setSubModalVisible(true);
  };

  const handleEditSubCategory = (record: SubCategory) => {
    setEditingSubCategory(record);
    // Don't include code in the form - it's auto-generated
    const { code, ...formData } = record;
    subForm.setFieldsValue(formData);
    setSubModalVisible(true);
  };

  const handleDeleteSubCategory = async (id: number) => {
    try {
      await subCategoryApi.delete(id);
      message.success('تم حذف الفئة الفرعية بنجاح');
      fetchAllSubCategories();
    } catch (error) {
      message.error('فشل حذف الفئة الفرعية');
    }
  };

  const handleSubmitSubCategory = async (values: CreateSubCategoryDto) => {
    try {
      console.log('Submitting subcategory:', values);
      
      if (editingSubCategory) {
        // For updates, don't include code
        const { code, ...updateData } = values as any;
        await subCategoryApi.update(editingSubCategory.id, {
          ...updateData,
          id: editingSubCategory.id,
          isActive: true
        });
        message.success('تم تحديث الفئة الفرعية بنجاح');
      } else {
        // For creation, don't include code - it will be generated
        const { code, ...createData } = values as any;
        await subCategoryApi.create(createData);
        message.success('تم إنشاء الفئة الفرعية بنجاح');
      }
      setSubModalVisible(false);
      fetchAllSubCategories();
    } catch (error) {
      console.error('Failed to save subcategory:', error);
      message.error(editingSubCategory ? 'فشل تحديث الفئة الفرعية' : 'فشل إنشاء الفئة الفرعية');
    }
  };

  const categoryColumns = [
    { title: 'الاسم', dataIndex: 'name', key: 'name' },
    { title: 'الرمز', dataIndex: 'code', key: 'code' },
    { title: 'الوصف', dataIndex: 'description', key: 'description' },
    {
      title: 'نشط',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'نشط' : 'غير نشط'}
        </Tag>
      ),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_: unknown, record: AssetCategory) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditCategory(record)}>
            تعديل
          </Button>
          <Popconfirm
            title="هل أنت متأكد من حذف هذه الفئة؟"
            onConfirm={() => handleDeleteCategory(record.id)}
            okText="نعم"
            cancelText="لا"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              حذف
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const subCategoryColumns = [
    { title: 'الاسم', dataIndex: 'name', key: 'name' },
    { title: 'الرمز', dataIndex: 'code', key: 'code' },
    { title: 'الفئة الرئيسية', dataIndex: 'categoryName', key: 'categoryName' },
    { title: 'الوصف', dataIndex: 'description', key: 'description' },
    {
      title: 'نشط',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'نشط' : 'غير نشط'}
        </Tag>
      ),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_: unknown, record: SubCategory) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditSubCategory(record)}>
            تعديل
          </Button>
          <Popconfirm
            title="هل أنت متأكد من حذف هذه الفئة الفرعية؟"
            onConfirm={() => handleDeleteSubCategory(record.id)}
            okText="نعم"
            cancelText="لا"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              حذف
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 24]}>
        <Col span={24}>
          <h3>الفئات الرئيسية</h3>
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCategory}>
              إضافة فئة
            </Button>
          </div>
          <Table
            columns={categoryColumns}
            dataSource={categories}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 5 }}
          />
        </Col>

        <Col span={24}>
          <h3>الفئات الفرعية</h3>
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSubCategory}>
              إضافة فئة فرعية
            </Button>
          </div>
          <Table
            columns={subCategoryColumns}
            dataSource={subCategories}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 5 }}
          />
        </Col>
      </Row>

      <Modal
        title={editingCategory ? 'تعديل الفئة' : 'إضافة فئة'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitCategory}>
          <Form.Item 
            name="name" 
            label="اسم الفئة" 
            rules={[{ required: true, message: 'يرجى إدخال اسم الفئة' }]}
          >
            <Input placeholder="مثال: أجهزة حاسوب، أثاث مكتبي" />
          </Form.Item>
          <Form.Item name="description" label="الوصف">
            <Input.TextArea rows={3} placeholder="وصف الفئة (اختياري)" />
          </Form.Item>
          <Form.Item name="color" label="اللون">
            <Input type="color" />
          </Form.Item>
          {editingCategory && (
            <Form.Item
              name="isActive"
              label="نشط"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        title={editingSubCategory ? 'تعديل الفئة الفرعية' : 'إضافة فئة فرعية'}
        open={subModalVisible}
        onCancel={() => setSubModalVisible(false)}
        onOk={() => subForm.submit()}
        width={600}
      >
        <Form form={subForm} layout="vertical" onFinish={handleSubmitSubCategory}>
          <Form.Item 
            name="categoryId" 
            label="الفئة الرئيسية" 
            rules={[{ required: true, message: 'يرجى اختيار الفئة الرئيسية' }]}
          >
            <Select placeholder="اختر الفئة الرئيسية" showSearch optionFilterProp="children">
              {categories.map(cat => (
                <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item 
            name="name" 
            label="اسم الفئة الفرعية" 
            rules={[{ required: true, message: 'يرجى إدخال اسم الفئة الفرعية' }]}
          >
            <Input placeholder="مثال: أجهزة لابتوب، مكاتب خشبية" />
          </Form.Item>
          <Form.Item name="description" label="الوصف">
            <Input.TextArea rows={3} placeholder="وصف الفئة الفرعية (اختياري)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
