import React, { useState } from 'react';
import { 
  ClientList, 
  CommandPanel, 
  ResultDisplay, 
  PayloadGenerator,
  Badge,
  Button
} from './components';
import './App.css';

function App() {
  const [selectedClient, setSelectedClient] = useState(null);
  const [commandResults, setCommandResults] = useState([]);
  const [activeTab, setActiveTab] = useState('clients');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
    { id: 'payload', name: '载荷生成', icon: '🚀' }
  ];

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-content">
          <div className="app__header-left">
            <h1 className="app__title">
              🎯 XSS 攻击控制台
            </h1>
            <p className="app__subtitle">
              XSS 漏洞利用与安全测试平台
            </p>
          </div>
          <div className="app__header-right">
            <div className="app__connection-status">
              <span className="app__connection-label">API:</span>
              {getConnectionStatus()}
            </div>
            {selectedClient && (
              <div className="app__selected-client">
                <span className="app__selected-label">选中客户端:</span>
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

        <nav className="app__nav">
          <div className="app__nav-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`app__nav-tab ${
                  activeTab === tab.id ? 'app__nav-tab--active' : ''
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="app__nav-tab-icon">{tab.icon}</span>
                <span className="app__nav-tab-text">{tab.name}</span>
                {tab.badge && (
                  <Badge variant="danger" size="sm" className="app__nav-tab-badge">
                    {tab.badge}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="app__main">
        <div className="app__content">
          {activeTab === 'clients' && (
            <div className="app__tab-content">
              <ClientList
                onSelectClient={handleSelectClient}
                selectedClientId={selectedClient?.id}
                refreshTrigger={refreshTrigger}
              />
            </div>
          )}

          {activeTab === 'command' && (
            <div className="app__tab-content">
              <CommandPanel
                selectedClient={selectedClient}
                onCommandResult={handleCommandResult}
              />
            </div>
          )}

          {activeTab === 'results' && (
            <div className="app__tab-content">
              <ResultDisplay
                results={commandResults}
                onClearResults={handleClearResults}
              />
            </div>
          )}

          {activeTab === 'payload' && (
            <div className="app__tab-content">
              <PayloadGenerator />
            </div>
          )}
        </div>
      </main>

      <footer className="app__footer">
        <div className="app__footer-content">
          <div className="app__footer-left">
            <span className="app__footer-text">
              ⚠️ 仅用于授权安全测试 | 请遵守相关法律法规
            </span>
          </div>
          <div className="app__footer-right">
            <span className="app__footer-text">
              服务器: localhost:8088 | 客户端数: {commandResults.length > 0 ? '有数据' : '无数据'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;