import { useState, useEffect } from 'react';
import {
  Modal, Form, Input, DatePicker, Select, InputNumber, Switch, 
  Row, Col, Space, Button, message, Divider
} from 'antd';
import type { FormInstance } from 'antd';
import { ToolOutlined, CalendarOutlined } from '@ant-design/icons';
import { maintenanceApi, CreateMaintenanceData, MaintenanceType } from '../api/maintenance.api';
import dayjs from 'dayjs';

interface MaintenanceModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  assetId?: number;
  assetName?: string;
}

interface FormValues {
  assetId?: number;
  maintenanceType: number;
  maintenanceDate: dayjs.Dayjs;
  description: string;
  cost?: number;
  currency?: string;
  performedBy?: string;
  technicianName?: string;
  companyName?: string;
  scheduledDate?: dayjs.Dayjs;
  nextMaintenanceDate?: dayjs.Dayjs;
  warrantyUsed?: boolean;
  notes?: string;
}

export default function MaintenanceModal({
  visible,
  onCancel,
  onSuccess,
  assetId,
  assetName
}: MaintenanceModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [maintenanceTypes, setMaintenanceTypes] = useState<MaintenanceType[]>([]);

  console.log('?? MaintenanceModal opened for asset:', { assetId, assetName });

  useEffect(() => {
    if (visible) {
      fetchMaintenanceTypes();
      
      // Set default values
      form.setFieldsValue({
        assetId: assetId,
        maintenanceDate: dayjs(),
        currency: 'ILS',
        warrantyUsed: false,
        maintenanceType: 1, // Preventive by default
      });
    } else {
      form.resetFields();
    }
  }, [visible, assetId, form]);

  const fetchMaintenanceTypes = async () => {
    try {
      console.log('?? Loading maintenance types...');
      const response = await maintenanceApi.getMaintenanceTypes();
      if (response.data.success && response.data.data) {
        setMaintenanceTypes(response.data.data);
        console.log('? Maintenance types loaded:', response.data.data);
      }
    } catch (error) {
      console.error('? Failed to load maintenance types:', error);
      // Provide fallback maintenance types
      setMaintenanceTypes([
        { value: 1, label: 'وقائية' },
        { value: 2, label: 'تصحيحية' },
        { value: 3, label: 'طارئة' },
        { value: 4, label: 'دورية' },
        { value: 5, label: 'تطوير' }
      ]);
      console.log('?? Using fallback maintenance types');
    }
  };

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    console.log('?? Submitting maintenance data:', values);

    try {
      const maintenanceData: CreateMaintenanceData = {
        assetId: assetId || values.assetId!,
        maintenanceType: values.maintenanceType,
        maintenanceDate: values.maintenanceDate.toISOString(),
        description: values.description,
        cost: values.cost,
        currency: values.currency || 'ILS',
        performedBy: values.performedBy,
        technicianName: values.technicianName,
        companyName: values.companyName,
        scheduledDate: values.scheduledDate?.toISOString(),
        nextMaintenanceDate: values.nextMaintenanceDate?.toISOString(),
        warrantyUsed: values.warrantyUsed || false,
        notes: values.notes,
      };

      console.log('?? Sending maintenance data to API:', maintenanceData);

      const response = await maintenanceApi.create(maintenanceData);
      console.log('? Maintenance created successfully:', response.data);

      message.success('تم إنشاء سجل الصيانة بنجاح');
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      console.error('❌❌ Failed to create maintenance:', error);
      
      // Enhanced error logging for debugging
      console.error('🔍 [DEBUG] Full error object:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers?.Authorization ? 'Bearer [PRESENT]' : 'Missing'
        }
      });

      // Store maintenanceData for debugging
      const debugMaintenanceData: CreateMaintenanceData = {
        assetId: assetId || values.assetId!,
        maintenanceType: values.maintenanceType,
        maintenanceDate: values.maintenanceDate.toISOString(),
        description: values.description,
        cost: values.cost,
        currency: values.currency || 'ILS',
        performedBy: values.performedBy,
        technicianName: values.technicianName,
        companyName: values.companyName,
        scheduledDate: values.scheduledDate?.toISOString(),
        nextMaintenanceDate: values.nextMaintenanceDate?.toISOString(),
        warrantyUsed: values.warrantyUsed || false,
        notes: values.notes,
      };

      // Extract detailed error message
      let errorMessage = 'حدث خطأ غير متوقع';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        console.error('🔍 [DEBUG] Server error message:', error.response.data.message);
      } else if (error.response?.status === 500) {
        errorMessage = 'خطأ في الخادم الداخلي - يرجى مراجعة سجلات النظام';
        console.error('🔍 [DEBUG] 500 Internal Server Error - Check backend logs');
      } else if (error.response?.status === 401) {
        errorMessage = 'فشل في المصادقة - يرجى تسجيل الدخول مرة أخرى';
        console.error('🔍 [DEBUG] 401 Unauthorized - Authentication failed');
      } else if (error.response?.status === 403) {
        errorMessage = 'ليس لديك صلاحية لإنشاء سجلات الصيانة';
        console.error('🔍 [DEBUG] 403 Forbidden - Permission denied');
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Show user-friendly error message
      message.error(`فشل في إنشاء الصيانة: ${errorMessage}`);
      
      // Additional debug info for 500 errors
      if (error.response?.status === 500) {
        console.error('🔍 [DEBUG] Maintenance data that caused 500 error:', debugMaintenanceData);
        console.error('🔍 [DEBUG] Check backend console for detailed error logs with [MAINTENANCE] prefix');
      }
    } finally {
      setLoading(false);
    }
  };

  const getMaintenanceTypeColor = (type: number): string => {
    switch (type) {
      case 1: return '#1677ff'; // Blue for Preventive (وقائية)
      case 2: return '#fa8c16'; // Orange for Corrective (تصحيحية)  
      case 3: return '#f5222d'; // Red for Emergency (طارئة)
      case 4: return '#52c41a'; // Green for Routine (دورية)
      case 5: return '#722ed1'; // Purple for Upgrade (تطوير)
      default: return '#000';
    }
  };

  return (
    <Modal
      title={
        <Space>
          <ToolOutlined />
          <span>جدولة صيانة</span>
          {assetName && <span style={{ color: '#666' }}>- {assetName}</span>}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={[16, 0]}>
          {/* معلومات أساسية */}
          <Col span={24}>
            <Divider>المعلومات الأساسية</Divider>
          </Col>

          <Col span={12}>
            <Form.Item
              label="نوع الصيانة"
              name="maintenanceType"
              rules={[{ required: true, message: 'الرجاء اختيار نوع الصيانة' }]}
            >
              <Select 
                placeholder="اختر نوع الصيانة"
                optionRender={(option) => (
                  <div style={{ 
                    padding: '4px 8px',
                    borderLeft: `4px solid ${getMaintenanceTypeColor(option.value as number)}`,
                    backgroundColor: `${getMaintenanceTypeColor(option.value as number)}10`
                  }}>
                    {option.label}
                  </div>
                )}
              >
                {maintenanceTypes.map(type => (
                  <Select.Option key={type.value} value={type.value}>
                    {type.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="تاريخ الصيانة"
              name="maintenanceDate"
              rules={[{ required: true, message: 'الرجاء اختيار تاريخ الصيانة' }]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="اختر التاريخ"
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="الوصف"
              name="description"
              rules={[
                { required: true, message: 'الرجاء إدخال الوصف' },
                { max: 500, message: 'لا يمكن أن يتجاوز الوصف 500 حرف' }
              ]}
            >
              <Input.TextArea
                rows={3}
                placeholder="صف أعمال الصيانة التي سيتم إجراؤها..."
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Col>

          {/* معلومات التكلفة */}
          <Col span={24}>
            <Divider>معلومات التكلفة</Divider>
          </Col>

          <Col span={12}>
            <Form.Item
              label="التكلفة"
              name="cost"
              rules={[{ type: 'number', min: 0, message: 'يجب أن تكون التكلفة موجبة' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="أدخل التكلفة"
                min={0}
                precision={2}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="العملة"
              name="currency"
            >
              <Select defaultValue="ILS">
                <Select.Option value="ILS">شيكل إسرائيلي (ILS)</Select.Option>
                <Select.Option value="USD">دولار أمريكي (USD)</Select.Option>
                <Select.Option value="EUR">يورو (EUR)</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          {/* معلومات الكادر */}
          <Col span={24}>
            <Divider>معلومات الكادر</Divider>
          </Col>

          <Col span={8}>
            <Form.Item
              label="نُفذت بواسطة"
              name="performedBy"
            >
              <Input placeholder="القسم/الشخص" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="اسم الفني"
              name="technicianName"
            >
              <Input placeholder="اسم الفني" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="اسم الشركة"
              name="companyName"
            >
              <Input placeholder="شركة الخدمة" />
            </Form.Item>
          </Col>

          {/* معلومات الجدولة */}
          <Col span={24}>
            <Divider>معلومات الجدولة</Divider>
          </Col>

          <Col span={12}>
            <Form.Item
              label="التاريخ المجدول"
              name="scheduledDate"
            >
              <DatePicker 
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="إذا كان مختلفاً عن تاريخ الصيانة"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="موعد الصيانة القادمة"
              name="nextMaintenanceDate"
            >
              <DatePicker 
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="جدولة الصيانة القادمة"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="تم استخدام الضمان"
              name="warrantyUsed"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>

          {/* ملاحظات إضافية */}
          <Col span={24}>
            <Form.Item
              label="ملاحظات إضافية"
              name="notes"
              rules={[{ max: 1000, message: 'لا يمكن أن تتجاوز الملاحظات 1000 حرف' }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="ملاحظات أو تعليقات إضافية..."
                showCount
                maxLength={1000}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* أزرار الإرسال */}
        <Row justify="end" style={{ marginTop: 16 }}>
          <Space>
            <Button onClick={onCancel}>
              إلغاء
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<CalendarOutlined />}
            >
              جدولة الصيانة
            </Button>
          </Space>
        </Row>
      </Form>
    </Modal>
  );
}