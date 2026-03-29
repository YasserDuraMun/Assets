import { useState, useEffect } from 'react';
import {
  Modal, Form, Input, DatePicker, Select, InputNumber, Switch, 
  Row, Col, Space, Button, message, Divider
} from 'antd';
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
        { value: 1, label: 'Preventive (????? ??????)' },
        { value: 2, label: 'Corrective (????? ???????)' },
        { value: 3, label: 'Emergency (????? ?????)' },
        { value: 4, label: 'Routine (????? ?????)' },
        { value: 5, label: 'Upgrade (????? ??????)' }
      ]);
      console.log('?? Using fallback maintenance types');
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    console.log('?? Submitting maintenance data:', values);

    try {
      const maintenanceData: CreateMaintenanceData = {
        assetId: assetId || values.assetId,
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

      message.success('Maintenance record created successfully');
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      console.error('?? Failed to create maintenance:', error);
      message.error(`Failed to create maintenance: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getMaintenanceTypeColor = (type: number): string => {
    switch (type) {
      case 1: return '#1677ff'; // Blue for Preventive (????? ??????)
      case 2: return '#fa8c16'; // Orange for Corrective (????? ???????)  
      case 3: return '#f5222d'; // Red for Emergency (????? ?????)
      case 4: return '#52c41a'; // Green for Routine (????? ?????)
      case 5: return '#722ed1'; // Purple for Upgrade (????? ??????)
      default: return '#000';
    }
  };

  return (
    <Modal
      title={
        <Space>
          <ToolOutlined />
          <span>Schedule Maintenance</span>
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
          {/* Basic Information */}
          <Col span={24}>
            <Divider orientation="left">Basic Information</Divider>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Maintenance Type"
              name="maintenanceType"
              rules={[{ required: true, message: 'Please select maintenance type' }]}
            >
              <Select 
                placeholder="Select maintenance type"
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
              label="Maintenance Date"
              name="maintenanceDate"
              rules={[{ required: true, message: 'Please select maintenance date' }]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="Select date"
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Description"
              name="description"
              rules={[
                { required: true, message: 'Please enter description' },
                { max: 500, message: 'Description cannot exceed 500 characters' }
              ]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Describe the maintenance work to be performed..."
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Col>

          {/* Cost Information */}
          <Col span={24}>
            <Divider orientation="left">Cost Information</Divider>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Cost"
              name="cost"
              rules={[{ type: 'number', min: 0, message: 'Cost must be positive' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Enter cost"
                min={0}
                precision={2}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => {
                  const parsed = value!.replace(/\$\s?|(,*)/g, '');
                  return parseFloat(parsed) || 0;
                }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Currency"
              name="currency"
            >
              <Select defaultValue="ILS">
                <Select.Option value="ILS">ILS (Israeli Shekel)</Select.Option>
                <Select.Option value="USD">USD (US Dollar)</Select.Option>
                <Select.Option value="EUR">EUR (Euro)</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Personnel Information */}
          <Col span={24}>
            <Divider orientation="left">Personnel Information</Divider>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Performed By"
              name="performedBy"
            >
              <Input placeholder="Department/Person" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Technician Name"
              name="technicianName"
            >
              <Input placeholder="Technician name" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Company Name"
              name="companyName"
            >
              <Input placeholder="Service company" />
            </Form.Item>
          </Col>

          {/* Scheduling Information */}
          <Col span={24}>
            <Divider orientation="left">Scheduling Information</Divider>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Scheduled Date"
              name="scheduledDate"
            >
              <DatePicker 
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="If different from maintenance date"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Next Maintenance Due"
              name="nextMaintenanceDate"
            >
              <DatePicker 
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="Schedule next maintenance"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Warranty Used"
              name="warrantyUsed"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>

          {/* Additional Notes */}
          <Col span={24}>
            <Form.Item
              label="Additional Notes"
              name="notes"
              rules={[{ max: 1000, message: 'Notes cannot exceed 1000 characters' }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Additional notes or comments..."
                showCount
                maxLength={1000}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Submit Buttons */}
        <Row justify="end" style={{ marginTop: 16 }}>
          <Space>
            <Button onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<CalendarOutlined />}
            >
              Schedule Maintenance
            </Button>
          </Space>
        </Row>
      </Form>
    </Modal>
  );
}