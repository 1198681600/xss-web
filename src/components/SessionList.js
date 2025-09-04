import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Loading } from './ui';
import SessionDetail from './SessionDetail';
import projectService from '../services/project';
import apiService from '../services/api';
import { formatDate } from '../utils/format';
import './SessionList.css';

const SessionList = ({ projectId, refreshTrigger }) => {
  const [sessions, setSessions] = useState([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [activeSessions, setActiveSessions] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);

  const loadSessions = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setError('');
    try {
      const data = await projectService.getProjectSessions(projectId);
      setSessions(data.sessions || []);
      setTotalSessions(data.total_sessions || 0);
      setActiveSessions(data.active_sessions || 0);
    } catch (error) {
      setError(error.message);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, refreshTrigger]);

  const getStatusBadge = (status) => {
    const statusMap = {
      'online': { variant: 'success', text: '在线' },
      'offline': { variant: 'secondary', text: '离线' }
    };
    
    const config = statusMap[status] || { variant: 'secondary', text: '未知' };
    return <Badge variant={config.variant} size="sm">{config.text}</Badge>;
  };

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

  // 使用统一的formatDate函数，但缩短显示格式
  const formatSessionDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const handleSessionClick = (session) => {
    setSelectedSession(session);
  };

  const handleBackToSessions = () => {
    setSelectedSession(null);
  };

  const handleDeleteSession = async (sessionId, event) => {
    event.stopPropagation();
    
    if (!window.confirm('确定要删除这个会话吗？')) {
      return;
    }

    try {
      await apiService.deleteSession(sessionId);
      
      // Refresh sessions list after delete
      await loadSessions();
    } catch (error) {
      setError('删除会话失败: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="session-list__loading">
        <Loading />
        <p>加载会话数据...</p>
      </div>
    );
  }

  if (selectedSession) {
    return (
      <SessionDetail
        session={selectedSession}
        onBack={handleBackToSessions}
        projectId={projectId}
      />
    );
  }

  return (
    <div className="session-list">
      <div className="session-list__header">
        <div className="session-list__stats">
          <Card className="session-list__stat-card session-list__stat-card--total">
            <div className="session-list__stat-content">
              <span className="session-list__stat-label">全部会话</span>
              <span className="session-list__stat-value">{totalSessions}</span>
            </div>
          </Card>
          
          <Card className="session-list__stat-card session-list__stat-card--active">
            <div className="session-list__stat-content">
              <span className="session-list__stat-label">活跃会话</span>
              <span className="session-list__stat-value">{activeSessions}</span>
            </div>
          </Card>
        </div>

        <div className="session-list__actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadSessions}
          >
            🔄 刷新
          </Button>
        </div>
      </div>

      {error && (
        <div className="session-list__error">
          ⚠️ {error}
        </div>
      )}

      {sessions.length === 0 ? (
        <Card className="session-list__empty">
          <div className="session-list__empty-content">
            <h3>💻 暂无会话</h3>
            <p>项目暂时没有活跃的XSS会话连接</p>
          </div>
        </Card>
      ) : (
        <div className="session-list__table-container">
          <div className="session-list__table-header">
            <div className="session-list__table-row session-list__table-row--header">
              <div className="session-list__cell session-list__cell--jid">JID</div>
              <div className="session-list__cell session-list__cell--ip">IP</div>
              <div className="session-list__cell session-list__cell--url">URL</div>
              <div className="session-list__cell session-list__cell--browser">浏览器</div>
              <div className="session-list__cell session-list__cell--status">状态</div>
              <div className="session-list__cell session-list__cell--time">首次上线</div>
              <div className="session-list__cell session-list__cell--last">上线时间</div>
              <div className="session-list__cell session-list__cell--count">连接</div>
              <div className="session-list__cell session-list__cell--actions">操作</div>
            </div>
          </div>
          
          <div className="session-list__table-body">
            {sessions.map((session, index) => (
              <div
                key={session.id}
                className="session-list__table-row session-list__table-row--clickable"
                onClick={() => handleSessionClick(session)}
                title="点击查看会话详情"
              >
                <div className="session-list__cell session-list__cell--jid">
                  <Badge variant="primary" size="sm">{session.jid}</Badge>
                </div>
                <div className="session-list__cell session-list__cell--ip">
                  <span className="session-list__ip">{session.ip}</span>
                </div>
                <div className="session-list__cell session-list__cell--url">
                  <span className="session-list__url" title={session.url}>
                    {session.url || '--'}
                  </span>
                </div>
                <div className="session-list__cell session-list__cell--browser">
                  <div className="session-list__browser">
                    <span className="session-list__browser-icon">
                      {getBrowserIcon(session.user_agent)}
                    </span>
                    <span className="session-list__browser-name">
                      {getBrowserName(session.user_agent)}
                    </span>
                  </div>
                </div>
                <div className="session-list__cell session-list__cell--status">
                  {getStatusBadge(session.status)}
                </div>
                <div className="session-list__cell session-list__cell--time">
                  <span className="session-list__time">
                    {formatSessionDate(session.first_online)}
                  </span>
                </div>
                <div className="session-list__cell session-list__cell--last">
                  <span className="session-list__time">
                    {formatSessionDate(session.last_online)}
                  </span>
                </div>
                <div className="session-list__cell session-list__cell--count">
                  <Badge variant="outline" size="sm">
                    {session.connection_count}
                  </Badge>
                </div>
                <div className="session-list__cell session-list__cell--actions">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(event) => handleDeleteSession(session.id, event)}
                    title="删除会话"
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionList;