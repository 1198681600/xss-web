import React, { useState } from 'react';
import { Button, Input, Card } from './ui';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('请输入用户名和密码');
      return;
    }

    const result = await login(formData.username, formData.password);
    if (!result.success) {
      setError(result.error || '登录失败');
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__container">
        <Card className="login-page__card">
          <div className="login-page__header">
            <h1 className="login-page__title">🎯 XSS 安全测试平台</h1>
            <p className="login-page__subtitle">请登录以继续</p>
          </div>

          <form className="login-page__form" onSubmit={handleSubmit}>
            {error && (
              <div className="login-page__error">
                ⚠️ {error}
              </div>
            )}

            <div className="login-page__field">
              <Input
                type="text"
                name="username"
                placeholder="用户名"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            <div className="login-page__field">
              <Input
                type="password"
                name="password"
                placeholder="密码"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="login-page__submit"
              disabled={isLoading}
            >
              {isLoading ? '登录中...' : '登录'}
            </Button>
          </form>

          <div className="login-page__footer">
            <p className="login-page__notice">
              ⚠️ 仅用于授权安全测试 | 请遵守相关法律法规
            </p>
            <p className="login-page__help">
              普通用户请联系管理员创建账户
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;