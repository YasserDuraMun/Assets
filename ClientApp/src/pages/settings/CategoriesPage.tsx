import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm, Tag, Row, Col, Select, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import usePermissions from '../../hooks/usePermissions';
import { categoryApi } from '../../api/category.api';
import { subCategoryApi, assetNameApi, type SubCategory, type CreateSubCategoryDto, type AssetName, type CreateAssetNameDto } from '../../api/subcategory.api';
import type { AssetCategory } from '../../types';

export default function CategoriesPage() {
  const { getScreenPermissions } = usePermissions();
  const categoryPermissions = getScreenPermissions('Categories');

  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [assetNames, setAssetNames] = useState<AssetName[]>([]);
  const [loading, setLoading] = useState(false);

  // Category modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AssetCategory | null>(null);
  const [form] = Form.useForm();

  // SubCategory modal
  const [subModalVisible, setSubModalVisible] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [subForm] = Form.useForm();

  // AssetName modal
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [editingAssetName, setEditingAssetName] = useState<AssetName | null>(null);
  const [nameForm] = Form.useForm();
  const [subCategoriesForNameModal, setSubCategoriesForNameModal] = useState<SubCategory[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchAllSubCategories();
    fetchAllAssetNames();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryApi.getAll();
      if (response.data.success && response.data.data) {
        setCategories(response.data.data);
      }
    } catch {
      message.error('فشل تحميل الفئات');
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
          } catch {
            // Skip
          }
        }
        setSubCategories(allSubCats);
      }
    } catch {
      console.error('Failed to load subcategories');
    }
  };

  const fetchAllAssetNames = async () => {
    try {
      const response = await categoryApi.getAll();
      if (response.data.success && response.data.data) {
        const allNames: AssetName[] = [];
        for (const category of response.data.data) {
          try {
            const subResponse = await subCategoryApi.getByCategoryId(category.id);
            if (subResponse.data.success && subResponse.data.data) {
              for (const sub of subResponse.data.data) {
                try {
                  const nameResponse = await assetNameApi.getBySubCategoryId(sub.id);
                  if (nameResponse.data.success && nameResponse.data.data) {
                    allNames.push(...nameResponse.data.data);
                  }
                } catch {
                  // Skip
                }
              }
            }
          } catch {
            // Skip
          }
        }
        setAssetNames(allNames);
      }
    } catch {
      console.error('Failed to load asset names');
    }
  };

  // ---- Category handlers ----

  const handleAddCategory = () => {
    if (!categoryPermissions.canCreate) { message.error('ليس لديك صلاحية لإضافة الفئات'); return; }
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditCategory = (record: AssetCategory) => {
    if (!categoryPermissions.canUpdate) { message.error('ليس لديك صلاحية لتعديل الفئات'); return; }
    setEditingCategory(record);
    const { code, ...formData } = record;
    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  const handleDeleteCategory = async (id: number) => {
    if (!categoryPermissions.canDelete) { message.error('ليس لديك صلاحية لحذف الفئات'); return; }
    try {
      await categoryApi.delete(id);
      message.success('تم حذف الفئة بنجاح');
      fetchCategories();
    } catch {
      message.error('فشل حذف الفئة');
    }
  };

  const handleSubmitCategory = async (values: Partial<AssetCategory>) => {
    try {
      if (editingCategory) {
        const updateData = { ...values, id: editingCategory.id, isActive: values.isActive !== undefined ? values.isActive : editingCategory.isActive };
        await categoryApi.update(editingCategory.id, updateData);
        message.success('تم تحديث الفئة بنجاح');
      } else {
        const { code, ...createData } = values as any;
        await categoryApi.create(createData);
        message.success('تم إنشاء الفئة بنجاح');
      }
      setModalVisible(false);
      fetchCategories();
    } catch {
      message.error(editingCategory ? 'فشل تحديث الفئة' : 'فشل إنشاء الفئة');
    }
  };

  // ---- SubCategory handlers ----

  const handleAddSubCategory = () => {
    if (!categoryPermissions.canCreate) { message.error('ليس لديك صلاحية لإضافة الفئات الفرعية'); return; }
    setEditingSubCategory(null);
    subForm.resetFields();
    setSubModalVisible(true);
  };

  const handleEditSubCategory = (record: SubCategory) => {
    if (!categoryPermissions.canUpdate) { message.error('ليس لديك صلاحية لتعديل الفئات الفرعية'); return; }
    setEditingSubCategory(record);
    const { code, ...formData } = record;
    subForm.setFieldsValue(formData);
    setSubModalVisible(true);
  };

  const handleDeleteSubCategory = async (id: number) => {
    if (!categoryPermissions.canDelete) { message.error('ليس لديك صلاحية لحذف الفئات الفرعية'); return; }
    try {
      await subCategoryApi.delete(id);
      message.success('تم حذف الفئة الفرعية بنجاح');
      fetchAllSubCategories();
    } catch {
      message.error('فشل حذف الفئة الفرعية');
    }
  };

  const handleSubmitSubCategory = async (values: CreateSubCategoryDto) => {
    try {
      if (editingSubCategory) {
        const { code, ...updateData } = values as any;
        await subCategoryApi.update(editingSubCategory.id, { ...updateData, id: editingSubCategory.id, isActive: true });
        message.success('تم تحديث الفئة الفرعية بنجاح');
      } else {
        const { code, ...createData } = values as any;
        await subCategoryApi.create(createData);
        message.success('تم إنشاء الفئة الفرعية بنجاح');
      }
      setSubModalVisible(false);
      fetchAllSubCategories();
    } catch {
      message.error(editingSubCategory ? 'فشل تحديث الفئة الفرعية' : 'فشل إنشاء الفئة الفرعية');
    }
  };

  // ---- AssetName handlers ----

  const handleCategoryChangeForNameModal = async (categoryId: number) => {
    nameForm.setFieldValue('subCategoryId', undefined);
    setSubCategoriesForNameModal([]);
    try {
      const response = await subCategoryApi.getByCategoryId(categoryId);
      if (response.data.success && response.data.data) {
        setSubCategoriesForNameModal(response.data.data);
      }
    } catch {
      // ignore
    }
  };

  const handleAddAssetName = () => {
    if (!categoryPermissions.canCreate) { message.error('ليس لديك صلاحية لإضافة أسماء الأصول'); return; }
    setEditingAssetName(null);
    nameForm.resetFields();
    setSubCategoriesForNameModal([]);
    setNameModalVisible(true);
  };

  const handleEditAssetName = async (record: AssetName) => {
    if (!categoryPermissions.canUpdate) { message.error('ليس لديك صلاحية لتعديل أسماء الأصول'); return; }
    setEditingAssetName(record);
    // Find the category for this subcategory
    const subCat = subCategories.find(s => s.id === record.subCategoryId);
    if (subCat) {
      try {
        const response = await subCategoryApi.getByCategoryId(subCat.categoryId);
        if (response.data.success && response.data.data) {
          setSubCategoriesForNameModal(response.data.data);
        }
      } catch {
        // ignore
      }
      nameForm.setFieldsValue({ categoryId: subCat.categoryId, subCategoryId: record.subCategoryId, name: record.name, description: record.description, isActive: record.isActive });
    }
    setNameModalVisible(true);
  };

  const handleDeleteAssetName = async (id: number) => {
    if (!categoryPermissions.canDelete) { message.error('ليس لديك صلاحية لحذف أسماء الأصول'); return; }
    try {
      await assetNameApi.delete(id);
      message.success('تم حذف اسم الأصل بنجاح');
      fetchAllAssetNames();
    } catch {
      message.error('فشل حذف اسم الأصل');
    }
  };

  const handleSubmitAssetName = async (values: CreateAssetNameDto & { isActive?: boolean }) => {
    try {
      if (editingAssetName) {
        await assetNameApi.update(editingAssetName.id, {
          id: editingAssetName.id,
          name: values.name,
          description: values.description,
          subCategoryId: values.subCategoryId,
          isActive: values.isActive !== undefined ? values.isActive : editingAssetName.isActive,
        });
        message.success('تم تحديث اسم الأصل بنجاح');
      } else {
        await assetNameApi.create({ name: values.name, description: values.description, subCategoryId: values.subCategoryId });
        message.success('تم إضافة اسم الأصل بنجاح');
      }
      setNameModalVisible(false);
      fetchAllAssetNames();
    } catch {
      message.error(editingAssetName ? 'فشل تحديث اسم الأصل' : 'فشل إضافة اسم الأصل');
    }
  };

  // ---- Columns ----

  const categoryColumns = [
    { title: 'الاسم', dataIndex: 'name', key: 'name' },
    { title: 'الرمز', dataIndex: 'code', key: 'code' },
    { title: 'الوصف', dataIndex: 'description', key: 'description' },
    {
      title: 'نشط', dataIndex: 'isActive', key: 'isActive',
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'نشط' : 'غير نشط'}</Tag>,
    },
    {
      title: 'الإجراءات', key: 'actions',
      render: (_: unknown, record: AssetCategory) => (
        <Space>
          {categoryPermissions.canUpdate && (
            <Button type="link" icon={<EditOutlined />} onClick={() => handleEditCategory(record)}>تعديل</Button>
          )}
          {categoryPermissions.canDelete && (
            <Popconfirm title="هل أنت متأكد من حذف هذه الفئة؟" onConfirm={() => handleDeleteCategory(record.id)} okText="نعم" cancelText="لا">
              <Button type="link" danger icon={<DeleteOutlined />}>حذف</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const subCategoryColumns = [
    { title: 'الاسم', dataIndex: 'name', key: 'name' },
    { title: 'الرمز', dataIndex: 'code', key: 'code' },
    { title: 'الفئة الرئيسية', dataIndex: 'categoryName', key: 'categoryName' },
    { title: 'الوصف', dataIndex: 'description', key: 'description' },
    {
      title: 'نشط', dataIndex: 'isActive', key: 'isActive',
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'نشط' : 'غير نشط'}</Tag>,
    },
    {
      title: 'الإجراءات', key: 'actions',
      render: (_: unknown, record: SubCategory) => (
        <Space>
          {categoryPermissions.canUpdate && (
            <Button type="link" icon={<EditOutlined />} onClick={() => handleEditSubCategory(record)}>تعديل</Button>
          )}
          {categoryPermissions.canDelete && (
            <Popconfirm title="هل أنت متأكد من حذف هذه الفئة الفرعية؟" onConfirm={() => handleDeleteSubCategory(record.id)} okText="نعم" cancelText="لا">
              <Button type="link" danger icon={<DeleteOutlined />}>حذف</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const assetNameColumns = [
    { title: 'اسم الأصل', dataIndex: 'name', key: 'name' },
    { title: 'الرمز', dataIndex: 'code', key: 'code' },
    { title: 'الفئة الرئيسية', dataIndex: 'categoryName', key: 'categoryName' },
    { title: 'الفئة الفرعية', dataIndex: 'subCategoryName', key: 'subCategoryName' },
    { title: 'الوصف', dataIndex: 'description', key: 'description' },
    {
      title: 'نشط', dataIndex: 'isActive', key: 'isActive',
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'نشط' : 'غير نشط'}</Tag>,
    },
    {
      title: 'الإجراءات', key: 'actions',
      render: (_: unknown, record: AssetName) => (
        <Space>
          {categoryPermissions.canUpdate && (
            <Button type="link" icon={<EditOutlined />} onClick={() => handleEditAssetName(record)}>تعديل</Button>
          )}
          {categoryPermissions.canDelete && (
            <Popconfirm title="هل أنت متأكد من حذف اسم الأصل هذا؟" onConfirm={() => handleDeleteAssetName(record.id)} okText="نعم" cancelText="لا">
              <Button type="link" danger icon={<DeleteOutlined />}>حذف</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 24]}>
        {/* الفئات الرئيسية */}
        <Col span={24}>
          <h3>الفئات الرئيسية</h3>
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            {categoryPermissions.canCreate && (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCategory}>إضافة فئة</Button>
            )}
          </div>
          <Table columns={categoryColumns} dataSource={categories} rowKey="id" loading={loading} pagination={{ pageSize: 5 }} />
        </Col>

        {/* الفئات الفرعية */}
        <Col span={24}>
          <h3>الفئات الفرعية</h3>
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            {categoryPermissions.canCreate && (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSubCategory}>إضافة فئة فرعية</Button>
            )}
          </div>
          <Table columns={subCategoryColumns} dataSource={subCategories} rowKey="id" loading={loading} pagination={{ pageSize: 5 }} />
        </Col>

        {/* أسماء الأصول */}
        <Col span={24}>
          <h3>أسماء الأصول</h3>
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            {categoryPermissions.canCreate && (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddAssetName}>إضافة اسم أصل</Button>
            )}
          </div>
          <Table columns={assetNameColumns} dataSource={assetNames} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
        </Col>
      </Row>

      {/* Modal: الفئة الرئيسية */}
      <Modal title={editingCategory ? 'تعديل الفئة' : 'إضافة فئة'} open={modalVisible} onCancel={() => setModalVisible(false)} onOk={() => form.submit()} width={600}>
        <Form form={form} layout="vertical" onFinish={handleSubmitCategory}>
          <Form.Item name="name" label="اسم الفئة" rules={[{ required: true, message: 'يرجى إدخال اسم الفئة' }]}>
            <Input placeholder="مثال: أجهزة حاسوب، أثاث مكتبي" />
          </Form.Item>
          <Form.Item name="description" label="الوصف">
            <Input.TextArea rows={3} placeholder="وصف الفئة (اختياري)" />
          </Form.Item>
          <Form.Item name="color" label="اللون">
            <Input type="color" />
          </Form.Item>
          {editingCategory && (
            <Form.Item name="isActive" label="نشط" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Modal: الفئة الفرعية */}
      <Modal title={editingSubCategory ? 'تعديل الفئة الفرعية' : 'إضافة فئة فرعية'} open={subModalVisible} onCancel={() => setSubModalVisible(false)} onOk={() => subForm.submit()} width={600}>
        <Form form={subForm} layout="vertical" onFinish={handleSubmitSubCategory}>
          <Form.Item name="categoryId" label="الفئة الرئيسية" rules={[{ required: true, message: 'يرجى اختيار الفئة الرئيسية' }]}>
            <Select placeholder="اختر الفئة الرئيسية" showSearch optionFilterProp="children">
              {categories.map(cat => <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="name" label="اسم الفئة الفرعية" rules={[{ required: true, message: 'يرجى إدخال اسم الفئة الفرعية' }]}>
            <Input placeholder="مثال: أجهزة لابتوب، مكاتب خشبية" />
          </Form.Item>
          <Form.Item name="description" label="الوصف">
            <Input.TextArea rows={3} placeholder="وصف الفئة الفرعية (اختياري)" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal: اسم الأصل */}
      <Modal title={editingAssetName ? 'تعديل اسم الأصل' : 'إضافة اسم أصل'} open={nameModalVisible} onCancel={() => setNameModalVisible(false)} onOk={() => nameForm.submit()} width={600}>
        <Form form={nameForm} layout="vertical" onFinish={handleSubmitAssetName}>
          <Form.Item name="categoryId" label="الفئة الرئيسية" rules={[{ required: true, message: 'يرجى اختيار الفئة الرئيسية' }]}>
            <Select placeholder="اختر الفئة الرئيسية" showSearch optionFilterProp="children" onChange={handleCategoryChangeForNameModal}>
              {categories.map(cat => <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="subCategoryId" label="الفئة الفرعية" rules={[{ required: true, message: 'يرجى اختيار الفئة الفرعية' }]}>
            <Select placeholder="اختر الفئة الفرعية" showSearch optionFilterProp="children" disabled={subCategoriesForNameModal.length === 0}>
              {subCategoriesForNameModal.map(sub => <Select.Option key={sub.id} value={sub.id}>{sub.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="name" label="اسم الأصل" rules={[{ required: true, message: 'يرجى إدخال اسم الأصل' }]}>
            <Input placeholder="مثال: كرسي مكتب، طاولة اجتماعات" />
          </Form.Item>
          <Form.Item name="description" label="الوصف">
            <Input.TextArea rows={3} placeholder="وصف اسم الأصل (اختياري)" />
          </Form.Item>
          {editingAssetName && (
            <Form.Item name="isActive" label="نشط" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
