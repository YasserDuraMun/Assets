import { useState, useEffect } from 'react';
import { Modal, Form, Select, DatePicker, Input, message, Spin } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { disposalApi } from '../api/disposal.api';
import api from '../api/axios.config';
import type { Asset, CreateDisposalData, DisposalReason } from '../types';
import dayjs from 'dayjs';

interface DisposalModalProps {
  visible: boolean;
  asset?: Asset;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function DisposalModal({ visible, asset, onCancel, onSuccess }: DisposalModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [disposalReasons, setDisposalReasons] = useState<DisposalReason[]>([]);

  useEffect(() => {
    if (visible) {
      loadEnumData();
      form.setFieldsValue({
        disposalDate: dayjs(),
      });
    }
  }, [visible, form]);

  const loadEnumData = async () => {
    setDataLoading(true);
    try {
      console.log('?? Loading disposal reasons...');
      console.log('API Base URL:', import.meta.env.VITE_API_URL || 'http://localhost:5002');
      
      // Test if controller is working
      try {
        const testResponse = await api.get('/disposals/test');
        console.log('? Controller test successful:', testResponse.data);
      } catch (testError) {
        console.error('? Controller test failed:', testError);
      }

      const reasonsRes = await disposalApi.getDisposalReasons();
      console.log('?? Disposal reasons response:', reasonsRes);

      if (reasonsRes.data.success && reasonsRes.data.data) {
        setDisposalReasons(reasonsRes.data.data);
        console.log('? Disposal reasons loaded:', reasonsRes.data.data);
      } else {
        console.error('? Disposal reasons response not successful:', reasonsRes.data);
      }
    } catch (error) {
      console.error('?? Failed to load disposal enum data:', error);
      
      // استخدام أسباب احتياطية
      console.log('⚠️ Using fallback disposal reasons...');
      const fallbackReasons = [
        { value: 1, label: 'تالف/معطوب' },
        { value: 2, label: 'قديم/غير صالح للاستخدام' },
        { value: 3, label: 'مفقود' },
        { value: 4, label: 'مسروق' },
        { value: 5, label: 'انتهاء العمر الافتراضي' },
        { value: 6, label: 'صيانة وإصلاح شامل' },
        { value: 7, label: 'تم الاستبدال' },
        { value: 99, label: 'أخرى' }
      ];
      setDisposalReasons(fallbackReasons);
      
      message.error('فشل تحميل خيارات الاستبعاد من السيرفر. استخدام الخيارات الافتراضية.');
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!asset) return;

    setLoading(true);
    try {
      const disposalData: CreateDisposalData = {
        assetId: asset.id,
        disposalDate: values.disposalDate.toISOString(),
        disposalReason: values.disposalReason,
        notes: values.notes,
      };

      await disposalApi.create(disposalData);
      message.success('تم استبعاد الأصل بنجاح');
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      console.error('Failed to dispose asset:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('فشل في استبعاد الأصل');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <span>
          <DeleteOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
          استبعاد أصل
        </span>
      }
      open={visible}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      okText="استبعاد الأصل"
      cancelText="إلغاء"
      okButtonProps={{ 
        loading, 
        danger: true,
        disabled: dataLoading
      }}
      destroyOnClose
      width={600}
    >
      {asset && (
        <div style={{ 
          background: '#fff2f0', 
          border: '1px solid #ffccc7', 
          borderRadius: 6, 
          padding: 16, 
          marginBottom: 24 
        }}>
          <h4 style={{ margin: 0, color: '#cf1322' }}>الأصل المراد استبعاده:</h4>
          <p style={{ margin: '8px 0 0 0', fontSize: 16 }}>
            <strong>{asset.name}</strong> (الرقم التسلسلي: {asset.serialNumber})
          </p>
          <p style={{ margin: '4px 0 0 0', color: '#666' }}>
            الفئة: {asset.categoryName} | الحالة: {asset.statusName}
          </p>
        </div>
      )}

      <Spin spinning={dataLoading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="disposalDate"
            label="تاريخ الاستبعاد"
            rules={[{ required: true, message: 'الرجاء اختيار تاريخ الاستبعاد' }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              placeholder="اختر تاريخ الاستبعاد"
            />
          </Form.Item>

          <Form.Item
            name="disposalReason"
            label="سبب الاستبعاد"
            rules={[{ required: true, message: 'الرجاء اختيار سبب الاستبعاد' }]}
          >
            <Select placeholder="اختر سبب الاستبعاد">
              {disposalReasons.map(reason => (
                <Select.Option key={reason.value} value={reason.value}>
                  {reason.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="ملاحظات وتفاصيل"
            rules={[{ required: true, message: 'الرجاء تقديم تفاصيل الاستبعاد' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="اشرح سبب الاستبعاد، حالة الأصل، وأي تفاصيل أخرى ذات صلة..."
            />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
}