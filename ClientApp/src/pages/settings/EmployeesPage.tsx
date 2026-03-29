import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Switch, message, Popconfirm, Tag, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { employeeApi } from '../../api/employee.api';
import { departmentApi } from '../../api/department.api';
import { sectionApi } from '../../api/section.api';
import type { Employee, Department, Section } from '../../types';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form] = Form.useForm();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await employeeApi.getAll();
      console.log('Employees API response:', response.data);
      
      if (response.data.success && response.data.data) {
        // Check if it's a PagedResult or simple array
        const employeeData = response.data.data.items 
          ? response.data.data.items 
          : Array.isArray(response.data.data) 
            ? response.data.data 
            : [];
        
        console.log('Employees loaded:', employeeData);
        setEmployees(employeeData);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
      message.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentApi.getAll();
      if (response.data.success && response.data.data) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      message.error('Failed to load departments');
    }
  };

  const fetchSectionsByDepartment = async (departmentId: number) => {
    try {
      console.log('Fetching sections for department:', departmentId);
      const response = await sectionApi.getByDepartment(departmentId);
      console.log('Sections API response:', response.data);
      
      if (response.data.success && response.data.data) {
        console.log('Sections loaded:', response.data.data);
        setSections(response.data.data);
      } else {
        console.log('No sections found');
        setSections([]);
      }
    } catch (error) {
      console.error('Failed to load sections:', error);
      message.error('Failed to load sections');
      setSections([]);
    }
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Employee) => {
    setEditingEmployee(record);
    form.setFieldsValue(record);
    if (record.departmentId) {
      setSelectedDepartmentId(record.departmentId);
      fetchSectionsByDepartment(record.departmentId);
    }
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await employeeApi.delete(id);
      message.success('Employee deleted successfully');
      fetchEmployees();
    } catch (error) {
      message.error('Failed to delete employee');
    }
  };

  const handleSubmit = async (values: Partial<Employee>) => {
    try {
      if (editingEmployee) {
        await employeeApi.update(editingEmployee.id, values);
        message.success('Employee updated successfully');
      } else {
        await employeeApi.create(values);
        message.success('Employee created successfully');
      }
      setModalVisible(false);
      fetchEmployees();
    } catch (error) {
      message.error('Failed to save employee');
    }
  };

  const handleDepartmentChange = (departmentId: number) => {
    setSelectedDepartmentId(departmentId);
    form.setFieldValue('sectionId', undefined);
    fetchSectionsByDepartment(departmentId);
  };

  const columns = [
    { title: 'Employee Number', dataIndex: 'employeeNumber', key: 'employeeNumber' },
    { title: 'Full Name', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phoneNumber', key: 'phoneNumber' },
    { title: 'Job Title', dataIndex: 'jobTitle', key: 'jobTitle' },
    { title: 'Department', dataIndex: 'departmentName', key: 'departmentName' },
    { title: 'Section', dataIndex: 'sectionName', key: 'sectionName' },
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
      render: (_: unknown, record: Employee) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this employee?"
            onConfirm={() => handleDelete(record.id)}
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
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Employee
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={employees}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingEmployee ? 'Edit Employee' : 'Add Employee'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="employeeNumber" label="Employee Number" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          
          <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="phoneNumber" label="Phone Number">
            <Input />
          </Form.Item>

          <Form.Item name="nationalId" label="National ID">
            <Input />
          </Form.Item>

          <Form.Item name="jobTitle" label="Job Title">
            <Input />
          </Form.Item>

          <Form.Item name="departmentId" label="Department" rules={[{ required: true }]}>
            <Select
              placeholder="Select department"
              onChange={handleDepartmentChange}
              showSearch
              optionFilterProp="children"
            >
              {departments.map(dept => (
                <Select.Option key={dept.id} value={dept.id}>{dept.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="sectionId" label="Section">
            <Select
              placeholder="Select section"
              disabled={!selectedDepartmentId}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {sections.map(sec => (
                <Select.Option key={sec.id} value={sec.id}>{sec.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="isActive" label="Active" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
