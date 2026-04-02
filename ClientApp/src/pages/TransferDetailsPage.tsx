import { useState, useEffect } from 'react';
import { Card, Descriptions, Spin, Button, Space, Tag, Typography, message, Alert } from 'antd';
import { ArrowLeftOutlined, SwapOutlined, EyeOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { transferApi, type Transfer } from '../api/transfer.api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// Helper function to translate transfer reasons
const getReasonInArabic = (reason: string | undefined): string => {
  if (!reason) return 'لم يتم توفير سبب';
  
  const translations: { [key: string]: string } = {
    'Employee Request': 'طلب موظف',
    'Transfer Request': 'طلب نقل',
    'Relocation': 'إعادة توزيع',
    'Department Reorganization': 'إعادة تنظيم الأقسام',
    'Equipment Upgrade': 'ترقية المعدات',
    'Maintenance': 'صيانة',
    'End of Project': 'انتهاء المشروع',
    'Employee Termination': 'إنهاء خدمة موظف',
    'New Assignment': 'تكليف جديد',
    'Temporary Loan': 'إعارة مؤقتة',
    'Other': 'أخرى'
  };
  
  return translations[reason] || reason;
};

// Helper function to format location details
const formatLocationDetails = (locationDetails: any, fallbackText: string = 'غير معروف'): string[] => {
  if (!locationDetails) return [fallbackText];

  const parts: string[] = [];
  
  // إضافة تفاصيل الموقع بترتيب منطقي
  if (locationDetails.employeeName) {
    parts.push(`👤 موظف: ${locationDetails.employeeName}`);
  }
  if (locationDetails.departmentName) {
    parts.push(`🏢 دائرة: ${locationDetails.departmentName}`);
  }
  if (locationDetails.sectionName) {
    parts.push(`📋 قسم: ${locationDetails.sectionName}`);
  }
  if (locationDetails.warehouseName) {
    parts.push(`🏪 مستودع: ${locationDetails.warehouseName}`);
  }

  return parts.length > 0 ? parts : [fallbackText];
};

export default function TransferDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTransfer(parseInt(id));
    }
  }, [id]);

  const fetchTransfer = async (transferId: number) => {
    setLoading(true);
    try {
      const response = await transferApi.getById(transferId);
      if (response.data.success && response.data.data) {
        setTransfer(response.data.data);
      } else {
        message.error('لم يتم العثور على النقل');
        navigate('/transfers');
      }
    } catch (error) {
      console.error('Failed to load transfer:', error);
      message.error('فشل تحميل تفاصيل النقل');
      navigate('/transfers');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return dayjs(date).format('DD/MM/YYYY HH:mm');
  };

  const formatDateOnly = (date: string) => {
    return dayjs(date).format('DD/MM/YYYY');
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  if (!transfer) {
    return (
      <MainLayout>
        <Card>
          <div style={{ textAlign: 'center', padding: 50 }}>
            <Text type="secondary">لم يتم العثور على النقل</Text>
          </div>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/transfers')}>
              العودة لعمليات النقل
            </Button>
            <Button 
              type="primary" 
              icon={<EyeOutlined />} 
              onClick={() => navigate(`/assets/${transfer.assetId}`)}
            >
              عرض تفاصيل الأصل
            </Button>
          </Space>
        </Card>

        <Card>
          <Title level={3}>
            <SwapOutlined /> تفاصيل النقل
            <Tag color="green" style={{ marginLeft: 16, fontSize: '14px' }}>
              مكتمل
            </Tag>
          </Title>
          
          <Alert
            message="ملخص النقل"
            description={
              <div>
                <Text strong>{transfer.assetName}</Text> تم نقله من{' '}
                <Tag color="orange">{transfer.fromLocation || 'غير معروف'}</Tag> إلى{' '}
                <Tag color="green">{transfer.toLocation || 'غير معروف'}</Tag> في{' '}
                <Text strong>{formatDateOnly(transfer.transferDate)}</Text>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Descriptions
            title="معلومات النقل"
            bordered
            column={2}
            size="middle"
          >
            <Descriptions.Item label="رقم النقل" span={1}>
              <Text strong>#{transfer.id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="تاريخ النقل" span={1}>
              <Text strong>{formatDateOnly(transfer.transferDate)}</Text>
            </Descriptions.Item>
            
            <Descriptions.Item label="اسم الأصل" span={1}>
              <Text strong>{transfer.assetName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="الرقم التسلسلي" span={1}>
              <Text code>{transfer.assetSerialNumber}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="من موقع" span={2}>
              {transfer.fromLocationDetails ? (
                <Space direction="vertical" size="small">
                  {formatLocationDetails(transfer.fromLocationDetails).map((detail: string, index: number) => (
                    <Tag key={index} color="orange" style={{ fontSize: '14px', marginBottom: '4px' }}>
                      {detail}
                    </Tag>
                  ))}
                </Space>
              ) : (
                <Text type="secondary">غير معروف</Text>
              )}
            </Descriptions.Item>
            
            <Descriptions.Item label="إلى موقع" span={2}>
              {transfer.toLocationDetails ? (
                <Space direction="vertical" size="small">
                  {formatLocationDetails(transfer.toLocationDetails).map((detail: string, index: number) => (
                    <Tag key={index} color="green" style={{ fontSize: '14px', marginBottom: '4px' }}>
                      {detail}
                    </Tag>
                  ))}
                </Space>
              ) : (
                <Text type="secondary">غير معروف</Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="سبب النقل" span={2}>
              {transfer.reason ? (
                <Tag color="blue" style={{ fontSize: '14px' }}>
                  {getReasonInArabic(transfer.reason)}
                </Tag>
              ) : (
                <Text type="secondary">لم يتم توفير سبب</Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="ملاحظات" span={2}>
              {transfer.notes ? (
                <Text>{transfer.notes}</Text>
              ) : (
                <Text type="secondary">لا توجد ملاحظات إضافية</Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="نفذه" span={1}>
              <Text strong>{transfer.performedBy}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="تاريخ الإنشاء" span={1}>
              <Text>{formatDate(transfer.createdAt)}</Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="الجدول الزمني للنقل" size="small">
          <div style={{ padding: '16px 0' }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div 
                  style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    backgroundColor: '#52c41a' 
                  }} 
                />
                <div>
                  <Text strong>تم إكمال النقل</Text>
                  <br />
                  <Text type="secondary">
                    {formatDate(transfer.createdAt)} بواسطة {transfer.performedBy}
                  </Text>
                </div>
              </div>
              
              <div style={{ marginLeft: '6px', borderLeft: '2px solid #f0f0f0', paddingLeft: '18px', minHeight: '40px' }}>
                <Text type="secondary">
                  تم تحديث موقع الأصل بنجاح. الأصل متاح الآن في الموقع الجديد.
                </Text>
              </div>
            </Space>
          </div>
        </Card>
      </Space>
    </MainLayout>
  );
}