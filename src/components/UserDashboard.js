import React, { useState } from 'react';
import { Button, Badge } from './ui';
import { useAuth } from '../contexts/AuthContext';
import ClientList from './ClientList';
import UserProfile from './UserProfile';
import './UserDashboard.css';

const UserDashboard = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('clients');
  const { logout, user } = useAuth();

  const getConnectionStatus = () => {
    return <Badge variant="success">HTTP API</Badge>;
  };

  const tabs = [
    { id: 'clients', name: '客户端监控', icon: '👥' },
    { id: 'profile', name: '个人设置', icon: '⚙️' }
  ];

  return (
    <div className="user-dashboard">
      <header className="user-dashboard__header">
        <div className="user-dashboard__header-content">
          <div className="user-dashboard__header-left">
            <h1 className="user-dashboard__title">
              🎯 播放器平台 - 用户面板
            </h1>
            <p className="user-dashboard__subtitle">
              客户端监控和查看
            </p>
          </div>
          <div className="user-dashboard__header-right">
            <div className="user-dashboard__user-info">
              <span className="user-dashboard__welcome">
                欢迎, {user?.username}
              </span>
              <Badge variant="primary" size="sm">普通用户</Badge>
            </div>
            <div className="user-dashboard__connection-status">
              <span className="user-dashboard__connection-label">API:</span>
              {getConnectionStatus()}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
            >
              退出登录
            </Button>
          </div>
        </div>

        <nav className="user-dashboard__nav">
          <div className="user-dashboard__nav-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`user-dashboard__nav-tab ${
                  activeTab === tab.id ? 'user-dashboard__nav-tab--active' : ''
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="user-dashboard__nav-tab-icon">{tab.icon}</span>
                <span className="user-dashboard__nav-tab-text">{tab.name}</span>
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="user-dashboard__main">
        <div className="user-dashboard__content">
          {activeTab === 'clients' && (
            <>
              <div className="user-dashboard__client-section">
                <div className="user-dashboard__client-list">
                  <ClientList
                    onSelectClient={() => {}} // 禁用选择功能
                    selectedClientId={null}
                    refreshTrigger={refreshTrigger}
                    readonly={true} // 只读模式
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'profile' && (
            <div className="user-dashboard__tab-content">
              <UserProfile />
            </div>
          )}
        </div>
      </main>

      <footer className="user-dashboard__footer">
        <div className="user-dashboard__footer-content">
          <div className="user-dashboard__footer-left">
            <span className="user-dashboard__footer-text">
              ⚠️ 仅用于授权安全测试 | 请遵守相关法律法规
            </span>
          </div>
          <div className="user-dashboard__footer-right">
            <span className="user-dashboard__footer-text">
              服务器: localhost:8088 | 只读模式
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserDashboard;