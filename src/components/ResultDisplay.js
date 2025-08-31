import React, { useState } from 'react';
import { Card, Badge, Button } from './ui';
import { formatTimestamp, formatClientId, formatResult } from '../utils/format';
import './ResultDisplay.css';

const ResultDisplay = ({ results = [], onClearResults }) => {
  const [expandedResults, setExpandedResults] = useState(new Set());

  const toggleExpand = (resultId) => {
    setExpandedResults(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(resultId)) {
        newExpanded.delete(resultId);
      } else {
        newExpanded.add(resultId);
      }
      return newExpanded;
    });
  };

  const copyToClipboard = async (text) => {
    try {
      // 优先使用现代的 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // 降级方案：使用传统的 execCommand
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!successful) {
          throw new Error('execCommand failed');
        }
      }
      
      alert('已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      prompt('复制失败，请手动复制以下内容:', text);
    }
  };

  const exportResults = () => {
    const data = {
      timestamp: new Date().toISOString(),
      results: results.map(result => ({
        command: result.command,
        client_id: result.client_id,
        result: result.result,
        url: result.url,
        timestamp: result.timestamp
      }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xss-results-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCommandBadge = (command) => {
    const commandMap = {
      cookie: { variant: 'warning', text: 'Cookie' },
      location: { variant: 'info', text: '位置' },
      localStorage: { variant: 'secondary', text: '本地存储' },
      sessionStorage: { variant: 'secondary', text: '会话存储' },
      forms: { variant: 'primary', text: '表单' },
      userAgent: { variant: 'info', text: 'UA' },
      dom: { variant: 'success', text: 'DOM' },
      eval: { variant: 'danger', text: 'JS执行' },
      xhr: { variant: 'primary', text: 'HTTP请求' },
      screenshot: { variant: 'success', text: '截图' },
      html: { variant: 'info', text: 'HTML' }
    };

    const commandInfo = commandMap[command] || { variant: 'default', text: command };
    return <Badge variant={commandInfo.variant}>{commandInfo.text}</Badge>;
  };

  if (results.length === 0) {
    return (
      <Card title="执行结果" className="result-display">
        <div className="result-display__empty">
          <p>暂无执行结果</p>
          <p className="result-display__empty-hint">
            执行命令后，结果将显示在这里
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="执行结果" className="result-display">
      <div className="result-display__header">
        <div className="result-display__stats">
          共 {results.length} 条结果
        </div>
        <div className="result-display__actions">
          <Button
            variant="secondary"
            size="sm"
            onClick={exportResults}
          >
            导出 JSON
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onClearResults}
          >
            清空结果
          </Button>
        </div>
      </div>

      <div className="result-display__list">
        {results.map((result, index) => {
          const resultId = `${result.client_id}-${result.command}-${result.timestamp}`;
          const isExpanded = expandedResults.has(resultId);
          
          return (
            <div key={resultId} className="result-item">
              <div className="result-item__header">
                <div className="result-item__meta">
                  <div className="result-item__client">
                    {formatClientId(result.client_id)}
                  </div>
                  {getCommandBadge(result.command)}
                  <div className="result-item__time">
                    {formatTimestamp(result.timestamp)}
                  </div>
                </div>
                <div className="result-item__controls">
                  <button
                    className="result-item__copy-btn"
                    onClick={() => copyToClipboard(typeof result.result === 'string' ? result.result : JSON.stringify(result.result, null, 2))}
                    title="复制结果"
                  >
                    📋
                  </button>
                  <button
                    className="result-item__expand-btn"
                    onClick={() => toggleExpand(resultId)}
                    title={isExpanded ? '收起' : '展开'}
                  >
                    {isExpanded ? '▼' : '▶'}
                  </button>
                </div>
              </div>

              {result.url && (
                <div className="result-item__url">
                  <span className="result-item__url-label">来源:</span>
                  <span className="result-item__url-value">{result.url}</span>
                </div>
              )}

              <div className="result-item__content">
                <div className="result-item__result">
                  {isExpanded ? (
                    <pre className="result-item__result-full">
                      {typeof result.result === 'string' 
                        ? result.result 
                        : JSON.stringify(result.result, null, 2)
                      }
                    </pre>
                  ) : (
                    <div className="result-item__result-preview">
                      {formatResult(result.result)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ResultDisplay;