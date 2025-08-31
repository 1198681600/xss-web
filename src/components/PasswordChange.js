import React, { useState } from 'react';
import { Card, Button, Input } from './ui';
import { useAuth } from '../contexts/AuthContext';
import { toast } from './Toast';
import './PasswordChange.css';

const PasswordChange = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { authService } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = '请输入当前密码';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = '请输入新密码';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = '新密码至少需要6个字符';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认新密码';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = '新密码不能与当前密码相同';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await authService.changePassword(formData.currentPassword, formData.newPassword);
      toast.success('密码修改成功');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('修改密码失败:', error);
      toast.error(error.message || '修改密码失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="password-change">
      <div className="password-change__header">
        <h3>🔑 修改密码</h3>
        <p className="password-change__subtitle">更新您的账户密码</p>
      </div>

      <form onSubmit={handleSubmit} className="password-change__form">
        <div className="password-change__field">
          <label className="password-change__label">当前密码</label>
          <Input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleInputChange}
            placeholder="请输入当前密码"
            error={errors.currentPassword}
            autoComplete="current-password"
          />
          {errors.currentPassword && (
            <span className="password-change__error">{errors.currentPassword}</span>
          )}
        </div>

        <div className="password-change__field">
          <label className="password-change__label">新密码</label>
          <Input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            placeholder="请输入新密码 (至少6个字符)"
            error={errors.newPassword}
            autoComplete="new-password"
          />
          {errors.newPassword && (
            <span className="password-change__error">{errors.newPassword}</span>
          )}
        </div>

        <div className="password-change__field">
          <label className="password-change__label">确认新密码</label>
          <Input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="请再次输入新密码"
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <span className="password-change__error">{errors.confirmPassword}</span>
          )}
        </div>

        <div className="password-change__actions">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isLoading}
            className="password-change__submit"
          >
            {isLoading ? '修改中...' : '修改密码'}
          </Button>
        </div>
      </form>

      <div className="password-change__tips">
        <h4>🛡️ 密码安全提示</h4>
        <ul>
          <li>使用强密码，包含字母、数字和特殊字符</li>
          <li>不要使用与其他账户相同的密码</li>
          <li>定期更换密码以提高安全性</li>
          <li>避免使用个人信息作为密码</li>
        </ul>
      </div>
    </Card>
  );
};

export default PasswordChange;