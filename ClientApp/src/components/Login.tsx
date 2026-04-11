import React, { useState, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginRequest } from '../types/security';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginRequest>({
    email: 'admin@assets.ps',
    password: 'Admin@123'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(credentials);
      if (response.success) {
        console.log('? Login successful, navigating to dashboard');
        navigate('/dashboard', { replace: true });
      } else {
        setError(response.message || 'فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد.');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
      console.error('? Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginRequest, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        {/* Header with icon */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
          }}>
            <svg width="30" height="30" fill="white" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
          </div>
          <h2 style={{
            color: '#2d3748',
            fontSize: '28px',
            fontWeight: '700',
            margin: '0 0 8px 0'
          }}>
            مرحباً بعودتك
          </h2>
          <p style={{
            color: '#718096',
            fontSize: '14px',
            margin: '0'
          }}>
            قم بتسجيل الدخول إلى حسابك
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2d3748',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
                backgroundColor: '#f7fafc'
              }}
              placeholder="أدخل بريدك الإلكتروني"
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.backgroundColor = 'white';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.backgroundColor = '#f7fafc';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2d3748',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              كلمة المرور
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
                backgroundColor: '#f7fafc'
              }}
              placeholder="أدخل كلمة المرور"
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.backgroundColor = 'white';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.backgroundColor = '#f7fafc';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {error && (
            <div style={{
              background: 'linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%)',
              color: '#c53030',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '14px',
              textAlign: 'center',
              border: '1px solid #fc8181'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(102, 126, 234, 0.3)',
              transform: loading ? 'none' : 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                const target = e.target as HTMLButtonElement;
                target.style.transform = 'translateY(-1px)';
                target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                const target = e.target as HTMLButtonElement;
                target.style.transform = 'translateY(0)';
                target.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.3)';
              }
            }}
          >
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        {/* Demo credentials with nice styling */}
        <div style={{
          marginTop: '32px',
          padding: '20px',
          background: 'linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%)',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#4a5568',
          border: '1px solid #cbd5e0'
        }}>
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '12px',
            color: '#2d3748',
            fontWeight: '600',
            fontSize: '13px'
          }}>
            🔑 بيانات اعتماد تجريبية
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: '500' }}>البريد:</span>
            <span style={{ 
              backgroundColor: 'white', 
              padding: '4px 8px', 
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '11px',
              border: '1px solid #cbd5e0'
            }}>
              admin@assets.ps
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '500' }}>كلمة المرور:</span>
            <span style={{ 
              backgroundColor: 'white', 
              padding: '4px 8px', 
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '11px',
              border: '1px solid #cbd5e0'
            }}>
              Admin@123
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;