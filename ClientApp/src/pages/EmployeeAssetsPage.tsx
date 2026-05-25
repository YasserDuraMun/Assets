import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Spin, Result, Button, QRCode, Descriptions, Typography, Space } from 'antd';
import { UserOutlined, ArrowRightOutlined, PrinterOutlined } from '@ant-design/icons';
import MainLayout from '../components/MainLayout';
import { employeeApi } from '../api/employee.api';
import { assetApi } from '../api/asset.api';
import type { Employee, Asset } from '../types';

const { Title, Text } = Typography;

export default function EmployeeAssetsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchData(Number(id));
    }
  }, [id]);

  const fetchData = async (employeeId: number) => {
    setLoading(true);
    try {
      const [empResponse, assetsResponse] = await Promise.all([
        employeeApi.getById(employeeId),
        assetApi.getAll({ employeeId, pageSize: 200 }),
      ]);

      if (empResponse.data.success && empResponse.data.data) {
        setEmployee(empResponse.data.data);
      } else {
        setError('الموظف غير موجود');
        return;
      }

      if (assetsResponse.data.success && assetsResponse.data.data) {
        const data = assetsResponse.data.data;
        const items = (data as any).items ?? (Array.isArray(data) ? data : []);
        setAssets(items);
      }
    } catch (err) {
      setError('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    { title: 'اسم الأصل', dataIndex: 'name', key: 'name' },
    { title: 'الرقم التسلسلي', dataIndex: 'serialNumber', key: 'serialNumber' },
    { title: 'الباركود', dataIndex: 'barcode', key: 'barcode' },
    { title: 'الفئة', dataIndex: 'categoryName', key: 'categoryName' },
    {
      title: 'الحالة',
      dataIndex: 'statusName',
      key: 'statusName',
      render: (status: string, record: Asset) => (
        <Tag color={record.statusColor || 'default'}>{status}</Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>جاري التحميل...</div>
        </div>
      </MainLayout>
    );
  }

  if (error || !employee) {
    return (
      <MainLayout>
        <Result
          status="404"
          title="غير موجود"
          subTitle={error || 'الموظف غير موجود'}
          extra={
            <Button type="primary" onClick={() => navigate('/settings')}>
              العودة للإعدادات
            </Button>
          }
        />
      </MainLayout>
    );
  }

  const qrUrl = `${window.location.origin}/employees/${employee.id}/assets`;

  return (
    <MainLayout>
      <div className="employee-assets-page">
        {/* Header Actions (hidden in print) */}
        <div className="no-print" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button icon={<ArrowRightOutlined />} onClick={() => navigate(-1)}>
            رجوع
          </Button>
          <Button icon={<PrinterOutlined />} onClick={handlePrint}>
            طباعة
          </Button>
        </div>

        <Card>
          {/* Employee Info + QR Side by Side */}
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <Space align="center" style={{ marginBottom: 12 }}>
                <UserOutlined style={{ fontSize: 28, color: '#1890ff' }} />
                <Title level={3} style={{ margin: 0 }}>{employee.fullName}</Title>
              </Space>

              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="رقم الموظف">{employee.employeeNumber}</Descriptions.Item>
                <Descriptions.Item label="الإدارة">{employee.departmentName}</Descriptions.Item>
                {employee.sectionName && (
                  <Descriptions.Item label="القسم">{employee.sectionName}</Descriptions.Item>
                )}
                {employee.jobTitle && (
                  <Descriptions.Item label="المسمى الوظيفي">{employee.jobTitle}</Descriptions.Item>
                )}
                {employee.email && (
                  <Descriptions.Item label="البريد">{employee.email}</Descriptions.Item>
                )}
                <Descriptions.Item label="عدد الأصول">
                  <Tag color="blue">{assets.length} أصل</Tag>
                </Descriptions.Item>
              </Descriptions>
            </div>

            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <QRCode value={qrUrl} size={160} bordered={false} />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 11 }}>امسح لعرض الأصول</Text>
              </div>
            </div>
          </div>

          {/* Assets Table */}
          <Title level={4} style={{ marginBottom: 12 }}>
            الأصول المخصصة للموظف ({assets.length})
          </Title>
          <Table
            columns={columns}
            dataSource={assets}
            rowKey="id"
            pagination={false}
            size="small"
            locale={{ emptyText: 'لا توجد أصول مخصصة لهذا الموظف' }}
          />
        </Card>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .ant-layout-sider, .ant-layout-header { display: none !important; }
          .ant-layout-content { margin: 0 !important; padding: 0 !important; }
          body { direction: rtl; }
        }
      `}</style>
    </MainLayout>
  );
}
