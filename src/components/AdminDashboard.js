import React, { useState } from 'react';
import { Button, Badge } from './ui';
import { useAuth } from '../contexts/AuthContext';
import UserManagement from './UserManagement';
import ProjectDashboard from './ProjectDashboard';
import AllProjectsDashboard from './AllProjectsDashboard';
import UserProfile from './UserProfile';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeTab, setActiveTab] = useState('my-projects');
  const [selectedProject, setSelectedProject] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { logout, user } = useAuth();

  const getConnectionStatus = () => {
    return <Badge variant="success">HTTP API</Badge>;
  };

  const tabs = [
    { id: 'my-projects', name: '我的项目', icon: '📁' },
    { id: 'all-projects', name: '项目管理', icon: '🗂️' },
    { id: 'users', name: '用户管理', icon: '👤' },
    { id: 'profile', name: '个人设置', icon: '⚙️' }
  ];

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard__header">
        <div className="admin-dashboard__header-content">
          <div className="admin-dashboard__header-left">
            <h1 className="admin-dashboard__title">
              🎯 播放器平台 - 管理员
            </h1>
            <p className="admin-dashboard__subtitle">
              播放器平台
            </p>
          </div>
          <div className="admin-dashboard__header-right">
            <div className="admin-dashboard__user-info">
              <span className="admin-dashboard__welcome">
                欢迎, {user?.username}
              </span>
              <Badge variant="danger" size="sm">管理员</Badge>
            </div>
            <div className="admin-dashboard__connection-status">
              <span className="admin-dashboard__connection-label">API:</span>
              {getConnectionStatus()}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
            >
              退出登录
            </Button>
            {selectedClient && (
              <div className="admin-dashboard__selected-client">
                <span className="admin-dashboard__selected-label">选中客户端:</span>
                <Badge variant="primary">
                  {selectedClient.id.slice(0, 8)}...
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedClient(null)}
                >
                  ✕
                </Button>
              </div>
            )}
          </div>
        </div>

        <nav className="admin-dashboard__nav">
          <div className="admin-dashboard__nav-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`admin-dashboard__nav-tab ${
                  activeTab === tab.id ? 'admin-dashboard__nav-tab--active' : ''
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="admin-dashboard__nav-tab-icon">{tab.icon}</span>
                <span className="admin-dashboard__nav-tab-text">{tab.name}</span>
                {tab.badge && (
                  <Badge variant="danger" size="sm" className="admin-dashboard__nav-tab-badge">
                    {tab.badge}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="admin-dashboard__main">
        <div className="admin-dashboard__content">
          {activeTab === 'my-projects' && (
            <div className="admin-dashboard__tab-content">
              <ProjectDashboard hideHeader={true} />
            </div>
          )}

          {activeTab === 'all-projects' && (
            <div className="admin-dashboard__tab-content">
              <AllProjectsDashboard hideHeader={true} />
            </div>
          )}

          {activeTab === 'users' && (
            <div className="admin-dashboard__tab-content">
              <UserManagement />
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="admin-dashboard__tab-content">
              <UserProfile />
            </div>
          )}
        </div>
      </main>

      <footer className="admin-dashboard__footer">
        <div className="admin-dashboard__footer-content">
          <div className="admin-dashboard__footer-left">
            <span className="admin-dashboard__footer-text">
              ⚠️ 仅用于授权安全测试 | 请遵守相关法律法规
            </span>
          </div>
          <div className="admin-dashboard__footer-right">
            <span className="admin-dashboard__footer-text">
              服务器: localhost:8088
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;