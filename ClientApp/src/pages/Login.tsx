import { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios.config';

const { Title } = Typography;

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
      const response = await api.post('/auth/login', values);
      
      if (response.data.success) {
        const userData = response.data.data;
        console.log('📝 Login Response Data:', userData);
        console.log('👤 User FullName:', userData.fullName);
        console.log('👤 User Username:', userData.username);
        console.log('👤 User Role:', userData.role);
        
        // Use AuthContext login method
        login(userData.token, {
          username: userData.username,
          fullName: userData.fullName,
          role: userData.role,
          expiresAt: userData.expiresAt
        });
        
        message.success('تم تسجيل الدخول بنجاح');
        
        // Navigate to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        message.error(response.data.message || 'فشل تسجيل الدخول');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      message.error(error.response?.data?.message || 'فشل تسجيل الدخول');
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>نظام إدارة الأصول</Title>
          <p>بوابة إدارة الأصول البلدية</p>
        </div>

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
              prefix={<UserOutlined />}
              placeholder="اسم المستخدم"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'الرجاء إدخال كلمة المرور' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="كلمة المرور"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: '100%' }}
            >
              تسجيل الدخول
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16, color: '#666' }}>
          <small>افتراضي: admin / admin123</small>
        </div>
      </Card>
    </div>
  );
}