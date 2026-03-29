import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Switch, message, Popconfirm, Tag, Row, Col } from 'antd';
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
      message.error('Failed to load departments');
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
      message.error('Failed to load sections');
    }
  };

  const handleAddDepartment = () => {
    setEditingDepartment(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditDepartment = (record: Department) => {
    setEditingDepartment(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDeleteDepartment = async (id: number) => {
    try {
      await departmentApi.delete(id);
      message.success('Department deleted successfully');
      fetchDepartments();
    } catch (error) {
      message.error('Failed to delete department');
    }
  };

  const handleSubmitDepartment = async (values: Partial<Department>) => {
    try {
      if (editingDepartment) {
        await departmentApi.update(editingDepartment.id, values);
        message.success('Department updated successfully');
      } else {
        await departmentApi.create(values);
        message.success('Department created successfully');
      }
      setModalVisible(false);
      fetchDepartments();
    } catch (error) {
      message.error('Failed to save department');
    }
  };

  const handleAddSection = () => {
    setEditingSection(null);
    sectionForm.resetFields();
    setSectionModalVisible(true);
  };

  const handleEditSection = (record: Section) => {
    setEditingSection(record);
    sectionForm.setFieldsValue(record);
    setSectionModalVisible(true);
  };

  const handleDeleteSection = async (id: number) => {
    try {
      await sectionApi.delete(id);
      message.success('Section deleted successfully');
      fetchSections();
    } catch (error) {
      message.error('Failed to delete section');
    }
  };

  const handleSubmitSection = async (values: Partial<Section>) => {
    try {
      if (editingSection) {
        await sectionApi.update(editingSection.id, values);
        message.success('Section updated successfully');
      } else {
        await sectionApi.create(values);
        message.success('Section created successfully');
      }
      setSectionModalVisible(false);
      fetchSections();
    } catch (error) {
      message.error('Failed to save section');
    }
  };

  const departmentColumns = [
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
      render: (_: unknown, record: Department) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditDepartment(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this department?"
            onConfirm={() => handleDeleteDepartment(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const sectionColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Department', dataIndex: 'departmentName', key: 'departmentName' },
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
      render: (_: unknown, record: Section) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditSection(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this section?"
            onConfirm={() => handleDeleteSection(record.id)}
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
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddDepartment}>
              Add Department
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
              Add Section
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
        title={editingDepartment ? 'Edit Department' : 'Add Department'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitDepartment}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="Code" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingSection ? 'Edit Section' : 'Add Section'}
        open={sectionModalVisible}
        onCancel={() => setSectionModalVisible(false)}
        onOk={() => sectionForm.submit()}
        width={600}
      >
        <Form form={sectionForm} layout="vertical" onFinish={handleSubmitSection}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="Code" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="departmentId" label="Department" rules={[{ required: true }]}>
            <select className="ant-input" style={{ width: '100%', height: 32 }}>
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
