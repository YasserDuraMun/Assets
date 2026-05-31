import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm, Tag, Row, Col, Select, Switch, Empty, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, RightOutlined } from '@ant-design/icons';
import usePermissions from '../../hooks/usePermissions';
import { categoryApi } from '../../api/category.api';
import { subCategoryApi, assetNameApi, type SubCategory, type CreateSubCategoryDto, type AssetName, type CreateAssetNameDto } from '../../api/subcategory.api';
import type { AssetCategory } from '../../types';

const { Text } = Typography;

export default function CategoriesPage() {
  const { getScreenPermissions } = usePermissions();
  const categoryPermissions = getScreenPermissions('Categories');

  // Data
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [assetNames, setAssetNames] = useState<AssetName[]>([]);
  const [loading, setLoading] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [nameLoading, setNameLoading] = useState(false);

  // Drill-down selection
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);

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

  const fetchSubCategories = async (categoryId: number) => {
    setSubLoading(true);
    try {
      const response = await subCategoryApi.getByCategoryId(categoryId);
      if (response.data.success && response.data.data) {
        setSubCategories(response.data.data);
      } else {
        setSubCategories([]);
      }
    } catch {
      setSubCategories([]);
    } finally {
      setSubLoading(false);
    }
  };

  const fetchAssetNames = async (subCategoryId: number) => {
    setNameLoading(true);
    try {
      const response = await assetNameApi.getBySubCategoryId(subCategoryId);
      if (response.data.success && response.data.data) {
        setAssetNames(response.data.data);
      } else {
        setAssetNames([]);
      }
    } catch {
      setAssetNames([]);
    } finally {
      setNameLoading(false);
    }
  };

  // ---- Drill-down handlers ----

  const handleSelectCategory = (record: AssetCategory) => {
    setSelectedCategoryId(record.id);
    setSelectedCategory(record);
    setSelectedSubCategoryId(null);
    setSelectedSubCategory(null);
    setAssetNames([]);
    fetchSubCategories(record.id);
  };

  const handleSelectSubCategory = (record: SubCategory) => {
    setSelectedSubCategoryId(record.id);
    setSelectedSubCategory(record);
    fetchAssetNames(record.id);
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
      if (selectedCategoryId === id) {
        setSelectedCategoryId(null);
        setSelectedCategory(null);
        setSelectedSubCategoryId(null);
        setSelectedSubCategory(null);
        setSubCategories([]);
        setAssetNames([]);
      }
      fetchCategories();
    } catch {
      message.error('فشل حذف الفئة');
    }
  };

  const handleSubmitCategory = async (values: Partial<AssetCategory>) => {
    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, { ...values, id: editingCategory.id });
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
    // Pre-fill the selected category
    if (selectedCategoryId) {
      subForm.setFieldValue('categoryId', selectedCategoryId);
    }
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
      if (selectedSubCategoryId === id) {
        setSelectedSubCategoryId(null);
        setSelectedSubCategory(null);
        setAssetNames([]);
      }
      if (selectedCategoryId) fetchSubCategories(selectedCategoryId);
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
      if (selectedCategoryId) fetchSubCategories(selectedCategoryId);
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
    // Pre-fill category and subcategory from current selection
    if (selectedCategoryId) {
      nameForm.setFieldValue('categoryId', selectedCategoryId);
      setSubCategoriesForNameModal(subCategories);
      if (selectedSubCategoryId) {
        nameForm.setFieldValue('subCategoryId', selectedSubCategoryId);
      }
    } else {
      setSubCategoriesForNameModal([]);
    }
    setNameModalVisible(true);
  };

  const handleEditAssetName = async (record: AssetName) => {
    if (!categoryPermissions.canUpdate) { message.error('ليس لديك صلاحية لتعديل أسماء الأصول'); return; }
    setEditingAssetName(record);
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
      nameForm.setFieldsValue({
        categoryId: subCat.categoryId,
        subCategoryId: record.subCategoryId,
        name: record.name,
        description: record.description,
        isActive: record.isActive,
      });
    }
    setNameModalVisible(true);
  };

  const handleDeleteAssetName = async (id: number) => {
    if (!categoryPermissions.canDelete) { message.error('ليس لديك صلاحية لحذف أسماء الأصول'); return; }
    try {
      await assetNameApi.delete(id);
      message.success('تم حذف اسم الأصل بنجاح');
      if (selectedSubCategoryId) fetchAssetNames(selectedSubCategoryId);
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
      if (selectedSubCategoryId) fetchAssetNames(selectedSubCategoryId);
    } catch {
      message.error(editingAssetName ? 'فشل تحديث اسم الأصل' : 'فشل إضافة اسم الأصل');
    }
  };

  // ---- Columns ----

  const categoryColumns = [
    {
      title: 'الفئة الرئيسية',
      key: 'name',
      render: (_: unknown, record: AssetCategory) => (
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space direction="vertical" size={0}>
            <Tag color={record.isActive ? 'blue' : 'default'}>{record.name}</Tag>
            <Text type="secondary" style={{ fontSize: 11, paddingRight: 4 }}>{record.code}</Text>
          </Space>
          {selectedCategoryId === record.id && <RightOutlined style={{ color: '#1677ff' }} />}
        </Space>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_: unknown, record: AssetCategory) => (
        <Space size={0}>
          {categoryPermissions.canUpdate && (
            <Button type="text" size="small" icon={<EditOutlined />} onClick={e => { e.stopPropagation(); handleEditCategory(record); }} />
          )}
          {categoryPermissions.canDelete && (
            <Popconfirm title="هل أنت متأكد من حذف هذه الفئة؟" onConfirm={e => { e?.stopPropagation(); handleDeleteCategory(record.id); }} okText="نعم" cancelText="لا">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={e => e.stopPropagation()} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const subCategoryColumns = [
    {
      title: 'الفئة الفرعية',
      key: 'name',
      render: (_: unknown, record: SubCategory) => (
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space direction="vertical" size={0}>
            <Tag color={record.isActive ? 'green' : 'default'}>{record.name}</Tag>
            <Text type="secondary" style={{ fontSize: 11, paddingRight: 4 }}>{record.code}</Text>
          </Space>
          {selectedSubCategoryId === record.id && <RightOutlined style={{ color: '#1677ff' }} />}
        </Space>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_: unknown, record: SubCategory) => (
        <Space size={0}>
          {categoryPermissions.canUpdate && (
            <Button type="text" size="small" icon={<EditOutlined />} onClick={e => { e.stopPropagation(); handleEditSubCategory(record); }} />
          )}
          {categoryPermissions.canDelete && (
            <Popconfirm title="هل أنت متأكد من حذف هذه الفئة الفرعية؟" onConfirm={() => handleDeleteSubCategory(record.id)} okText="نعم" cancelText="لا">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={e => e.stopPropagation()} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const assetNameColumns = [
    {
      title: 'اسم المادة',
      key: 'name',
      render: (_: unknown, record: AssetName) => (
        <Space direction="vertical" size={0}>
          <Tag color={record.isActive ? 'purple' : 'default'}>{record.name}</Tag>
          <Text type="secondary" style={{ fontSize: 11, paddingRight: 4 }}>{record.code}</Text>
        </Space>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_: unknown, record: AssetName) => (
        <Space size={0}>
          {categoryPermissions.canUpdate && (
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEditAssetName(record)} />
          )}
          {categoryPermissions.canDelete && (
            <Popconfirm title="هل أنت متأكد من حذف اسم الأصل هذا؟" onConfirm={() => handleDeleteAssetName(record.id)} okText="نعم" cancelText="لا">
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

        {/* العمود 1: الفئات الرئيسية */}
        <Col span={8} style={colStyle}>
          <div style={{ padding: '12px 0 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', marginBottom: 8 }}>
            <Text strong>الفئات الرئيسية</Text>
            {categoryPermissions.canCreate && (
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAddCategory}>إضافة</Button>
            )}
          </div>
          <Table
            columns={categoryColumns}
            dataSource={categories}
            rowKey="id"
            loading={loading}
            pagination={false}
            size="small"
            showHeader={false}
            onRow={record => ({
              onClick: () => handleSelectCategory(record),
              style: {
                cursor: 'pointer',
                background: selectedCategoryId === record.id ? '#e6f4ff' : undefined,
              },
            })}
            scroll={{ y: 420 }}
          />
        </Col>

        {/* العمود 2: الفئات الفرعية */}
        <Col span={8} style={colStyle}>
          <div style={{ padding: '12px 0 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', marginBottom: 8 }}>
            <Text strong>
              الفئات الفرعية
              {selectedCategory && <Text type="secondary" style={{ fontSize: 12, marginRight: 6 }}>({selectedCategory.name})</Text>}
            </Text>
            {categoryPermissions.canCreate && (
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAddSubCategory} disabled={!selectedCategoryId}>إضافة</Button>
            )}
          </div>
          {!selectedCategoryId ? (
            <Empty description="اختر فئة رئيسية أولاً" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ marginTop: 60 }} />
          ) : (
            <Table
              columns={subCategoryColumns}
              dataSource={subCategories}
              rowKey="id"
              loading={subLoading}
              pagination={false}
              size="small"
              showHeader={false}
              locale={{ emptyText: 'لا توجد فئات فرعية' }}
              onRow={record => ({
                onClick: () => handleSelectSubCategory(record),
                style: {
                  cursor: 'pointer',
                  background: selectedSubCategoryId === record.id ? '#e6f4ff' : undefined,
                },
              })}
              scroll={{ y: 420 }}
            />
          )}
        </Col>

        {/* العمود 3: أسماء المواد */}
        <Col span={8} style={{ ...colStyle, borderRight: 'none' }}>
          <div style={{ padding: '12px 0 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', marginBottom: 8 }}>
            <Text strong>
              أسماء المواد
              {selectedSubCategory && <Text type="secondary" style={{ fontSize: 12, marginRight: 6 }}>({selectedSubCategory.name})</Text>}
            </Text>
            {categoryPermissions.canCreate && (
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAddAssetName} disabled={!selectedSubCategoryId}>إضافة</Button>
            )}
          </div>
          {!selectedSubCategoryId ? (
            <Empty description="اختر فئة فرعية أولاً" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ marginTop: 60 }} />
          ) : (
            <Table
              columns={assetNameColumns}
              dataSource={assetNames}
              rowKey="id"
              loading={nameLoading}
              pagination={false}
              size="small"
              showHeader={false}
              locale={{ emptyText: 'لا توجد أسماء مواد' }}
              scroll={{ y: 420 }}
            />
          )}
        </Col>
      </Row>

      {/* Modal: الفئة الرئيسية */}
      <Modal title={editingCategory ? 'تعديل الفئة' : 'إضافة فئة'} open={modalVisible} onCancel={() => setModalVisible(false)} onOk={() => form.submit()} width={500}>
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
      <Modal title={editingSubCategory ? 'تعديل الفئة الفرعية' : 'إضافة فئة فرعية'} open={subModalVisible} onCancel={() => setSubModalVisible(false)} onOk={() => subForm.submit()} width={500}>
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

      {/* Modal: اسم المادة */}
      <Modal title={editingAssetName ? 'تعديل اسم المادة' : 'إضافة اسم مادة'} open={nameModalVisible} onCancel={() => setNameModalVisible(false)} onOk={() => nameForm.submit()} width={500}>
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
          <Form.Item name="name" label="اسم المادة" rules={[{ required: true, message: 'يرجى إدخال اسم المادة' }]}>
            <Input placeholder="مثال: كرسي مكتب، طاولة اجتماعات" />
          </Form.Item>
          <Form.Item name="description" label="الوصف">
            <Input.TextArea rows={3} placeholder="وصف المادة (اختياري)" />
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
