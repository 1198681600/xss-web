import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from './ui';
import { useAuth } from '../contexts/AuthContext';
import TwoFactorManagement from './TwoFactorManagement';
import PasswordChange from './PasswordChange';
import { toast } from './Toast';
import './UserProfile.css';

const UserProfile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const { authService } = useAuth();

  useEffect(() => {
    loadUserInfo();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserInfo = async () => {
    try {
      setIsLoading(true);
      const userData = await authService.getCurrentUser();
      setUserInfo(userData);
    } catch (error) {
      console.error('加载用户信息失败:', error);
      toast.error('加载用户信息失败');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const tabs = [
    { id: 'profile', name: '基本信息', icon: '👤' },
    { id: 'password', name: '修改密码', icon: '🔑' },
    { id: '2fa', name: '双因子认证', icon: '🔐' }
  ];

  return (
    <div className="user-profile">
      <div className="user-profile__header">
        <h2 className="user-profile__title">👤 个人设置</h2>
        <p className="user-profile__subtitle">管理你的账户信息和安全设置</p>
      </div>

      <div className="user-profile__tabs">
        <nav className="user-profile__nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`user-profile__tab ${
                activeTab === tab.id ? 'user-profile__tab--active' : ''
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="user-profile__tab-icon">{tab.icon}</span>
              <span className="user-profile__tab-text">{tab.name}</span>
            </button>
          ))}
        </nav>

        <div className="user-profile__tab-content">
          {activeTab === 'profile' && (
            <Card className="user-profile__info-card">
              <div className="user-profile__info-header">
                <h3>📋 基本信息</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadUserInfo}
                  disabled={isLoading}
                >
                  🔄 刷新
                </Button>
              </div>

              {isLoading ? (
                <div className="user-profile__loading">
                  加载中...
                </div>
              ) : userInfo ? (
                <div className="user-profile__info-grid">
                  <div className="user-profile__info-item">
                    <span className="user-profile__info-label">用户名:</span>
                    <span className="user-profile__info-value">{userInfo.username}</span>
                  </div>
                  
                  <div className="user-profile__info-item">
                    <span className="user-profile__info-label">角色:</span>
                    <Badge variant={userInfo.role === 'admin' ? 'danger' : 'primary'}>
                      {userInfo.role === 'admin' ? '管理员' : '普通用户'}
                    </Badge>
                  </div>
                  
                  <div className="user-profile__info-item">
                    <span className="user-profile__info-label">用户ID:</span>
                    <span className="user-profile__info-value">{userInfo.id}</span>
                  </div>
                  
                  <div className="user-profile__info-item">
                    <span className="user-profile__info-label">双因子认证:</span>
                    <Badge variant={userInfo.two_factor_enabled ? 'success' : 'warning'}>
                      {userInfo.two_factor_enabled ? '已启用' : '未启用'}
                    </Badge>
                  </div>
                  
                  <div className="user-profile__info-item">
                    <span className="user-profile__info-label">创建时间:</span>
                    <span className="user-profile__info-value">
                      {formatDate(userInfo.created_at)}
                    </span>
                  </div>
                  
                  <div className="user-profile__info-item">
                    <span className="user-profile__info-label">最后更新:</span>
                    <span className="user-profile__info-value">
                      {formatDate(userInfo.updated_at)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="user-profile__error">
                  无法加载用户信息
                </div>
              )}
            </Card>
          )}

          {activeTab === 'password' && (
            <PasswordChange />
          )}

          {activeTab === '2fa' && (
            <TwoFactorManagement />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;