import React, { useState } from 'react';
import { Button, Badge } from './ui';
import { useAuth } from '../contexts/AuthContext';
import ClientList from './ClientList';
import CommandPanel from './CommandPanel';
import ResultDisplay from './ResultDisplay';
import PayloadGenerator from './PayloadGenerator';
import UserManagement from './UserManagement';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [commandResults, setCommandResults] = useState([]);
  const [activeTab, setActiveTab] = useState('clients');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { logout, user } = useAuth();

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    if (activeTab !== 'command') {
      setActiveTab('command');
    }
  };

  const handleCommandResult = (result) => {
    if (result && result.results && result.results.length > 0) {
      setCommandResults(prev => [...result.results, ...prev]);
      setActiveTab('results');
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleClearResults = () => {
    setCommandResults([]);
  };

  const getConnectionStatus = () => {
    return <Badge variant="success">HTTP API</Badge>;
  };

  const tabs = [
    { id: 'clients', name: '客户端管理', icon: '👥' },
    { id: 'command', name: '命令面板', icon: '⚡' },
    { id: 'results', name: '执行结果', icon: '📊', badge: commandResults.length > 0 ? commandResults.length : null },
    { id: 'payload', name: '载荷生成', icon: '🚀' },
    { id: 'users', name: '用户管理', icon: '👤' }
  ];

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard__header">
        <div className="admin-dashboard__header-content">
          <div className="admin-dashboard__header-left">
            <h1 className="admin-dashboard__title">
              🎯 XSS 攻击控制台 - 管理员
            </h1>
            <p className="admin-dashboard__subtitle">
              XSS 漏洞利用与安全测试平台
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
          {activeTab === 'clients' && (
            <div className="admin-dashboard__tab-content">
              <ClientList
                onSelectClient={handleSelectClient}
                selectedClientId={selectedClient?.id}
                refreshTrigger={refreshTrigger}
              />
            </div>
          )}

          {activeTab === 'command' && (
            <div className="admin-dashboard__tab-content">
              <CommandPanel
                selectedClient={selectedClient}
                onCommandResult={handleCommandResult}
              />
            </div>
          )}

          {activeTab === 'results' && (
            <div className="admin-dashboard__tab-content">
              <ResultDisplay
                results={commandResults}
                onClearResults={handleClearResults}
              />
            </div>
          )}

          {activeTab === 'payload' && (
            <div className="admin-dashboard__tab-content">
              <PayloadGenerator />
            </div>
          )}

          {activeTab === 'users' && (
            <div className="admin-dashboard__tab-content">
              <UserManagement />
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
              服务器: localhost:8088 | 客户端数: {commandResults.length > 0 ? '有数据' : '无数据'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;