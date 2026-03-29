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
      
      // ????? fallback reasons ????????
      console.log('?? Using fallback disposal reasons...');
      const fallbackReasons = [
        { value: 1, label: 'Damaged' },
        { value: 2, label: 'Obsolete' },
        { value: 3, label: 'Lost' },
        { value: 4, label: 'Stolen' },
        { value: 5, label: 'EndOfLife' },
        { value: 6, label: 'Maintenance' },
        { value: 7, label: 'Replacement' },
        { value: 99, label: 'Other' }
      ];
      setDisposalReasons(fallbackReasons);
      
      message.error('Failed to load disposal options from server. Using default options.');
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
      message.success('Asset disposed successfully');
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      console.error('Failed to dispose asset:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Failed to dispose asset');
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
          Dispose Asset
        </span>
      }
      open={visible}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      okText="Dispose Asset"
      cancelText="Cancel"
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
          <h4 style={{ margin: 0, color: '#cf1322' }}>Asset to be Disposed:</h4>
          <p style={{ margin: '8px 0 0 0', fontSize: 16 }}>
            <strong>{asset.name}</strong> (S/N: {asset.serialNumber})
          </p>
          <p style={{ margin: '4px 0 0 0', color: '#666' }}>
            Category: {asset.categoryName} | Status: {asset.statusName}
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
            label="Disposal Date"
            rules={[{ required: true, message: 'Please select disposal date' }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              placeholder="Select disposal date"
            />
          </Form.Item>

          <Form.Item
            name="disposalReason"
            label="Disposal Reason"
            rules={[{ required: true, message: 'Please select disposal reason' }]}
          >
            <Select placeholder="Select disposal reason">
              {disposalReasons.map(reason => (
                <Select.Option key={reason.value} value={reason.value}>
                  {reason.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes & Details"
            rules={[{ required: true, message: 'Please provide disposal details' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Describe the reason for disposal, condition of asset, and any other relevant details..."
            />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
}