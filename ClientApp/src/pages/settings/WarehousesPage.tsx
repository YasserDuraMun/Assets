import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Switch, message, Popconfirm, Tag, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { warehouseApi } from '../../api/warehouse.api';
import { employeeApi } from '../../api/employee.api';
import type { Warehouse, Employee } from '../../types';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchWarehouses();
    fetchEmployees();
  }, []);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const response = await warehouseApi.getAll();
      if (response.data.success && response.data.data) {
        setWarehouses(response.data.data);
      }
    } catch (error) {
      message.error('Failed to load warehouses');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      console.log('Fetching active employees...');
      const response = await employeeApi.getActive();
      console.log('Active employees API response:', response.data);
      
      if (response.data.success && response.data.data) {
        console.log('Active employees loaded:', response.data.data);
        setEmployees(response.data.data);
      } else {
        console.log('No active employees found');
        setEmployees([]);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
      message.error('Failed to load employees');
      setEmployees([]);
    }
  };

  const handleAdd = () => {
    setEditingWarehouse(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Warehouse) => {
    setEditingWarehouse(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await warehouseApi.delete(id);
      message.success('Warehouse deleted successfully');
      fetchWarehouses();
    } catch (error) {
      message.error('Failed to delete warehouse');
    }
  };

  const handleSubmit = async (values: Partial<Warehouse>) => {
    try {
      if (editingWarehouse) {
        await warehouseApi.update(editingWarehouse.id, values);
        message.success('Warehouse updated successfully');
      } else {
        await warehouseApi.create(values);
        message.success('Warehouse created successfully');
      }
      setModalVisible(false);
      fetchWarehouses();
    } catch (error) {
      message.error('Failed to save warehouse');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Location', dataIndex: 'location', key: 'location' },
    { title: 'Responsible', dataIndex: 'responsibleEmployeeName', key: 'responsibleEmployeeName' },
    { title: 'Capacity', dataIndex: 'capacity', key: 'capacity' },
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
      render: (_: unknown, record: Warehouse) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this warehouse?"
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
          Add Warehouse
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={warehouses}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingWarehouse ? 'Edit Warehouse' : 'Add Warehouse'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="Code" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="location" label="Location">
            <Input />
          </Form.Item>
          <Form.Item name="responsibleEmployeeId" label="Responsible Employee">
            <Select
              placeholder="Select employee"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {employees.map(emp => (
                <Select.Option key={emp.id} value={emp.id}>
                  {emp.fullName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="capacity" label="Capacity">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
