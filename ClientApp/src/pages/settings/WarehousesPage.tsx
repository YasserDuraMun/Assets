import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Switch, message, Popconfirm, Tag, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import usePermissions from '../../hooks/usePermissions';
import { warehouseApi } from '../../api/warehouse.api';
import { employeeApi } from '../../api/employee.api';
import type { Warehouse, Employee } from '../../types';

export default function WarehousesPage() {
  const { getScreenPermissions } = usePermissions();
  const warehousePermissions = getScreenPermissions('Warehouses');
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
      message.error('فشل تحميل المستودعات');
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
      message.error('فشل تحميل الموظفين');
      setEmployees([]);
    }
  };

  const handleAdd = () => {
    if (!warehousePermissions.canCreate) {
      message.error('ليس لديك صلاحية لإضافة المستودعات');
      return;
    }
    setEditingWarehouse(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Warehouse) => {
    if (!warehousePermissions.canUpdate) {
      message.error('ليس لديك صلاحية لتعديل المستودعات');
      return;
    }
    setEditingWarehouse(record);
    // Don't include code in the form - it's auto-generated
    const { code, ...formData } = record;
    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    if (!warehousePermissions.canDelete) {
      message.error('ليس لديك صلاحية لحذف المستودعات');
      return;
    }
    try {
      await warehouseApi.delete(id);
      message.success('تم حذف المستودع بنجاح');
      fetchWarehouses();
    } catch (error) {
      message.error('فشل حذف المستودع');
    }
  };

  const handleSubmit = async (values: Partial<Warehouse>) => {
    try {
      if (editingWarehouse) {
        // For updates, ensure we include the ID and preserve isActive
        const updateData = {
          ...values,
          id: editingWarehouse.id,
          isActive: values.isActive !== undefined ? values.isActive : editingWarehouse.isActive
        };
        await warehouseApi.update(editingWarehouse.id, updateData);
        message.success('تم تحديث المستودع بنجاح');
      } else {
        // For creation, don't include code - it will be generated
        const { code, ...createData } = values;
        await warehouseApi.create(createData);
        message.success('تم إنشاء المستودع بنجاح');
      }
      setModalVisible(false);
      fetchWarehouses();
    } catch (error) {
      console.error('Warehouse operation error:', error);
      message.error(editingWarehouse ? 'فشل تحديث المستودع' : 'فشل إنشاء المستودع');
    }
  };

  const columns = [
    { title: 'الاسم', dataIndex: 'name', key: 'name' },
    { title: 'الرمز', dataIndex: 'code', key: 'code' },
    { title: 'الموقع', dataIndex: 'location', key: 'location' },
    { title: 'المسؤول', dataIndex: 'responsibleEmployeeName', key: 'responsibleEmployeeName' },
    { title: 'عدد الأصول', dataIndex: 'currentAssetsCount', key: 'currentAssetsCount' },
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
      render: (_: unknown, record: Warehouse) => {
        const actions = [];

        // Edit button - only show if user has update permission
        if (warehousePermissions.canUpdate) {
          actions.push(
            <Button
              key="edit"
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              تعديل
            </Button>
          );
        }

        // Delete button - only show if user has delete permission
        if (warehousePermissions.canDelete) {
          actions.push(
            <Popconfirm
              key="delete"
              title="هل أنت متأكد من حذف هذا المستودع؟"
              onConfirm={() => handleDelete(record.id)}
              okText="نعم"
              cancelText="لا"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                حذف
              </Button>
            </Popconfirm>
          );
        }

        // Return actions or null if no actions available
        return actions.length > 0 ? <Space>{actions}</Space> : null;
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        {warehousePermissions.canCreate && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            إضافة مستودع
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={warehouses}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingWarehouse ? 'تعديل مستودع' : 'إضافة مستودع'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item 
            name="name" 
            label="اسم المستودع" 
            rules={[{ required: true, message: 'يرجى إدخال اسم المستودع' }]}
          >
            <Input placeholder="مثال: مستودع الرياض الرئيسي، مستودع قطع الغيار" />
          </Form.Item>
          
          <Form.Item name="location" label="الموقع">
            <Input placeholder="مثال: الرياض، حي النخيل، الدور الأول" />
          </Form.Item>
          
          <Form.Item name="responsibleEmployeeId" label="الموظف المسؤول">
            <Select
              placeholder="اختر الموظف المسؤول (اختياري)"
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
          
          <Form.Item name="notes" label="ملاحظات">
            <Input.TextArea rows={3} placeholder="ملاحظات إضافية (اختياري)" />
          </Form.Item>
          
          {editingWarehouse && (
            <Form.Item name="isActive" label="نشط" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
