import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Loading } from './ui';
import projectService from '../services/project';
import './SessionList.css';

const SessionList = ({ projectId, onSelectSession, selectedSessionId, refreshTrigger }) => {
  const [sessions, setSessions] = useState([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [activeSessions, setActiveSessions] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateUrl = (url, maxLength = 40) => {
    return url.length > maxLength ? `${url.substring(0, maxLength)}...` : url;
  };

  if (isLoading) {
    return (
      <div className="session-list__loading">
        <Loading />
        <p>加载会话数据...</p>
      </div>
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
              <div className="session-list__cell session-list__cell--browser">浏览器</div>
              <div className="session-list__cell session-list__cell--url">URL</div>
              <div className="session-list__cell session-list__cell--status">状态</div>
              <div className="session-list__cell session-list__cell--group">分组</div>
              <div className="session-list__cell session-list__cell--notes">备注</div>
              <div className="session-list__cell session-list__cell--time">首次上线</div>
              <div className="session-list__cell session-list__cell--last">上线时间</div>
              <div className="session-list__cell session-list__cell--count">连接</div>
              <div className="session-list__cell session-list__cell--cookie">Cookie</div>
              <div className="session-list__cell session-list__cell--events">事件类型</div>
            </div>
          </div>
          
          <div className="session-list__table-body">
            {sessions.map((session, index) => (
              <div
                key={session.id}
                className={`session-list__table-row ${
                  selectedSessionId === session.id ? 'session-list__table-row--selected' : ''
                }`}
                onClick={() => onSelectSession(session)}
              >
                <div className="session-list__cell session-list__cell--jid">
                  <Badge variant="primary" size="sm">{session.jid}</Badge>
                </div>
                <div className="session-list__cell session-list__cell--ip">
                  <span className="session-list__ip">{session.ip}</span>
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
                <div className="session-list__cell session-list__cell--url">
                  <span className="session-list__url" title={session.url}>
                    {truncateUrl(session.url)}
                  </span>
                </div>
                <div className="session-list__cell session-list__cell--status">
                  {getStatusBadge(session.status)}
                </div>
                <div className="session-list__cell session-list__cell--group">
                  <span className="session-list__group">{session.group}</span>
                </div>
                <div className="session-list__cell session-list__cell--notes">
                  <span className="session-list__notes">{session.notes}</span>
                </div>
                <div className="session-list__cell session-list__cell--time">
                  <span className="session-list__time">
                    {formatDate(session.first_online)}
                  </span>
                </div>
                <div className="session-list__cell session-list__cell--last">
                  <span className="session-list__time">
                    {formatDate(session.last_online)}
                  </span>
                </div>
                <div className="session-list__cell session-list__cell--count">
                  <Badge variant="outline" size="sm">
                    {session.connection_count}
                  </Badge>
                </div>
                <div className="session-list__cell session-list__cell--cookie">
                  <Button
                    variant="ghost"
                    size="xs"
                    className="session-list__cookie-btn"
                    title={session.cookie}
                  >
                    查看 ({session.cookie ? session.cookie.length : 0})
                  </Button>
                </div>
                <div className="session-list__cell session-list__cell--events">
                  <span className="session-list__event-type">{session.event_type}</span>
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