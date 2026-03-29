import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Typography, App } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import api from '../api/axios.config';
import type { LoginRequest, LoginResponse, ApiResponse } from '../types';

const { Title } = Typography;

export default function Login() {
const [loading, setLoading] = useState(false);
const navigate = useNavigate();
const { message: messageApi } = App.useApp();

const onFinish = async (values: LoginRequest) => {
  setLoading(true);
  try {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', values);
      
    if (response.data.success && response.data.data) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
      messageApi.success('Login successful!');
        
      // ?????? navigate ????? ?? window.location.href
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 300);
    }
  } catch (error) {
    const err = error as { response?: { data?: { message?: string } } };
    messageApi.error(err.response?.data?.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card 
        style={{ 
          width: 450, 
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          borderRadius: 12
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <LoginOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          <Title level={2} style={{ marginTop: 16, marginBottom: 8 }}>
            ???? ????? ??????
          </Title>
          <Typography.Text type="secondary">
            ?? ?????? ?????? ????????
          </Typography.Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            label="??? ????????"
            name="username"
            rules={[{ required: true, message: '?????? ????? ??? ????????' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="admin" 
            />
          </Form.Item>

          <Form.Item
            label="???? ??????"
            name="password"
            rules={[{ required: true, message: '?????? ????? ???? ??????' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="••••••••" 
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block
              loading={loading}
              icon={<LoginOutlined />}
            >
              ????? ??????
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
