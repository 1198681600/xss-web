import React, { useState } from 'react';
import { Card, Badge, Button } from './ui';
import AttackLogViewer from './AttackLogViewer';
import CommandPanel from './CommandPanel';
import ResultDisplay from './ResultDisplay';
import './SessionDetail.css';

const SessionDetail = ({ session, onBack, projectId }) => {
  const [activeTab, setActiveTab] = useState('control');
  const [commandResults, setCommandResults] = useState([]);

  const getBrowserIcon = (userAgent) => {
    if (userAgent.includes('Chrome')) return '🟢';
    if (userAgent.includes('Firefox')) return '🟠';
    if (userAgent.includes('Safari')) return '🔵';
    if (userAgent.includes('Edge')) return '🟦';
    return '🌐';
  };

  const getBrowserName = (userAgent) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'online': { variant: 'success', text: '在线' },
      'offline': { variant: 'secondary', text: '离线' }
    };
    
    const config = statusMap[status] || { variant: 'secondary', text: '未知' };
    return <Badge variant={config.variant} size="sm">{config.text}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleCommandResult = (result) => {
    setCommandResults(prev => [result, ...prev]);
  };

  const handleClearResults = () => {
    setCommandResults([]);
  };

  const tabs = [
    { id: 'control', name: '手工控制', icon: '🎯' },
    { id: 'logs', name: '攻击记录', icon: '📋' }
  ];

  const sessionAsClient = {
    id: session.jid,
    ip: session.ip,
    userAgent: session.user_agent,
    status: session.status
  };

  return (
    <div className="session-detail">
      <div className="session-detail__header">
        <div className="session-detail__header-left">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="session-detail__back-btn"
          >
            ← 返回会话列表
          </Button>
          
          <div className="session-detail__session-info">
            <div className="session-detail__title-row">
              <h1 className="session-detail__title">
                📱 会话 {session.jid}
              </h1>
              {getStatusBadge(session.status)}
            </div>
            <div className="session-detail__meta">
              <span className="session-detail__browser">
                {getBrowserIcon(session.user_agent)} {getBrowserName(session.user_agent)}
              </span>
              <span className="session-detail__ip">IP: {session.ip}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="session-detail__info">
        <Card className="session-detail__info-card">
          <div className="session-detail__info-grid">
            <div className="session-detail__info-item">
              <span className="session-detail__info-label">首次上线:</span>
              <span className="session-detail__info-value">
                {formatDate(session.first_online)}
              </span>
            </div>
            <div className="session-detail__info-item">
              <span className="session-detail__info-label">最后上线:</span>
              <span className="session-detail__info-value">
                {formatDate(session.last_online)}
              </span>
            </div>
            <div className="session-detail__info-item">
              <span className="session-detail__info-label">连接次数:</span>
              <span className="session-detail__info-value">
                <Badge variant="outline" size="sm">
                  {session.connection_count}
                </Badge>
              </span>
            </div>
            <div className="session-detail__info-item">
              <span className="session-detail__info-label">Cookie:</span>
              <span className="session-detail__info-value" title={session.cookie}>
                {session.cookie ? `(${session.cookie.length}字符)` : '无'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="session-detail__tabs">
        <nav className="session-detail__nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`session-detail__tab ${
                activeTab === tab.id ? 'session-detail__tab--active' : ''
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="session-detail__tab-icon">{tab.icon}</span>
              <span className="session-detail__tab-text">{tab.name}</span>
            </button>
          ))}
        </nav>

        <div className="session-detail__tab-content">
          {activeTab === 'control' && (
            <div className="session-detail__control">
              <div className="session-detail__control-grid">
                <CommandPanel
                  selectedClient={sessionAsClient}
                  onCommandResult={handleCommandResult}
                  projectId={projectId}
                />
              </div>
              <ResultDisplay
                results={commandResults}
                selectedClient={sessionAsClient}
                onClearResults={handleClearResults}
              />
            </div>
          )}

          {activeTab === 'logs' && (
            <AttackLogViewer
              sessionId={session.id}
              title={`会话 ${session.jid} 攻击记录`}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;