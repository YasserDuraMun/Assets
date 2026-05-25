import { useState, useEffect, useRef } from 'react';
import { Table, Button, Space, Modal, Form, Input, Switch, message, Popconfirm, Tag, Select, DatePicker, QRCode, Divider, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, QrcodeOutlined, DownloadOutlined, LinkOutlined } from '@ant-design/icons';
import usePermissions from '../../hooks/usePermissions';
import { employeeApi } from '../../api/employee.api';
import { departmentApi } from '../../api/department.api';
import { sectionApi } from '../../api/section.api';
import type { Employee, Department, Section } from '../../types';

const { Text } = Typography;

export default function EmployeesPage() {
  const { getScreenPermissions } = usePermissions();
  const employeePermissions = getScreenPermissions('Employees');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [qrEmployee, setQrEmployee] = useState<Employee | null>(null);
  const [generatingQR, setGeneratingQR] = useState(false);
  const [form] = Form.useForm();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await employeeApi.getAll();
      if (response.data.success && response.data.data) {
        const employeeData = response.data.data.items
          ? response.data.data.items
          : Array.isArray(response.data.data)
            ? response.data.data
            : [];
        setEmployees(employeeData);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
      message.error('فشل تحميل الموظفين');
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
      message.error('فشل تحميل الإدارات');
    }
  };

  const fetchSectionsByDepartment = async (departmentId: number) => {
    try {
      const response = await sectionApi.getByDepartment(departmentId);
      if (response.data.success && response.data.data) {
        setSections(response.data.data);
      } else {
        setSections([]);
      }
    } catch (error) {
      console.error('Failed to load sections:', error);
      setSections([]);
    }
  };

  const handleAdd = () => {
    if (!employeePermissions.canCreate) {
      message.error('ليس لديك صلاحية لإضافة الموظفين');
      return;
    }
    setEditingEmployee(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Employee) => {
    if (!employeePermissions.canUpdate) {
      message.error('ليس لديك صلاحية لتعديل الموظفين');
      return;
    }
    setEditingEmployee(record);
    form.setFieldsValue(record);
    if (record.departmentId) {
      setSelectedDepartmentId(record.departmentId);
      fetchSectionsByDepartment(record.departmentId);
    }
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    if (!employeePermissions.canDelete) {
      message.error('ليس لديك صلاحية لحذف الموظفين');
      return;
    }
    try {
      await employeeApi.delete(id);
      message.success('تم حذف الموظف بنجاح');
      fetchEmployees();
    } catch (error) {
      message.error('فشل حذف الموظف');
    }
  };

  const handleSubmit = async (values: Partial<Employee>) => {
    try {
      if (editingEmployee) {
        const updateData = {
          ...values,
          id: editingEmployee.id,
          isActive: values.isActive !== undefined ? values.isActive : editingEmployee.isActive
        };
        await employeeApi.update(editingEmployee.id, updateData);
        message.success('تم تحديث الموظف بنجاح');
      } else {
        await employeeApi.create(values);
        message.success('تم إنشاء الموظف بنجاح');
      }
      setModalVisible(false);
      fetchEmployees();
    } catch (error) {
      console.error('Employee operation error:', error);
      message.error(editingEmployee ? 'فشل تحديث الموظف' : 'فشل إنشاء الموظف');
    }
  };

  const handleDepartmentChange = (departmentId: number) => {
    setSelectedDepartmentId(departmentId);
    form.setFieldValue('sectionId', undefined);
    fetchSectionsByDepartment(departmentId);
  };

  const handleShowQR = (record: Employee) => {
    setQrEmployee(record);
    setQrModalVisible(true);
  };

  const handleGenerateQR = async () => {
    if (!qrEmployee) return;
    setGeneratingQR(true);
    try {
      const response = await employeeApi.generateQRCode(qrEmployee.id);
      if (response.data.success) {
        message.success('تم توليد رمز QR بنجاح');
        // Update the employee in the local list with the new QR code
        const updatedEmployee = { ...qrEmployee, qrCode: response.data.data?.qrCode };
        setQrEmployee(updatedEmployee);
        setEmployees(prev => prev.map(e => e.id === qrEmployee.id ? updatedEmployee : e));
      }
    } catch (error) {
      message.error('فشل توليد رمز QR');
    } finally {
      setGeneratingQR(false);
    }
  };

  const handleDownloadQR = () => {
    const canvas = qrRef.current?.querySelector<HTMLCanvasElement>('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR-${qrEmployee?.employeeNumber || qrEmployee?.id}.png`;
      a.click();
    } else {
      // Try SVG download
      const svg = qrRef.current?.querySelector<SVGElement>('svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `QR-${qrEmployee?.employeeNumber || qrEmployee?.id}.svg`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  const getEmployeeAssetsUrl = (employee: Employee) => {
    return `${window.location.origin}/employees/${employee.id}/assets`;
  };

  const columns = [
    { title: 'رقم الموظف', dataIndex: 'employeeNumber', key: 'employeeNumber' },
    { title: 'الاسم الكامل', dataIndex: 'fullName', key: 'fullName' },
    { title: 'البريد الإلكتروني', dataIndex: 'email', key: 'email' },
    { title: 'الهاتف', dataIndex: 'phone', key: 'phone' },
    { title: 'المسمى الوظيفي', dataIndex: 'jobTitle', key: 'jobTitle' },
    { title: 'الإدارة', dataIndex: 'departmentName', key: 'departmentName' },
    { title: 'القسم', dataIndex: 'sectionName', key: 'sectionName' },
    {
      title: 'QR',
      dataIndex: 'qrCode',
      key: 'qrCode',
      render: (qrCode: string | undefined) => (
        <Tag color={qrCode ? 'green' : 'default'}>
          {qrCode ? 'مُنشأ' : 'لم يُنشأ'}
        </Tag>
      ),
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
      render: (_: unknown, record: Employee) => {
        const actions: React.ReactNode[] = [];

        actions.push(
          <Button
            key="qr"
            type="link"
            icon={<QrcodeOutlined />}
            onClick={() => handleShowQR(record)}
          >
            QR
          </Button>
        );

        if (employeePermissions.canUpdate) {
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

        if (employeePermissions.canDelete) {
          actions.push(
            <Popconfirm
              key="delete"
              title="هل أنت متأكد من حذف هذا الموظف؟"
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

        return actions.length > 0 ? <Space>{actions}</Space> : null;
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        {employeePermissions.canCreate && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            إضافة موظف
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={employees}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Add/Edit Employee Modal */}
      <Modal
        title={editingEmployee ? 'تعديل الموظف' : 'إضافة موظف'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="employeeNumber"
            label="رقم الموظف"
            rules={[{ required: true, message: 'يرجى إدخال رقم الموظف' }]}
          >
            <Input placeholder="مثال: EMP001, A123" />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="الاسم الكامل"
            rules={[{ required: true, message: 'يرجى إدخال اسم الموظف' }]}
          >
            <Input placeholder="مثال: أحمد محمد علي" />
          </Form.Item>

          <Form.Item
            name="email"
            label="البريد الإلكتروني"
            rules={[{ type: 'email', message: 'يرجى إدخال بريد إلكتروني صحيح' }]}
          >
            <Input placeholder="example@company.com" />
          </Form.Item>

          <Form.Item name="phone" label="رقم الهاتف">
            <Input placeholder="مثال: 966501234567" />
          </Form.Item>

          <Form.Item name="nationalId" label="رقم الهوية الوطنية">
            <Input placeholder="مثال: 1234567890" />
          </Form.Item>

          <Form.Item name="jobTitle" label="المسمى الوظيفي">
            <Input placeholder="مثال: مطور برمجيات، محاسب" />
          </Form.Item>

          <Form.Item
            name="departmentId"
            label="الإدارة"
            rules={[{ required: true, message: 'يرجى اختيار الإدارة' }]}
          >
            <Select
              placeholder="اختر الإدارة"
              onChange={handleDepartmentChange}
              showSearch
              optionFilterProp="children"
            >
              {departments.map(dept => (
                <Select.Option key={dept.id} value={dept.id}>{dept.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="sectionId" label="القسم">
            <Select
              placeholder="اختر القسم (اختياري)"
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

          <Form.Item name="hireDate" label="تاريخ التوظيف">
            <DatePicker style={{ width: '100%' }} placeholder="اختر تاريخ التوظيف" />
          </Form.Item>

          {editingEmployee && (
            <Form.Item name="isActive" label="نشط" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        title={`رمز QR - ${qrEmployee?.fullName || ''}`}
        open={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={null}
        width={420}
        centered
      >
        {qrEmployee && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 12 }}>
              <Text strong style={{ fontSize: 16 }}>{qrEmployee.fullName}</Text>
              <br />
              <Text type="secondary">{qrEmployee.employeeNumber} • {qrEmployee.departmentName}</Text>
            </div>

            <Divider />

            <div ref={qrRef} style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <QRCode
                value={getEmployeeAssetsUrl(qrEmployee)}
                size={220}
                bordered={false}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                امسح الرمز لعرض الأصول المخصصة لهذا الموظف
              </Text>
              <br />
              <Text
                copyable={{ text: getEmployeeAssetsUrl(qrEmployee) }}
                style={{ fontSize: 11, color: '#888', wordBreak: 'break-all' }}
              >
                {getEmployeeAssetsUrl(qrEmployee)}
              </Text>
            </div>

            <Space>
              <Button icon={<DownloadOutlined />} onClick={handleDownloadQR}>
                تحميل الصورة
              </Button>
              <Button
                icon={<LinkOutlined />}
                onClick={() => window.open(getEmployeeAssetsUrl(qrEmployee), '_blank')}
              >
                فتح صفحة الأصول
              </Button>
              {employeePermissions.canCreate && (
                <Button
                  icon={<QrcodeOutlined />}
                  loading={generatingQR}
                  onClick={handleGenerateQR}
                >
                  {qrEmployee.qrCode ? 'تجديد' : 'توليد'} رمز QR
                </Button>
              )}
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
}
