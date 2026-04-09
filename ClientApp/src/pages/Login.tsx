import { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

interface LoginForm {
  username: string;
  password: string;
}

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (values: LoginForm) => {
    setLoading(true);
    try {
      const response = await login({
        email: values.username,
        password: values.password
      });
      
      if (response.success) {
        message.success('تم تسجيل الدخول بنجاح');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        message.error(response.message || 'فشل تسجيل الدخول');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      message.error(error.response?.data?.message || error.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card 
        bordered={false}
        style={{ 
          width: '100%',
          maxWidth: '440px',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%', display: 'flex' }}>
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)'
            }}>
              <SafetyCertificateOutlined style={{ fontSize: '40px', color: '#fff' }} />
            </div>
            <Title level={2} style={{ 
              marginBottom: '8px',
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a1a1a'
            }}>
              نظام إدارة الأصول
            </Title>
            <Text style={{ 
              fontSize: '15px',
              color: '#666'
            }}>
              مرحباً بك في بوابة إدارة الأصول البلدية
            </Text>
          </div>

          {/* Form */}
          <Form
            name="login"
            onFinish={handleLogin}
            size="large"
            layout="vertical"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'الرجاء إدخال اسم المستخدم' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#999', fontSize: '18px' }} />}
                placeholder="اسم المستخدم أو البريد الإلكتروني"
                style={{
                  height: '50px',
                  borderRadius: '10px',
                  fontSize: '15px',
                  border: '2px solid #e8e8e8'
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'الرجاء إدخال كلمة المرور' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#999', fontSize: '18px' }} />}
                placeholder="كلمة المرور"
                style={{
                  height: '50px',
                  borderRadius: '10px',
                  fontSize: '15px',
                  border: '2px solid #e8e8e8'
                }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  height: '50px',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)'
                }}
              >
                تسجيل الدخول
              </Button>
            </Form.Item>
          </Form>

          {/* Footer */}
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #f8f9ff 0%, #f5f3ff 100%)',
            borderRadius: '10px',
            textAlign: 'center',
            border: '1px solid #e8e5ff'
          }}>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              🔑 حساب تجريبي: <span style={{ color: '#667eea', fontWeight: '600' }}>admin</span> / <span style={{ color: '#667eea', fontWeight: '600' }}>admin123</span>
            </Text>
          </div>
        </Space>

        <div style={{ 
          marginTop: '24px', 
          textAlign: 'center',
          paddingTop: '24px',
          borderTop: '1px solid #f0f0f0'
        }}>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            © 2026 نظام إدارة الأصول. جميع الحقوق محفوظة
          </Text>
        </div>
      </Card>
    </div>
  );
}