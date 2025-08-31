import React, { useState } from 'react';
import { Button, Badge } from './ui';
import { useAuth } from '../contexts/AuthContext';
import ClientList from './ClientList';
import './UserDashboard.css';

const UserDashboard = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { logout, user } = useAuth();

  const getConnectionStatus = () => {
    return <Badge variant="success">HTTP API</Badge>;
  };

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
      </header>

      <main className="user-dashboard__main">
        <div className="user-dashboard__content">
          <div className="user-dashboard__info-panel">
            <div className="user-dashboard__info-card">
              <h3>📋 权限说明</h3>
              <ul>
                <li>✅ 查看连接的客户端列表</li>
                <li>✅ 查看客户端基本信息</li>
                <li>❌ 执行攻击命令</li>
                <li>❌ 生成载荷代码</li>
                <li>❌ 用户管理</li>
              </ul>
              <p className="user-dashboard__info-note">
                如需更多权限，请联系管理员
              </p>
            </div>
          </div>

          <div className="user-dashboard__client-section">
            <div className="user-dashboard__section-header">
              <h2 className="user-dashboard__section-title">👥 客户端列表</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRefreshTrigger(prev => prev + 1)}
              >
                🔄 刷新
              </Button>
            </div>
            
            <div className="user-dashboard__client-list">
              <ClientList
                onSelectClient={() => {}} // 禁用选择功能
                selectedClientId={null}
                refreshTrigger={refreshTrigger}
                readonly={true} // 只读模式
              />
            </div>
          </div>
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