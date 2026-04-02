import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Switch, message, Popconfirm, Tag, Row, Col, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { departmentApi } from '../../api/department.api';
import { sectionApi } from '../../api/section.api';
import type { Department, Section } from '../../types';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [form] = Form.useForm();
  const [sectionForm] = Form.useForm();

  useEffect(() => {
    fetchDepartments();
    fetchSections();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await departmentApi.getAll();
      if (response.data.success && response.data.data) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      message.error('فشل تحميل الإدارات');
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await sectionApi.getAll();
      if (response.data.success && response.data.data) {
        setSections(response.data.data);
      }
    } catch (error) {
      message.error('فشل تحميل الأقسام');
    }
  };

  const handleAddDepartment = () => {
    setEditingDepartment(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditDepartment = (record: Department) => {
    setEditingDepartment(record);
    // Don't include code in the form - it's auto-generated
    const { code, ...formData } = record;
    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  const handleDeleteDepartment = async (id: number) => {
    try {
      await departmentApi.delete(id);
      message.success('تم حذف الإدارة بنجاح');
      fetchDepartments();
    } catch (error) {
      message.error('فشل حذف الإدارة');
    }
  };

  const handleSubmitDepartment = async (values: Partial<Department>) => {
    try {
      if (editingDepartment) {
        // For updates, ensure we include the ID and preserve isActive
        const updateData = {
          ...values,
          id: editingDepartment.id,
          isActive: values.isActive !== undefined ? values.isActive : editingDepartment.isActive
        };
        await departmentApi.update(editingDepartment.id, updateData);
        message.success('تم تحديث الإدارة بنجاح');
      } else {
        // For creation, don't include code - it will be generated
        const { code, ...createData } = values;
        await departmentApi.create(createData);
        message.success('تم إنشاء الإدارة بنجاح');
      }
      setModalVisible(false);
      fetchDepartments();
    } catch (error) {
      console.error('Department operation error:', error);
      message.error(editingDepartment ? 'فشل تحديث الإدارة' : 'فشل إنشاء الإدارة');
    }
  };

  const handleAddSection = () => {
    setEditingSection(null);
    sectionForm.resetFields();
    setSectionModalVisible(true);
  };

  const handleEditSection = (record: Section) => {
    setEditingSection(record);
    // Don't include code in the form - it's auto-generated
    const { code, ...formData } = record;
    sectionForm.setFieldsValue(formData);
    setSectionModalVisible(true);
  };

  const handleDeleteSection = async (id: number) => {
    try {
      await sectionApi.delete(id);
      message.success('تم حذف القسم بنجاح');
      fetchSections();
    } catch (error) {
      message.error('فشل حذف القسم');
    }
  };

  const handleSubmitSection = async (values: Partial<Section>) => {
    try {
      if (editingSection) {
        // For updates, ensure we include the ID and preserve isActive
        const updateData = {
          ...values,
          id: editingSection.id,
          isActive: values.isActive !== undefined ? values.isActive : editingSection.isActive
        };
        await sectionApi.update(editingSection.id, updateData);
        message.success('تم تحديث القسم بنجاح');
      } else {
        // For creation, don't include code - it will be generated
        const { code, ...createData } = values;
        await sectionApi.create(createData);
        message.success('تم إنشاء القسم بنجاح');
      }
      setSectionModalVisible(false);
      fetchSections();
    } catch (error) {
      console.error('Section operation error:', error);
      message.error(editingSection ? 'فشل تحديث القسم' : 'فشل إنشاء القسم');
    }
  };

  const departmentColumns = [
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
      render: (_: unknown, record: Department) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditDepartment(record)}>
            تعديل
          </Button>
          <Popconfirm
            title="هل أنت متأكد من حذف هذه الإدارة؟"
            onConfirm={() => handleDeleteDepartment(record.id)}
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

  const sectionColumns = [
    { title: 'الاسم', dataIndex: 'name', key: 'name' },
    { title: 'الرمز', dataIndex: 'code', key: 'code' },
    { title: 'الإدارة', dataIndex: 'departmentName', key: 'departmentName' },
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
      render: (_: unknown, record: Section) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditSection(record)}>
            تعديل
          </Button>
          <Popconfirm
            title="هل أنت متأكد من حذف هذا القسم؟"
            onConfirm={() => handleDeleteSection(record.id)}
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
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddDepartment}>
              إضافة إدارة
            </Button>
          </div>
          <Table
            columns={departmentColumns}
            dataSource={departments}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 5 }}
          />
        </Col>

        <Col span={24}>
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSection}>
              إضافة قسم
            </Button>
          </div>
          <Table
            columns={sectionColumns}
            dataSource={sections}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 5 }}
          />
        </Col>
      </Row>

      <Modal
        title={editingDepartment ? 'تعديل الإدارة' : 'إضافة إدارة'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitDepartment}>
          <Form.Item 
            name="name" 
            label="اسم الإدارة" 
            rules={[{ required: true, message: 'يرجى إدخال اسم الإدارة' }]}
          >
            <Input placeholder="مثال: إدارة تقنية المعلومات، إدارة الموارد البشرية" />
          </Form.Item>
          <Form.Item name="description" label="الوصف">
            <Input.TextArea rows={3} placeholder="وصف الإدارة (اختياري)" />
          </Form.Item>
          {editingDepartment && (
            <Form.Item name="isActive" label="نشط" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        title={editingSection ? 'تعديل القسم' : 'إضافة قسم'}
        open={sectionModalVisible}
        onCancel={() => setSectionModalVisible(false)}
        onOk={() => sectionForm.submit()}
        width={600}
      >
        <Form form={sectionForm} layout="vertical" onFinish={handleSubmitSection}>
          <Form.Item 
            name="name" 
            label="اسم القسم" 
            rules={[{ required: true, message: 'يرجى إدخال اسم القسم' }]}
          >
            <Input placeholder="مثال: قسم البرمجة، قسم الدعم الفني" />
          </Form.Item>
          <Form.Item 
            name="departmentId" 
            label="الإدارة" 
            rules={[{ required: true, message: 'يرجى اختيار الإدارة' }]}
          >
            <Select placeholder="اختر الإدارة">
              {departments.map(dept => (
                <Select.Option key={dept.id} value={dept.id}>{dept.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="الوصف">
            <Input.TextArea rows={3} placeholder="وصف القسم (اختياري)" />
          </Form.Item>
          {editingSection && (
            <Form.Item name="isActive" label="نشط" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
