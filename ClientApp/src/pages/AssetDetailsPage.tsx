import { useState, useEffect } from 'react';
import { Card, Descriptions, Spin, Button, Space, Tag, Typography, Row, Col, message, Divider, Timeline } from 'antd';
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
      message.error('Asset not found');
      navigate('/assets');
    }
  } catch (error) {
    console.error('?? Failed to load asset:', error);
    message.error('Failed to load asset details');
    navigate('/assets');
  } finally {
    setLoading(false);
  }
};

  const getLocationDisplay = (asset: Asset) => {
    switch (asset.currentLocationType) {
      case 'Employee':
        return (
          <Tag color="blue" icon={<span>??</span>}>
            Employee: {asset.currentEmployeeName}
          </Tag>
        );
      case 'Warehouse':
        return (
          <Tag color="green" icon={<span>??</span>}>
            Warehouse: {asset.currentWarehouseName}
          </Tag>
        );
      case 'Department':
        return (
          <Tag color="orange" icon={<span>???</span>}>
            Department: {asset.currentDepartmentName}
          </Tag>
        );
      case 'Section':
        return (
          <Tag color="purple" icon={<span>??</span>}>
            Section: {asset.currentSectionName}
          </Tag>
        );
      default:
        return <Tag color="default">Unknown Location</Tag>;
    }
  };

  const formatDate = (date: string | undefined) => {
    return date ? dayjs(date).format('DD/MM/YYYY') : 'N/A';
  };

  const formatCurrency = (amount: number | undefined) => {
    return amount ? `$${amount.toLocaleString()}` : 'N/A';
  };

  const getWarrantyStatus = (asset: Asset) => {
    if (!asset.hasWarranty) return <Tag color="default">No Warranty</Tag>;
    
    if (!asset.warrantyExpiryDate) return <Tag color="orange">Warranty (No Expiry Date)</Tag>;
    
    const expiryDate = dayjs(asset.warrantyExpiryDate);
    const now = dayjs();
    const daysUntilExpiry = expiryDate.diff(now, 'day');
    
    if (daysUntilExpiry < 0) {
      return <Tag color="red">Warranty Expired</Tag>;
    } else if (daysUntilExpiry <= 30) {
      return <Tag color="orange">Warranty Expires Soon ({daysUntilExpiry} days)</Tag>;
    } else {
      return <Tag color="green">Under Warranty</Tag>;
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
            <Text type="secondary">Asset not found</Text>
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
              Back to Assets
            </Button>
            <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/assets/${id}/edit`)}>
              Edit Asset
            </Button>
            <Button 
              icon={<ToolOutlined />} 
              onClick={() => setMaintenanceModalVisible(true)}
            >
              Schedule Maintenance
            </Button>
            <Button icon={<QrcodeOutlined />}>
              View QR Code
            </Button>
            <Button icon={<PrinterOutlined />}>
              Print Label
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
                ??? DISPOSED
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
                ?? This asset has been disposed and is no longer in active use.
              </Text>
            </div>
          )}
          
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <Card title="Basic Information" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Serial Number">
                    <Text strong>{asset.serialNumber}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Barcode">
                    {asset.barcode || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="QR Code">
                    {asset.qrCode || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Description">
                    {asset.description || 'No description'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="Category & Status" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Category">
                    <Tag color="blue">{asset.categoryName}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="SubCategory">
                    {asset.subCategoryName ? (
                      <Tag color="cyan">{asset.subCategoryName}</Tag>
                    ) : 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={asset.statusColor}>{asset.statusName}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Current Location">
                    {getLocationDisplay(asset)}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>

          <Divider />

          <Row gutter={[24, 24]}>
            <Col span={12}>
              <Card title="Purchase Information" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Purchase Date">
                    {formatDate(asset.purchaseDate)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Purchase Price">
                    {formatCurrency(asset.purchasePrice)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Created Date">
                    {formatDate(asset.createdAt)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Last Updated">
                    {formatDate(asset.updatedAt)}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="Warranty Information" size="small">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Has Warranty">
                    <Tag color={asset.hasWarranty ? 'green' : 'default'}>
                      {asset.hasWarranty ? 'Yes' : 'No'}
                    </Tag>
                  </Descriptions.Item>
                  {asset.hasWarranty && (
                    <>
                      <Descriptions.Item label="Warranty Expiry">
                        {formatDate(asset.warrantyExpiryDate)}
                      </Descriptions.Item>
                      <Descriptions.Item label="Warranty Status">
                        {getWarrantyStatus(asset)}
                      </Descriptions.Item>
                    </>
                  )}
                </Descriptions>
              </Card>
            </Col>
          </Row>
        </Card>

        <Card title="Asset History" size="small">
          <Timeline
            items={[
              {
                color: 'green',
                children: (
                  <div>
                    <Text strong>Asset Created</Text>
                    <br />
                    <Text type="secondary">{formatDate(asset.createdAt)}</Text>
                  </div>
                )
              },
              ...(asset.updatedAt ? [{
                color: 'blue',
                children: (
                  <div>
                    <Text strong>Asset Updated</Text>
                    <br />
                    <Text type="secondary">{formatDate(asset.updatedAt)}</Text>
                  </div>
                )
              }] : [])
            ]}
          />
          <Text type="secondary">
            More detailed history (transfers, maintenance, etc.) will be available in future updates.
          </Text>
        </Card>
      </Space>

      {/* Maintenance Modal */}
      <MaintenanceModal
        visible={maintenanceModalVisible}
        onCancel={() => setMaintenanceModalVisible(false)}
        onSuccess={() => {
          setMaintenanceModalVisible(false);
          message.success('Maintenance scheduled successfully');
        }}
        assetId={asset?.id}
        assetName={asset?.name}
      />
    </MainLayout>
  );
}