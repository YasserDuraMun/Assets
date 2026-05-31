import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Switch, message, Popconfirm, Tag, Row, Col, Select, Empty, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, RightOutlined } from '@ant-design/icons';
import usePermissions from '../../hooks/usePermissions';
import { departmentApi } from '../../api/department.api';
import { sectionApi } from '../../api/section.api';
import type { Department, Section } from '../../types';

const { Text } = Typography;

export default function DepartmentsPage() {
  const { getScreenPermissions } = usePermissions();
  const departmentPermissions = getScreenPermissions('Departments');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [sectionLoading, setSectionLoading] = useState(false);

  // Drill-down selection
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  // Department modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [form] = Form.useForm();

  // Section modal
  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [sectionForm] = Form.useForm();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await departmentApi.getAll();
      if (response.data.success && response.data.data) {
        setDepartments(response.data.data);
      }
    } catch {
      message.error('فشل تحميل الإدارات');
    } finally {
      setLoading(false);
    }
  };

  const fetchSectionsByDepartment = async (departmentId: number) => {
    setSectionLoading(true);
    try {
      const response = await sectionApi.getByDepartment(departmentId);
      if (response.data.success && response.data.data) {
        setSections(response.data.data);
      } else {
        setSections([]);
      }
    } catch {
      setSections([]);
    } finally {
      setSectionLoading(false);
    }
  };

  // ---- Drill-down handler ----

  const handleSelectDepartment = (record: Department) => {
    setSelectedDepartmentId(record.id);
    setSelectedDepartment(record);
    fetchSectionsByDepartment(record.id);
  };

  // ---- Department handlers ----

  const handleAddDepartment = () => {
    if (!departmentPermissions.canCreate) { message.error('ليس لديك صلاحية لإضافة الإدارات'); return; }
    setEditingDepartment(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditDepartment = (record: Department) => {
    if (!departmentPermissions.canUpdate) { message.error('ليس لديك صلاحية لتعديل الإدارات'); return; }
    setEditingDepartment(record);
    const { code, ...formData } = record;
    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  const handleDeleteDepartment = async (id: number) => {
    if (!departmentPermissions.canDelete) { message.error('ليس لديك صلاحية لحذف الإدارات'); return; }
    try {
      await departmentApi.delete(id);
      message.success('تم حذف الإدارة بنجاح');
      if (selectedDepartmentId === id) {
        setSelectedDepartmentId(null);
        setSelectedDepartment(null);
        setSections([]);
      }
      fetchDepartments();
    } catch {
      message.error('فشل حذف الإدارة');
    }
  };

  const handleSubmitDepartment = async (values: Partial<Department>) => {
    try {
      if (editingDepartment) {
        await departmentApi.update(editingDepartment.id, {
          ...values,
          id: editingDepartment.id,
          isActive: values.isActive !== undefined ? values.isActive : editingDepartment.isActive,
        });
        message.success('تم تحديث الإدارة بنجاح');
      } else {
        const { code, ...createData } = values as any;
        await departmentApi.create(createData);
        message.success('تم إنشاء الإدارة بنجاح');
      }
      setModalVisible(false);
      fetchDepartments();
    } catch {
      message.error(editingDepartment ? 'فشل تحديث الإدارة' : 'فشل إنشاء الإدارة');
    }
  };

  // ---- Section handlers ----

  const handleAddSection = () => {
    if (!departmentPermissions.canCreate) { message.error('ليس لديك صلاحية لإضافة الأقسام'); return; }
    setEditingSection(null);
    sectionForm.resetFields();
    if (selectedDepartmentId) {
      sectionForm.setFieldValue('departmentId', selectedDepartmentId);
    }
    setSectionModalVisible(true);
  };

  const handleEditSection = (record: Section) => {
    if (!departmentPermissions.canUpdate) { message.error('ليس لديك صلاحية لتعديل الأقسام'); return; }
    setEditingSection(record);
    const { code, ...formData } = record;
    sectionForm.setFieldsValue(formData);
    setSectionModalVisible(true);
  };

  const handleDeleteSection = async (id: number) => {
    if (!departmentPermissions.canDelete) { message.error('ليس لديك صلاحية لحذف الأقسام'); return; }
    try {
      await sectionApi.delete(id);
      message.success('تم حذف القسم بنجاح');
      if (selectedDepartmentId) fetchSectionsByDepartment(selectedDepartmentId);
    } catch {
      message.error('فشل حذف القسم');
    }
  };

  const handleSubmitSection = async (values: Partial<Section>) => {
    try {
      if (editingSection) {
        await sectionApi.update(editingSection.id, {
          ...values,
          id: editingSection.id,
          isActive: values.isActive !== undefined ? values.isActive : editingSection.isActive,
        });
        message.success('تم تحديث القسم بنجاح');
      } else {
        const { code, ...createData } = values as any;
        await sectionApi.create(createData);
        message.success('تم إنشاء القسم بنجاح');
      }
      setSectionModalVisible(false);
      if (selectedDepartmentId) fetchSectionsByDepartment(selectedDepartmentId);
    } catch {
      message.error(editingSection ? 'فشل تحديث القسم' : 'فشل إنشاء القسم');
    }
  };

  // ---- Columns ----

  const departmentColumns = [
    {
      title: 'الإدارة',
      key: 'name',
      render: (_: unknown, record: Department) => (
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space direction="vertical" size={0}>
            <Tag color={record.isActive ? 'blue' : 'default'}>{record.name}</Tag>
            <Text type="secondary" style={{ fontSize: 11, paddingRight: 4 }}>{record.code}</Text>
          </Space>
          {selectedDepartmentId === record.id && <RightOutlined style={{ color: '#1677ff' }} />}
        </Space>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_: unknown, record: Department) => (
        <Space size={0}>
          {departmentPermissions.canUpdate && (
            <Button type="text" size="small" icon={<EditOutlined />} onClick={e => { e.stopPropagation(); handleEditDepartment(record); }} />
          )}
          {departmentPermissions.canDelete && (
            <Popconfirm title="هل أنت متأكد من حذف هذه الإدارة؟" onConfirm={() => handleDeleteDepartment(record.id)} okText="نعم" cancelText="لا">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={e => e.stopPropagation()} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const sectionColumns = [
    {
      title: 'القسم',
      key: 'name',
      render: (_: unknown, record: Section) => (
        <Space direction="vertical" size={0}>
          <Tag color={record.isActive ? 'green' : 'default'}>{record.name}</Tag>
          <Text type="secondary" style={{ fontSize: 11, paddingRight: 4 }}>{record.code}</Text>
        </Space>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_: unknown, record: Section) => (
        <Space size={0}>
          {departmentPermissions.canUpdate && (
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEditSection(record)} />
          )}
          {departmentPermissions.canDelete && (
            <Popconfirm title="هل أنت متأكد من حذف هذا القسم؟" onConfirm={() => handleDeleteSection(record.id)} okText="نعم" cancelText="لا">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const colStyle: import('react').CSSProperties = {
    borderRight: '1px solid #f0f0f0',
    paddingRight: 12,
    paddingLeft: 12,
    minHeight: 400,
  };

  return (
    <div>
      <Row gutter={0} style={{ border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}>

        {/* العمود 1: الإدارات */}
        <Col span={12} style={colStyle}>
          <div style={{ padding: '12px 0 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', marginBottom: 8 }}>
            <Text strong>الإدارات</Text>
            {departmentPermissions.canCreate && (
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAddDepartment}>إضافة</Button>
            )}
          </div>
          <Table
            columns={departmentColumns}
            dataSource={departments}
            rowKey="id"
            loading={loading}
            pagination={false}
            size="small"
            showHeader={false}
            onRow={record => ({
              onClick: () => handleSelectDepartment(record),
              style: {
                cursor: 'pointer',
                background: selectedDepartmentId === record.id ? '#e6f4ff' : undefined,
              },
            })}
            scroll={{ y: 420 }}
          />
        </Col>

        {/* العمود 2: الأقسام */}
        <Col span={12} style={{ ...colStyle, borderRight: 'none' }}>
          <div style={{ padding: '12px 0 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', marginBottom: 8 }}>
            <Text strong>
              الأقسام
              {selectedDepartment && (
                <Text type="secondary" style={{ fontSize: 12, marginRight: 6 }}>({selectedDepartment.name})</Text>
              )}
            </Text>
            {departmentPermissions.canCreate && (
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAddSection} disabled={!selectedDepartmentId}>إضافة</Button>
            )}
          </div>
          {!selectedDepartmentId ? (
            <Empty description="اختر إدارة لعرض أقسامها" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ marginTop: 60 }} />
          ) : (
            <Table
              columns={sectionColumns}
              dataSource={sections}
              rowKey="id"
              loading={sectionLoading}
              pagination={false}
              size="small"
              showHeader={false}
              locale={{ emptyText: 'لا توجد أقسام لهذه الإدارة' }}
              scroll={{ y: 420 }}
            />
          )}
        </Col>
      </Row>

      {/* Modal: الإدارة */}
      <Modal title={editingDepartment ? 'تعديل الإدارة' : 'إضافة إدارة'} open={modalVisible} onCancel={() => setModalVisible(false)} onOk={() => form.submit()} width={500}>
        <Form form={form} layout="vertical" onFinish={handleSubmitDepartment}>
          <Form.Item name="name" label="اسم الإدارة" rules={[{ required: true, message: 'يرجى إدخال اسم الإدارة' }]}>
            <Input placeholder="مثال: إدارة تقنية المعلومات" />
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

      {/* Modal: القسم */}
      <Modal title={editingSection ? 'تعديل القسم' : 'إضافة قسم'} open={sectionModalVisible} onCancel={() => setSectionModalVisible(false)} onOk={() => sectionForm.submit()} width={500}>
        <Form form={sectionForm} layout="vertical" onFinish={handleSubmitSection}>
          <Form.Item name="name" label="اسم القسم" rules={[{ required: true, message: 'يرجى إدخال اسم القسم' }]}>
            <Input placeholder="مثال: قسم البرمجة، قسم الدعم الفني" />
          </Form.Item>
          <Form.Item name="departmentId" label="الإدارة" rules={[{ required: true, message: 'يرجى اختيار الإدارة' }]}>
            <Select placeholder="اختر الإدارة" showSearch optionFilterProp="children">
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
