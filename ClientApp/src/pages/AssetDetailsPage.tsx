import { useState, useEffect } from 'react';
import { Card, Descriptions, Spin, Button, Space, Tag, Typography, Row, Col, message, Divider, Timeline, Modal, QRCode } from 'antd';
import { EditOutlined, ArrowLeftOutlined, QrcodeOutlined, PrinterOutlined, ToolOutlined } from '@ant-design/icons';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import MaintenanceModal from '../components/MaintenanceModal';
import { assetApi } from '../api/asset.api';
import type { Asset } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function AssetDetailsPage() {
const { id } = useParams<{ id: string }>();
const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [maintenanceModalVisible, setMaintenanceModalVisible] = useState(false);
  const [qrCodeModalVisible, setQrCodeModalVisible] = useState(false);
  const [printLabelModalVisible, setPrintLabelModalVisible] = useState(false);

  const includeDeleted = searchParams.get('includeDeleted') === 'true';

useEffect(() => {
  if (id) {
    fetchAsset(parseInt(id));
  }
}, [id]);

const fetchAsset = async (assetId: number) => {
  setLoading(true);
  try {
    console.log('?? Fetching asset with ID:', assetId, 'includeDeleted:', includeDeleted);
      
    const response = await assetApi.getById(assetId, includeDeleted);
    console.log('?? Asset API response:', response);
      
    if (response.data.success && response.data.data) {
      setAsset(response.data.data);
      console.log('? Asset loaded:', response.data.data);
    } else {
      message.error('لم يتم العثور على الأصل');
      navigate('/assets');
    }
  } catch (error) {
    console.error('? Failed to load asset:', error);
    message.error('فشل في تحميل تفاصيل الأصل');
    navigate('/assets');
  } finally {
    setLoading(false);
  }
};

  const getLocationDisplay = (asset: Asset) => {
    console.log('?? Asset location info:', {
      currentLocationType: asset.currentLocationType,
      currentEmployeeId: asset.currentEmployeeId,
      currentEmployeeName: asset.currentEmployeeName,
      currentWarehouseId: asset.currentWarehouseId,
      currentWarehouseName: asset.currentWarehouseName,
      currentDepartmentId: asset.currentDepartmentId,
      currentDepartmentName: asset.currentDepartmentName,
      currentSectionId: asset.currentSectionId,
      currentSectionName: asset.currentSectionName
    });

    // Convert number to string for comparison
    const locationType = typeof asset.currentLocationType === 'number' 
      ? {
          1: 'Warehouse',
          2: 'Employee', 
          3: 'Department',
          4: 'Section'
        }[asset.currentLocationType] || 'Unknown'
      : asset.currentLocationType;

    console.log('?? Resolved location type:', locationType);

    switch (locationType) {
      case 'Employee':
        return asset.currentEmployeeName ? (
          <Tag color="blue" icon={<span>👤</span>}>
            موظف: {asset.currentEmployeeName}
          </Tag>
        ) : (
          <Tag color="red">موظف: غير محدد</Tag>
        );
      case 'Warehouse':
        return asset.currentWarehouseName ? (
          <Tag color="green" icon={<span>🏢</span>}>
            مستودع: {asset.currentWarehouseName}
          </Tag>
        ) : (
          <Tag color="red">مستودع: غير محدد</Tag>
        );
      case 'Department':
        return asset.currentDepartmentName ? (
          <Tag color="orange" icon={<span>🏛️</span>}>
            قسم: {asset.currentDepartmentName}
          </Tag>
        ) : (
          <Tag color="red">قسم: غير محدد</Tag>
        );
      case 'Section':
        return asset.currentSectionName ? (
          <Tag color="purple" icon={<span>📍</span>}>
            شعبة: {asset.currentSectionName}
          </Tag>
        ) : (
          <Tag color="red">شعبة: غير محدد</Tag>
        );
      default:
        return <Tag color="default">موقع غير معروف (النوع: {asset.currentLocationType})</Tag>;
    }
  };

  const formatDate = (date: string | undefined) => {
    return date ? dayjs(date).format('DD/MM/YYYY') : 'N/A';
  };

  const formatCurrency = (amount: number | undefined) => {
    return amount ? `$${amount.toLocaleString()}` : 'N/A';
  };

  const getWarrantyStatus = (asset: Asset) => {
    if (!asset.hasWarranty) return <Tag color="default">لا يوجد ضمان</Tag>;
    
    if (!asset.warrantyExpiryDate) return <Tag color="orange">ضمان (بدون تاريخ انتهاء)</Tag>;
    
    const expiryDate = dayjs(asset.warrantyExpiryDate);
    const now = dayjs();
    const daysUntilExpiry = expiryDate.diff(now, 'day');
    
    if (daysUntilExpiry < 0) {
      return <Tag color="red">انتهى الضمان</Tag>;
    } else if (daysUntilExpiry <= 30) {
      return <Tag color="orange">ينتهي الضمان قريباً ({daysUntilExpiry} يوم)</Tag>;
    } else {
      return <Tag color="green">تحت الضمان</Tag>;
    }
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

  if (!asset) {
    return (
      <MainLayout>
        <Card>
          <div style={{ textAlign: 'center', padding: 50 }}>
            <Text type="secondary">لم يتم العثور على الأصل</Text>
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
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/assets')}>
              العودة للأصول
            </Button>
            <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/assets/${id}/edit`)}>
              تعديل الأصل
            </Button>
            <Button 
              icon={<ToolOutlined />} 
              onClick={() => setMaintenanceModalVisible(true)}
            >
              جدولة صيانة
            </Button>
            <Button 
              icon={<QrcodeOutlined />}
              onClick={() => setQrCodeModalVisible(true)}
              disabled={!asset.qrCode}
            >
              عرض رمز QR
            </Button>
            <Button 
              icon={<PrinterOutlined />}
              onClick={() => setPrintLabelModalVisible(true)}
              disabled={!asset.qrCode}
            >
              طباعة الملصق
            </Button>
          </Space>
        </Card>

        <Card>
          <Title level={3}>
            {asset.name}
            <Tag color={asset.statusColor} style={{ marginLeft: 16 }}>
              {asset.statusName}
            </Tag>
            {asset.isDeleted && (
              <Tag color="red" style={{ marginLeft: 8 }}>
                ⚠️ تم الاستبعاد
              </Tag>
            )}
          </Title>
          
          {asset.isDeleted && (
            <div style={{ 
              background: '#fff2f0', 
              border: '1px solid #ffccc7', 
              borderRadius: 6, 
              padding: 12, 
              marginBottom: 16 
            }}>
              <Text type="warning" strong>
                ⚠️ تم استبعاد هذا الأصل ولم يعد قيد الاستخدام.
              </Text>
            </div>
          )}
          
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <Card title="المعلومات الأساسية" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="الرقم التسلسلي">
                    <Text strong>{asset.serialNumber}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="الباركود">
                    {asset.barcode || 'غير متوفر'}
                  </Descriptions.Item>
                  <Descriptions.Item label="رمز QR">
                    {asset.qrCode ? (
                      <Space direction="vertical" align="center" size="small">
                        <QRCode
                          value={asset.qrCode}
                          size={80}
                          bgColor="#ffffff"
                          fgColor="#000000"
                          level="M"
                        />
                        <Button 
                          type="link" 
                          size="small"
                          icon={<QrcodeOutlined />}
                          onClick={() => setQrCodeModalVisible(true)}
                        >
                          عرض بحجم كبير
                        </Button>
                      </Space>
                    ) : (
                      <Text type="secondary">غير متوفر</Text>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="الوصف">
                    {asset.description || 'لا يوجد وصف'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="الفئة والحالة" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="الفئة">
                    <Tag color="blue">{asset.categoryName}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="الفئة الفرعية">
                    {asset.subCategoryName ? (
                      <Tag color="cyan">{asset.subCategoryName}</Tag>
                    ) : 'غير متوفر'}
                  </Descriptions.Item>
                  <Descriptions.Item label="الحالة">
                    <Tag color={asset.statusColor}>{asset.statusName}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="الموقع الحالي">
                    {getLocationDisplay(asset)}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>

          <Divider />

          <Row gutter={[24, 24]}>
            <Col span={12}>
              <Card title="معلومات الشراء" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="تاريخ الشراء">
                    {formatDate(asset.purchaseDate)}
                  </Descriptions.Item>
                  <Descriptions.Item label="سعر الشراء">
                    {formatCurrency(asset.purchasePrice)}
                  </Descriptions.Item>
                  <Descriptions.Item label="تاريخ الإنشاء">
                    {formatDate(asset.createdAt)}
                  </Descriptions.Item>
                  <Descriptions.Item label="آخر تحديث">
                    {formatDate(asset.updatedAt)}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="معلومات الموقع الكاملة" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="الموقع الحالي">
                    {getLocationDisplay(asset)}
                  </Descriptions.Item>
                  
                  {asset.currentEmployeeId && (
                    <Descriptions.Item label="الموظف المعين">
                      <Tag color="blue" icon={<span>👤</span>}>
                        {asset.currentEmployeeName || `ID: ${asset.currentEmployeeId}`}
                      </Tag>
                    </Descriptions.Item>
                  )}
                  
                  {asset.currentWarehouseId && (
                    <Descriptions.Item label="المستودع">
                      <Tag color="green" icon={<span>🏢</span>}>
                        {asset.currentWarehouseName || `ID: ${asset.currentWarehouseId}`}
                      </Tag>
                    </Descriptions.Item>
                  )}
                  
                  {asset.currentDepartmentId && (
                    <Descriptions.Item label="القسم">
                      <Tag color="orange" icon={<span>🏛️</span>}>
                        {asset.currentDepartmentName || `ID: ${asset.currentDepartmentId}`}
                      </Tag>
                    </Descriptions.Item>
                  )}
                  
                  {asset.currentSectionId && (
                    <Descriptions.Item label="الشعبة">
                      <Tag color="purple" icon={<span>📍</span>}>
                        {asset.currentSectionName || `ID: ${asset.currentSectionId}`}
                      </Tag>
                    </Descriptions.Item>
                  )}
                  
                  {!asset.currentEmployeeId && !asset.currentWarehouseId && !asset.currentDepartmentId && !asset.currentSectionId && (
                    <Descriptions.Item label="تفاصيل الموقع">
                      <Tag color="red">لا توجد معلومات موقع متاحة</Tag>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </Col>
          </Row>

          <Divider />

          <Row gutter={[24, 24]}>
            <Col span={12}>
              <Card title="معلومات الضمان" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="يوجد ضمان">
                    <Tag color={asset.hasWarranty ? 'green' : 'default'}>
                      {asset.hasWarranty ? 'نعم' : 'لا'}
                    </Tag>
                  </Descriptions.Item>
                  {asset.hasWarranty && (
                    <>
                      <Descriptions.Item label="تاريخ انتهاء الضمان">
                        {formatDate(asset.warrantyExpiryDate)}
                      </Descriptions.Item>
                      <Descriptions.Item label="حالة الضمان">
                        {getWarrantyStatus(asset)}
                      </Descriptions.Item>
                    </>
                  )}
                </Descriptions>
              </Card>
            </Col>
          </Row>
        </Card>

        <Card title="سجل الأصل" size="small">
          <Timeline
            items={[
              {
                color: 'green',
                children: (
                  <div>
                    <Text strong>تم إنشاء الأصل</Text>
                    <br />
                    <Text type="secondary">{formatDate(asset.createdAt)}</Text>
                  </div>
                )
              },
              ...(asset.updatedAt ? [{
                color: 'blue',
                children: (
                  <div>
                    <Text strong>تم تحديث الأصل</Text>
                    <br />
                    <Text type="secondary">{formatDate(asset.updatedAt)}</Text>
                  </div>
                )
              }] : [])
            ]}
          />
          <Text type="secondary">
            سيتم توفير سجل أكثر تفصيلاً (التحويلات، الصيانة، إلخ) في التحديثات المستقبلية.
          </Text>
        </Card>
      </Space>

      {/* نافذة الصيانة */}
      <MaintenanceModal
        visible={maintenanceModalVisible}
        onCancel={() => setMaintenanceModalVisible(false)}
        onSuccess={() => {
          setMaintenanceModalVisible(false);
          message.success('تم جدولة الصيانة بنجاح');
        }}
        assetId={asset?.id}
        assetName={asset?.name}
      />

      {/* QR Code Modal */}
      <Modal
        title="رمز QR للأصل"
        open={qrCodeModalVisible}
        onCancel={() => setQrCodeModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setQrCodeModalVisible(false)}>
            إغلاق
          </Button>,
          <Button 
            key="print" 
            type="primary" 
            icon={<PrinterOutlined />}
            onClick={() => {
              window.print();
            }}
          >
            طباعة
          </Button>
        ]}
        width={400}
        centered
      >
        {asset?.qrCode && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            padding: '24px',
            gap: '16px'
          }}>
            <QRCode
              value={asset.qrCode}
              size={250}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
            />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: 8 }}>
                {asset.name}
              </Text>
              <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                الرقم التسلسلي: {asset.serialNumber}
              </Text>
              <Text type="secondary" style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                {asset.qrCode}
              </Text>
            </div>
          </div>
        )}
      </Modal>

      {/* Print Label Modal */}
      <Modal
        title="ملصق الأصل"
        open={printLabelModalVisible}
        onCancel={() => setPrintLabelModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPrintLabelModalVisible(false)}>
            إغلاق
          </Button>,
          <Button 
            key="print" 
            type="primary" 
            icon={<PrinterOutlined />}
            onClick={() => {
              window.print();
            }}
          >
            طباعة
          </Button>
        ]}
        width={600}
        centered
      >
        {asset?.qrCode && (
          <div 
            id="asset-label-print"
            style={{ 
              padding: '24px',
              background: '#fff',
              border: '2px solid #000',
              borderRadius: '8px'
            }}
          >
            {/* Header */}
            <div style={{ 
              textAlign: 'center', 
              borderBottom: '2px solid #000',
              paddingBottom: '16px',
              marginBottom: '16px'
            }}>
              <Title level={3} style={{ margin: 0 }}>نظام إدارة الأصول</Title>
              <Text type="secondary">ملصق تعريف الأصل</Text>
            </div>

            {/* Main Content */}
            <Row gutter={24}>
              {/* QR Code Side */}
              <Col span={10}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%'
                }}>
                  <QRCode
                    value={asset.qrCode}
                    size={180}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                  />
                  <Text 
                    style={{ 
                      fontSize: '10px', 
                      fontFamily: 'monospace',
                      marginTop: '8px',
                      wordBreak: 'break-all',
                      textAlign: 'center'
                    }}
                  >
                    {asset.qrCode}
                  </Text>
                </div>
              </Col>

              {/* Asset Info Side */}
              <Col span={14}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>اسم الأصل</Text>
                    <div>
                      <Text strong style={{ fontSize: '16px' }}>{asset.name}</Text>
                    </div>
                  </div>

                  <Divider style={{ margin: '8px 0' }} />

                  <div>
                    <Text type="secondary" style={{ fontSize: '11px' }}>الرقم التسلسلي</Text>
                    <div>
                      <Text strong style={{ fontSize: '14px', fontFamily: 'monospace' }}>
                        {asset.serialNumber}
                      </Text>
                    </div>
                  </div>

                  {asset.barcode && (
                    <>
                      <div>
                        <Text type="secondary" style={{ fontSize: '11px' }}>الباركود</Text>
                        <div>
                          <Text style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                            {asset.barcode}
                          </Text>
                        </div>
                      </div>
                    </>
                  )}

                  <Divider style={{ margin: '8px 0' }} />

                  <div>
                    <Text type="secondary" style={{ fontSize: '11px' }}>الفئة</Text>
                    <div>
                      <Tag color="blue">{asset.categoryName}</Tag>
                    </div>
                  </div>

                  <div>
                    <Text type="secondary" style={{ fontSize: '11px' }}>الحالة</Text>
                    <div>
                      <Tag color={asset.statusColor}>{asset.statusName}</Tag>
                    </div>
                  </div>

                  {asset.purchaseDate && (
                    <div>
                      <Text type="secondary" style={{ fontSize: '11px' }}>تاريخ الشراء</Text>
                      <div>
                        <Text style={{ fontSize: '12px' }}>
                          {dayjs(asset.purchaseDate).format('DD/MM/YYYY')}
                        </Text>
                      </div>
                    </div>
                  )}
                </Space>
              </Col>
            </Row>

            {/* Footer */}
            <div style={{ 
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid #d9d9d9',
              textAlign: 'center'
            }}>
              <Text type="secondary" style={{ fontSize: '10px' }}>
                تم الطباعة في: {dayjs().format('DD/MM/YYYY HH:mm')}
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </MainLayout>
  );
}