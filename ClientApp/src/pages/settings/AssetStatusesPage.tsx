import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Switch, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import usePermissions from '../../hooks/usePermissions';
import { statusApi } from '../../api/status.api';
import type { AssetStatus } from '../../types';

export default function AssetStatusesPage() {
  const { getScreenPermissions } = usePermissions();
  const statusPermissions = getScreenPermissions('Assets'); // Asset statuses use Assets permission
  const [statuses, setStatuses] = useState<AssetStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStatus, setEditingStatus] = useState<AssetStatus | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const response = await statusApi.getAll();
      if (response.data.success && response.data.data) {
        setStatuses(response.data.data);
      }
    } catch (error) {
      message.error('فشل تحميل الحالات');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (!statusPermissions.canCreate) {
      message.error('ليس لديك صلاحية لإضافة حالات الأصول');
      return;
    }
    setEditingStatus(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: AssetStatus) => {
    if (!statusPermissions.canUpdate) {
      message.error('ليس لديك صلاحية لتعديل حالات الأصول');
      return;
    }
    setEditingStatus(record);
    // Don't include code in the form - it's auto-generated
    const { code, ...formData } = record;
    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    if (!statusPermissions.canDelete) {
      message.error('ليس لديك صلاحية لحذف حالات الأصول');
      return;
    }
    try {
      await statusApi.delete(id);
      message.success('تم حذف الحالة بنجاح');
      fetchStatuses();
    } catch (error) {
      message.error('فشل حذف الحالة');
    }
  };

  const handleSubmit = async (values: Partial<AssetStatus>) => {
    try {
      if (editingStatus) {
        // For updates, ensure we include the ID and preserve isActive
        const updateData = {
          ...values,
          id: editingStatus.id,
          isActive: values.isActive !== undefined ? values.isActive : editingStatus.isActive
        };
        await statusApi.update(editingStatus.id, updateData);
        message.success('تم تحديث الحالة بنجاح');
      } else {
        // For creation, don't include code - it will be generated
        const { code, ...createData } = values;
        await statusApi.create(createData);
        message.success('تم إنشاء الحالة بنجاح');
      }
      setModalVisible(false);
      fetchStatuses();
    } catch (error) {
      console.error('Status operation error:', error);
      message.error(editingStatus ? 'فشل تحديث الحالة' : 'فشل إنشاء الحالة');
    }
  };

  const columns = [
    {
      title: 'الاسم',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'الرمز',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'اللون',
      dataIndex: 'color',
      key: 'color',
      render: (color: string) => (
        <Tag color={color || 'default'}>{color || 'افتراضي'}</Tag>
      ),
    },
    {
      title: 'الوصف',
      dataIndex: 'description',
      key: 'description',
    },
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
      render: (_: unknown, record: AssetStatus) => {
        const actions = [];

        // Edit button - only show if user has update permission
        if (statusPermissions.canUpdate) {
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
        if (statusPermissions.canDelete) {
          actions.push(
            <Popconfirm
              key="delete"
              title="هل أنت متأكد من حذف هذه الحالة؟"
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
        {statusPermissions.canCreate && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            إضافة حالة
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={statuses}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingStatus ? 'تعديل الحالة' : 'إضافة حالة'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="اسم الحالة"
            rules={[{ required: true, message: 'يرجى إدخال اسم الحالة' }]}
          >
            <Input placeholder="مثال: متاح، قيد الصيانة، تالف" />
          </Form.Item>

          <Form.Item
            name="color"
            label="اللون"
          >
            <Input type="color" />
          </Form.Item>

          <Form.Item
            name="description"
            label="الوصف"
          >
            <Input.TextArea rows={3} placeholder="وصف الحالة (اختياري)" />
          </Form.Item>

          {editingStatus && (
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
    </div>
  );
}
