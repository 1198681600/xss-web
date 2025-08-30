import React, { useState, useEffect } from 'react';
import { Button, Badge, Card } from './ui';
import attackLogService from '../services/attackLog';
import { toast } from './Toast';
import './AttackLogViewer.css';

const AttackLogViewer = ({ sessionId, projectId, title = "攻击记录" }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [expandedLogs, setExpandedLogs] = useState(new Set());
  const limit = 20;

  useEffect(() => {
    loadLogs();
  }, [sessionId, projectId, currentPage]);

  const loadLogs = async () => {
    if (!sessionId && !projectId) return;
    
    setLoading(true);
    try {
      let data;
      if (sessionId) {
        data = await attackLogService.getSessionLogs(sessionId, currentPage, limit);
      } else {
        data = await attackLogService.getProjectLogs(projectId, currentPage, limit);
      }
      
      setLogs(data.logs);
      setTotalLogs(data.total);
      setTotalPages(Math.ceil(data.total / limit));
    } catch (error) {
      console.error('加载攻击记录失败:', error);
      toast.error(error.message || '加载攻击记录失败');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (logId) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('已复制到剪贴板');
    }).catch(() => {
      toast.error('复制失败');
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return (
      <div className="attack-log-viewer__pagination">
        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          上一页
        </Button>
        
        {pages.map((page, index) => (
          page === '...' ? (
            <span key={index} className="attack-log-viewer__pagination-ellipsis">...</span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          )
        ))}
        
        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          下一页
        </Button>
      </div>
    );
  };

  return (
    <div className="attack-log-viewer">
      <div className="attack-log-viewer__header">
        <div className="attack-log-viewer__header-left">
          <h3 className="attack-log-viewer__title">📋 {title}</h3>
          <span className="attack-log-viewer__count">
            共 {totalLogs} 条记录
          </span>
        </div>
        <div className="attack-log-viewer__header-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadLogs}
            disabled={loading}
          >
            🔄 刷新
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="attack-log-viewer__loading">
          <div className="attack-log-viewer__spinner"></div>
          <span>加载中...</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="attack-log-viewer__empty">
          <div className="attack-log-viewer__empty-icon">📭</div>
          <h4>暂无攻击记录</h4>
          <p>当有受害者连接时，攻击记录将在这里显示</p>
        </div>
      ) : (
        <>
          <div className="attack-log-viewer__list">
            {logs.map((log) => (
              <Card 
                key={log.id} 
                className={`attack-log-viewer__item ${
                  log.status === 'error' ? 'attack-log-viewer__item--error' : ''
                }`}
              >
                <div className="attack-log-viewer__item-header">
                  <div className="attack-log-viewer__item-info">
                    <div className="attack-log-viewer__item-command">
                      <span className="attack-log-viewer__command-name">
                        {attackLogService.getCommandDisplayName(log.command)}
                      </span>
                      <Badge 
                        variant={attackLogService.getStatusBadgeVariant(log.status)} 
                        size="sm"
                      >
                        {log.status === 'success' ? '成功' : '失败'}
                      </Badge>
                      <Badge 
                        variant={attackLogService.getTypeBadgeVariant(log.type)} 
                        size="sm"
                      >
                        {attackLogService.getTypeDisplayName(log.type)}
                      </Badge>
                    </div>
                    <div className="attack-log-viewer__item-meta">
                      <span className="attack-log-viewer__meta-item">
                        🕒 {attackLogService.formatLogTime(log.created_at)}
                      </span>
                      {log.session && (
                        <span className="attack-log-viewer__meta-item">
                          📱 {log.session.jid}
                        </span>
                      )}
                      <span className="attack-log-viewer__meta-item">
                        🌐 {log.ip}
                      </span>
                    </div>
                  </div>
                  <div className="attack-log-viewer__item-actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(log.id)}
                    >
                      {expandedLogs.has(log.id) ? '收起' : '详情'}
                    </Button>
                  </div>
                </div>

                {expandedLogs.has(log.id) && (
                  <div className="attack-log-viewer__item-details">
                    {log.url && (
                      <div className="attack-log-viewer__detail-section">
                        <label className="attack-log-viewer__detail-label">页面URL:</label>
                        <div className="attack-log-viewer__detail-value">
                          <code>{log.url}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(log.url)}
                          >
                            📋
                          </Button>
                        </div>
                      </div>
                    )}

                    {log.params && log.params !== '{}' && (
                      <div className="attack-log-viewer__detail-section">
                        <label className="attack-log-viewer__detail-label">命令参数:</label>
                        <div className="attack-log-viewer__detail-value">
                          <pre><code>{attackLogService.formatLogResult(log.params)}</code></pre>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(log.params)}
                          >
                            📋
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="attack-log-viewer__detail-section">
                      <label className="attack-log-viewer__detail-label">执行结果:</label>
                      <div className="attack-log-viewer__detail-value">
                        <pre><code>{attackLogService.formatLogResult(log.result)}</code></pre>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(log.result)}
                        >
                          📋
                        </Button>
                      </div>
                    </div>

                    {log.user_agent && (
                      <div className="attack-log-viewer__detail-section">
                        <label className="attack-log-viewer__detail-label">用户代理:</label>
                        <div className="attack-log-viewer__detail-value">
                          <code className="attack-log-viewer__user-agent">{log.user_agent}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(log.user_agent)}
                          >
                            📋
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>

          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default AttackLogViewer;