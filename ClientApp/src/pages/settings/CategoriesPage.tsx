import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm, Tag, Row, Col, Select } from 'antd';
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
      message.error('Failed to load categories');
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
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await categoryApi.delete(id);
      message.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      message.error('Failed to delete category');
    }
  };

  const handleSubmitCategory = async (values: Partial<AssetCategory>) => {
    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, values);
        message.success('Category updated successfully');
      } else {
        await categoryApi.create(values);
        message.success('Category created successfully');
      }
      setModalVisible(false);
      fetchCategories();
    } catch (error) {
      message.error('Failed to save category');
    }
  };

  const handleAddSubCategory = () => {
    setEditingSubCategory(null);
    subForm.resetFields();
    setSubModalVisible(true);
  };

  const handleEditSubCategory = (record: SubCategory) => {
    setEditingSubCategory(record);
    subForm.setFieldsValue(record);
    setSubModalVisible(true);
  };

  const handleDeleteSubCategory = async (id: number) => {
    try {
      await subCategoryApi.delete(id);
      message.success('SubCategory deleted successfully');
      fetchAllSubCategories();
    } catch (error) {
      message.error('Failed to delete subcategory');
    }
  };

  const handleSubmitSubCategory = async (values: CreateSubCategoryDto) => {
    try {
      console.log('Submitting subcategory:', values);
      
      if (editingSubCategory) {
        await subCategoryApi.update(editingSubCategory.id, {
          ...values,
          id: editingSubCategory.id,
          isActive: true
        });
        message.success('SubCategory updated successfully');
      } else {
        await subCategoryApi.create(values);
        message.success('SubCategory created successfully');
      }
      setSubModalVisible(false);
      fetchAllSubCategories();
    } catch (error) {
      console.error('Failed to save subcategory:', error);
      message.error('Failed to save subcategory');
    }
  };

  const categoryColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: AssetCategory) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditCategory(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this category?"
            onConfirm={() => handleDeleteCategory(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const subCategoryColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Parent Category', dataIndex: 'categoryName', key: 'categoryName' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: SubCategory) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditSubCategory(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this subcategory?"
            onConfirm={() => handleDeleteSubCategory(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
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
          <h3>Main Categories</h3>
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCategory}>
              Add Category
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
          <h3>SubCategories</h3>
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSubCategory}>
              Add SubCategory
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
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitCategory}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="Code" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingSubCategory ? 'Edit SubCategory' : 'Add SubCategory'}
        open={subModalVisible}
        onCancel={() => setSubModalVisible(false)}
        onOk={() => subForm.submit()}
        width={600}
      >
        <Form form={subForm} layout="vertical" onFinish={handleSubmitSubCategory}>
          <Form.Item name="categoryId" label="Parent Category" rules={[{ required: true }]}>
            <Select placeholder="Select parent category" showSearch optionFilterProp="children">
              {categories.map(cat => (
                <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="Code" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
