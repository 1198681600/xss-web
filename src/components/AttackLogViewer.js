import React, { useState, useEffect } from 'react';
import { Button, Badge, Card } from './ui';
import attackLogService from '../services/attackLog';
import { formatTimestamp, formatDate } from '../utils/format';
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const decodeHtmlEntities = (text) => {
    if (typeof text !== 'string') return text;
    
    const entityMap = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&apos;': "'",
      '&#x27;': "'",
      '&#x2F;': '/',
      '&#47;': '/',
      '&#x3C;': '<',
      '&#60;': '<',
      '&#x3E;': '>',
      '&#62;': '>',
      '&nbsp;': ' '
    };
    
    return text.replace(/&[#\w]+;/g, (entity) => {
      return entityMap[entity] || entity;
    });
  };

  const parseJsonResult = (result) => {
    if (typeof result === 'string') {
      try {
        return JSON.parse(result);
      } catch {
        return null;
      }
    }
    if (typeof result === 'object' && result !== null) {
      return result;
    }
    return null;
  };

  const renderBasicJsonResult = (result) => {
    const parsed = parseJsonResult(result);
    if (!parsed || typeof parsed !== 'object') {
      return (
        <div className="attack-log-viewer__detail-section">
          <label className="attack-log-viewer__detail-label">执行结果:</label>
          <div className="attack-log-viewer__detail-value">
            <pre><code>{typeof result === 'string' ? decodeHtmlEntities(result) : JSON.stringify(result, null, 2)}</code></pre>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(typeof result === 'string' ? result : JSON.stringify(result, null, 2))}
            >
              📋
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="attack-log-viewer__detail-section">
        <label className="attack-log-viewer__detail-label">执行结果 (JSON格式):</label>
        <div className="attack-log-viewer__json-kv">
          {Object.entries(parsed).map(([key, value]) => (
            <div key={key} className="attack-log-viewer__json-item">
              <div className="attack-log-viewer__json-key">{getFieldDisplayName(key)}</div>
              <div className="attack-log-viewer__json-value">
                {typeof value === 'object' && value !== null ? (
                  <pre className="attack-log-viewer__json-object">{JSON.stringify(value, null, 2)}</pre>
                ) : (['cookies', 'localStorage', 'sessionStorage'].includes(key)) ? (
                  renderSpecialField(key, value)
                ) : key === 'timestamp' ? (
                  <span className="attack-log-viewer__json-text">{formatTimestamp(value)}</span>
                ) : (
                  <span className="attack-log-viewer__json-text">{decodeHtmlEntities(String(value))}</span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value))}
                  className="attack-log-viewer__copy-value-btn"
                >
                  📋
                </Button>
              </div>
            </div>
          ))}
          <div className="attack-log-viewer__json-actions">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(JSON.stringify(parsed, null, 2))}
            >
              📋 复制完整JSON
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const parseMapData = (mapString) => {
    // 解析Go map格式的数据，例如：map[key1:value1 key2:value2]
    const mapMatch = mapString.match(/map\[(.*?)\]$/);
    if (!mapMatch) return null;
    
    const content = mapMatch[1];
    const pairs = [];
    let current = '';
    let inBracket = 0;
    let inQuote = false;
    let quoteChar = '';
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      
      if ((char === '"' || char === "'") && content[i-1] !== '\\') {
        if (!inQuote) {
          inQuote = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuote = false;
          quoteChar = '';
        }
      }
      
      if (!inQuote) {
        if (char === '[' || char === '{') {
          inBracket++;
        } else if (char === ']' || char === '}') {
          inBracket--;
        }
      }
      
      if (char === ' ' && !inQuote && inBracket === 0) {
        if (current.trim()) {
          pairs.push(current.trim());
          current = '';
        }
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      pairs.push(current.trim());
    }
    
    const result = {};
    pairs.forEach(pair => {
      const colonIndex = pair.indexOf(':');
      if (colonIndex > 0) {
        const key = pair.substring(0, colonIndex);
        const value = pair.substring(colonIndex + 1);
        result[key] = value;
      }
    });
    
    return result;
  };

  const renderMapData = (result) => {
    const mapData = parseMapData(result);
    if (!mapData) return null;
    
    // 特殊处理的字段
    const specialFields = ['cookies', 'localStorage', 'sessionStorage'];
    
    return (
      <div className="attack-log-viewer__map-section">
        <label className="attack-log-viewer__detail-label">详细信息:</label>
        <div className="attack-log-viewer__map-container">
          {Object.entries(mapData).map(([key, value]) => {
            // 跳过screenshot字段，已在上方单独显示
            if (key === 'screenshot') return null;
            
            return (
              <div key={key} className="attack-log-viewer__map-item">
                <div className="attack-log-viewer__map-key">
                  {getFieldDisplayName(key)}
                </div>
                <div className="attack-log-viewer__map-value">
                  {specialFields.includes(key) ? 
                    renderSpecialField(key, value) : 
                    key === 'timestamp' ?
                      <span className="attack-log-viewer__map-simple-value">{formatTimestamp(value)}</span> :
                      <span className="attack-log-viewer__map-simple-value">{decodeHtmlEntities(String(value))}</span>
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getFieldDisplayName = (key) => {
    const fieldNames = {
      'clientIP': '🌐 客户端IP',
      'cookies': '🍪 Cookies',
      'localStorage': '💾 本地存储',
      'sessionStorage': '📦 会话存储', 
      'origin': '🏠 来源',
      'referrer': '🔗 引用页',
      'timestamp': '⏰ 时间戳',
      'url': '🌍 页面URL',
      'userAgent': '🖥️ 用户代理',
      'pageTitle': '📄 页面标题',
      'width': '📏 宽度',
      'height': '📏 高度',
      'executionTime': '⚡ 执行时间'
    };
    return fieldNames[key] || key;
  };

  const renderSpecialField = (key, value) => {
    if (key === 'cookies') {
      try {
        // 解析cookie字符串
        const cookies = value.split(';').map(cookie => {
          const [name, ...valueParts] = cookie.trim().split('=');
          return { name: name.trim(), value: valueParts.join('=') };
        });
        
        return (
          <div className="attack-log-viewer__cookies">
            {cookies.map((cookie, index) => (
              <div key={index} className="attack-log-viewer__cookie-item">
                <span className="attack-log-viewer__cookie-name">{decodeHtmlEntities(cookie.name)}</span>
                <span className="attack-log-viewer__cookie-value">{decodeHtmlEntities(cookie.value)}</span>
              </div>
            ))}
          </div>
        );
      } catch {
        return <span className="attack-log-viewer__map-simple-value">{decodeHtmlEntities(String(value))}</span>;
      }
    }
    
    if (key === 'localStorage' || key === 'sessionStorage') {
      try {
        // 解析嵌套的map格式，如：map[key1:value1 key2:value2]
        const storageData = parseMapData(value);
        if (storageData) {
          return (
            <div className="attack-log-viewer__storage">
              {Object.entries(storageData).map(([storageKey, storageValue]) => (
                <div key={storageKey} className="attack-log-viewer__storage-item">
                  <span className="attack-log-viewer__storage-key">{decodeHtmlEntities(storageKey)}</span>
                  <span className="attack-log-viewer__storage-value">{decodeHtmlEntities(String(storageValue))}</span>
                </div>
              ))}
            </div>
          );
        }
      } catch {
        // 继续执行，返回原始值
      }
      return <span className="attack-log-viewer__map-simple-value">{decodeHtmlEntities(String(value))}</span>;
    }
    
    return <span className="attack-log-viewer__map-simple-value">{value}</span>;
  };

  const renderScreenshot = (result) => {
    if (!result) return null;
    
    try {
      // 首先尝试解析JSON格式
      const parsed = JSON.parse(result);
      if (parsed.screenshot && typeof parsed.screenshot === 'string' && parsed.screenshot.startsWith('data:image/')) {
        return (
          <div className="attack-log-viewer__screenshot-section">
            <label className="attack-log-viewer__detail-label">屏幕截图:</label>
            <div className="attack-log-viewer__screenshot-container">
              <img 
                src={parsed.screenshot} 
                alt={`屏幕截图 - ${parsed.pageTitle || '未知页面'}`}
                className="attack-log-viewer__screenshot"
                onClick={() => window.open(parsed.screenshot, '_blank')}
                title="点击查看大图"
              />
              {parsed.pageTitle && (
                <div className="attack-log-viewer__screenshot-info">
                  <span>📄 页面标题: {parsed.pageTitle}</span>
                  {parsed.width && parsed.height && (
                    <span>📐 尺寸: {parsed.width} × {parsed.height}</span>
                  )}
                  {parsed.executionTime && (
                    <span>⏱️ 截图时间: {formatDate(parsed.executionTime)}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      }
    } catch (e) {
      // 如果不是JSON，尝试解析Go的map格式
      const screenshotMatch = result.match(/screenshot:(data:image\/[^;]+;base64,[^\s\]]+)/);
      if (screenshotMatch) {
        const screenshotData = screenshotMatch[1];
        const pageTitleMatch = result.match(/pageTitle:([^\s\]]+)/);
        const pageTitle = pageTitleMatch ? pageTitleMatch[1] : '未知页面';
        const widthMatch = result.match(/width:(\d+)/);
        const heightMatch = result.match(/height:(\d+)/);
        const executionTimeMatch = result.match(/executionTime:([^\s\]]+)/);
        
        return (
          <div className="attack-log-viewer__screenshot-section">
            <label className="attack-log-viewer__detail-label">屏幕截图:</label>
            <div className="attack-log-viewer__screenshot-container">
              <img 
                src={screenshotData} 
                alt={`屏幕截图 - ${pageTitle}`}
                className="attack-log-viewer__screenshot"
                onClick={() => window.open(screenshotData, '_blank')}
                title="点击查看大图"
              />
              <div className="attack-log-viewer__screenshot-info">
                <span>📄 页面标题: {pageTitle}</span>
                {widthMatch && heightMatch && (
                  <span>📐 尺寸: {widthMatch[1]} × {heightMatch[1]}</span>
                )}
                {executionTimeMatch && (
                  <span>⏱️ 截图时间: {formatDate(executionTimeMatch[1])}</span>
                )}
              </div>
            </div>
          </div>
        );
      }
    }
    return null;
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

                    {renderScreenshot(log.result)}
                    
                    {/* 根据命令类型和结果格式决定展示方式 */}
                    {log.result && log.result.startsWith('map[') ? (
                      renderMapData(log.result)
                    ) : log.command === 'basic' ? (
                      renderBasicJsonResult(log.result)
                    ) : (
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
                    )}

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