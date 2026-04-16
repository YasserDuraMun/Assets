import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Switch, message, Popconfirm, Tag, Select, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import usePermissions from '../../hooks/usePermissions';
import { employeeApi } from '../../api/employee.api';
import { departmentApi } from '../../api/department.api';
import { sectionApi } from '../../api/section.api';
import type { Employee, Department, Section } from '../../types';

export default function EmployeesPage() {
  const { getScreenPermissions } = usePermissions();
  const employeePermissions = getScreenPermissions('Employees');
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
      message.error('فشل تحميل الأقسام');
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
        // For updates, ensure we include the ID and preserve isActive
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

  const columns = [
    { title: 'رقم الموظف', dataIndex: 'employeeNumber', key: 'employeeNumber' },
    { title: 'الاسم الكامل', dataIndex: 'fullName', key: 'fullName' },
    { title: 'البريد الإلكتروني', dataIndex: 'email', key: 'email' },
    { title: 'الهاتف', dataIndex: 'phone', key: 'phone' },
    { title: 'المسمى الوظيفي', dataIndex: 'jobTitle', key: 'jobTitle' },
    { title: 'الإدارة', dataIndex: 'departmentName', key: 'departmentName' },
    { title: 'القسم', dataIndex: 'sectionName', key: 'sectionName' },
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
        const actions = [];

        // Edit button - only show if user has update permission
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

        // Delete button - only show if user has delete permission
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

        // Return actions or null if no actions available
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
    </div>
  );
}
