import { useState, useEffect } from 'react';
import { Card, Descriptions, Spin, Button, Space, Tag, Typography, message, Alert } from 'antd';
import { ArrowLeftOutlined, SwapOutlined, EyeOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { transferApi, type Transfer } from '../api/transfer.api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

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
        message.error('Transfer not found');
        navigate('/transfers');
      }
    } catch (error) {
      console.error('Failed to load transfer:', error);
      message.error('Failed to load transfer details');
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
            <Text type="secondary">Transfer not found</Text>
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
              Back to Transfers
            </Button>
            <Button 
              type="primary" 
              icon={<EyeOutlined />} 
              onClick={() => navigate(`/assets/${transfer.assetId}`)}
            >
              View Asset Details
            </Button>
          </Space>
        </Card>

        <Card>
          <Title level={3}>
            <SwapOutlined /> Transfer Details
            <Tag color="green" style={{ marginLeft: 16, fontSize: '14px' }}>
              Completed
            </Tag>
          </Title>
          
          <Alert
            message="Transfer Summary"
            description={
              <div>
                <Text strong>{transfer.assetName}</Text> was transferred from{' '}
                <Tag color="orange">{transfer.fromLocation || 'Unknown'}</Tag> to{' '}
                <Tag color="green">{transfer.toLocation || 'Unknown'}</Tag> on{' '}
                <Text strong>{formatDateOnly(transfer.transferDate)}</Text>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Descriptions
            title="Transfer Information"
            bordered
            column={2}
            size="middle"
          >
            <Descriptions.Item label="Transfer ID" span={1}>
              <Text strong>#{transfer.id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Transfer Date" span={1}>
              <Text strong>{formatDateOnly(transfer.transferDate)}</Text>
            </Descriptions.Item>
            
            <Descriptions.Item label="Asset Name" span={1}>
              <Text strong>{transfer.assetName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Serial Number" span={1}>
              <Text code>{transfer.assetSerialNumber}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="From Location" span={1}>
              {transfer.fromLocation ? (
                <Tag color="orange" style={{ fontSize: '14px' }}>
                  {transfer.fromLocation}
                </Tag>
              ) : (
                <Text type="secondary">Unknown</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="To Location" span={1}>
              {transfer.toLocation ? (
                <Tag color="green" style={{ fontSize: '14px' }}>
                  {transfer.toLocation}
                </Tag>
              ) : (
                <Text type="secondary">Unknown</Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Transfer Reason" span={2}>
              {transfer.reason ? (
                <Text>{transfer.reason}</Text>
              ) : (
                <Text type="secondary">No reason provided</Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Notes" span={2}>
              {transfer.notes ? (
                <Text>{transfer.notes}</Text>
              ) : (
                <Text type="secondary">No additional notes</Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Performed By" span={1}>
              <Text strong>{transfer.performedBy}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Created Date" span={1}>
              <Text>{formatDate(transfer.createdAt)}</Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Transfer Timeline" size="small">
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
                  <Text strong>Transfer Completed</Text>
                  <br />
                  <Text type="secondary">
                    {formatDate(transfer.createdAt)} by {transfer.performedBy}
                  </Text>
                </div>
              </div>
              
              <div style={{ marginLeft: '6px', borderLeft: '2px solid #f0f0f0', paddingLeft: '18px', minHeight: '40px' }}>
                <Text type="secondary">
                  Asset location updated successfully. The asset is now available at the new location.
                </Text>
              </div>
            </Space>
          </div>
        </Card>
      </Space>
    </MainLayout>
  );
}