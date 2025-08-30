import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Loading } from './ui';
import { useAuth } from '../contexts/AuthContext';
import SessionList from './SessionList';
import AttackLogViewer from './AttackLogViewer';
import projectService from '../services/project';
import './ProjectDetail.css';

const ProjectDetail = ({ 
  project, 
  onBack, 
  onEditProject, 
  onDeleteProject,
  refreshTrigger 
}) => {
  const [selectedSession, setSelectedSession] = useState(null);
  const [activeTab, setActiveTab] = useState('sessions');
  const [stats, setStats] = useState(null);
  const [payload, setPayload] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isAdmin } = useAuth();

  const loadProjectStats = async () => {
    if (!project?.id) return;
    
    try {
      const statsData = await projectService.getProjectStats(project.id);
      setStats(statsData);
    } catch (error) {
      console.error('获取项目统计失败:', error);
    }
  };

  const loadProjectPayload = async () => {
    if (!project?.id) return;
    
    setIsLoading(true);
    try {
      const payloadScript = await projectService.getProjectPayload(project.id);
      setPayload(payloadScript);
    } catch (error) {
      console.error('获取载荷失败:', error);
      setPayload('');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (project?.id) {
      loadProjectStats();
      if (activeTab === 'payload') {
        loadProjectPayload();
      }
    }
  }, [project?.id, activeTab]);

  const getStatusBadge = (status) => {
    return status === 'active' ? 
      <Badge variant="success">活跃</Badge> :
      <Badge variant="secondary">停用</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const copyPayload = () => {
    navigator.clipboard.writeText(payload);
  };

  const tabs = [
    { id: 'sessions', name: '会话列表', icon: '💻' },
    { id: 'logs', name: '攻击记录', icon: '📋' },
    { id: 'stats', name: '统计信息', icon: '📊' },
    { id: 'payload', name: '载荷代码', icon: '🚀' },
    { id: 'settings', name: '项目设置', icon: '⚙️' }
  ];

  if (!project) {
    return (
      <Card className="project-detail__empty">
        <div className="project-detail__empty-content">
          <h3>📁 请选择一个项目</h3>
          <p>从左侧项目列表中选择一个项目以查看详细信息</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="project-detail">
      <div className="project-detail__header">
        <div className="project-detail__header-left">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="project-detail__back-btn"
          >
            ← 返回项目列表
          </Button>
          
          <div className="project-detail__project-info">
            <div className="project-detail__title-row">
              <h1 className="project-detail__title">{project.name}</h1>
              <span className="project-detail__jid">{project.jid}</span>
              {getStatusBadge(project.status)}
            </div>
            <p className="project-detail__description">
              {project.description || '无描述'}
            </p>
          </div>
        </div>
        
        <div className="project-detail__header-right">
          {isAdmin() && (
            <div className="project-detail__actions">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditProject(project)}
              >
                ✏️ 编辑
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDeleteProject(project)}
              >
                🗑️ 删除
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="project-detail__meta">
        <div className="project-detail__meta-item">
          <span className="project-detail__meta-label">目标URL:</span>
          <a 
            href={project.target_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="project-detail__meta-value project-detail__meta-link"
          >
            {project.target_url}
          </a>
        </div>
        <div className="project-detail__meta-item">
          <span className="project-detail__meta-label">分组:</span>
          <span className="project-detail__meta-value">{project.group}</span>
        </div>
        <div className="project-detail__meta-item">
          <span className="project-detail__meta-label">创建时间:</span>
          <span className="project-detail__meta-value">
            {formatDate(project.created_at)}
          </span>
        </div>
        <div className="project-detail__meta-item">
          <span className="project-detail__meta-label">启用模块:</span>
          <div className="project-detail__modules">
            {(project.enabled_modules || []).map((module) => (
              <Badge key={module} variant="outline" size="sm">
                {module}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="project-detail__tabs">
        <nav className="project-detail__nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`project-detail__tab ${
                activeTab === tab.id ? 'project-detail__tab--active' : ''
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="project-detail__tab-icon">{tab.icon}</span>
              <span className="project-detail__tab-text">{tab.name}</span>
            </button>
          ))}
        </nav>

        <div className="project-detail__tab-content">
          {activeTab === 'sessions' && (
            <SessionList
              projectId={project.id}
              onSelectSession={setSelectedSession}
              selectedSessionId={selectedSession?.id}
              refreshTrigger={refreshTrigger}
            />
          )}

          {activeTab === 'logs' && (
            <AttackLogViewer
              projectId={project.id}
              title="项目攻击记录"
            />
          )}

          {activeTab === 'stats' && (
            <div className="project-detail__stats">
              {stats ? (
                <div className="project-detail__stats-grid">
                  <Card className="project-detail__stat-card">
                    <h4>📊 会话统计</h4>
                    <div className="project-detail__stat-items">
                      <div className="project-detail__stat-item">
                        <span>总会话数:</span>
                        <Badge variant="primary">{stats.total_sessions}</Badge>
                      </div>
                      <div className="project-detail__stat-item">
                        <span>活跃会话:</span>
                        <Badge variant="success">{stats.active_sessions}</Badge>
                      </div>
                      <div className="project-detail__stat-item">
                        <span>今日新增:</span>
                        <Badge variant="info">{stats.today_sessions}</Badge>
                      </div>
                      <div className="project-detail__stat-item">
                        <span>唯一IP:</span>
                        <Badge variant="outline">{stats.unique_ips}</Badge>
                      </div>
                    </div>
                  </Card>

                  {stats.browser_stats && (
                    <Card className="project-detail__stat-card">
                      <h4>🌐 浏览器分布</h4>
                      <div className="project-detail__browser-stats">
                        {Object.entries(stats.browser_stats).map(([browser, count]) => (
                          <div key={browser} className="project-detail__browser-item">
                            <span className="project-detail__browser-name">{browser}:</span>
                            <Badge variant="outline" size="sm">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="project-detail__stats-loading">
                  <Loading />
                  <p>加载统计数据...</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'payload' && (
            <div className="project-detail__payload">
              <Card className="project-detail__payload-card">
                <div className="project-detail__payload-header">
                  <h4>🚀 项目载荷脚本</h4>
                  <div className="project-detail__payload-actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadProjectPayload}
                    >
                      🔄 刷新
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={copyPayload}
                      disabled={!payload}
                    >
                      📋 复制
                    </Button>
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="project-detail__payload-loading">
                    <Loading />
                    <p>生成载荷脚本...</p>
                  </div>
                ) : (
                  <div className="project-detail__payload-content">
                    <pre className="project-detail__payload-code">
                      <code>{payload || '暂无载荷代码'}</code>
                    </pre>
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="project-detail__settings">
              <Card className="project-detail__settings-card">
                <h4>⚙️ 项目配置</h4>
                <div className="project-detail__settings-grid">
                  <div className="project-detail__setting-item">
                    <span className="project-detail__setting-label">项目名称:</span>
                    <span className="project-detail__setting-value">{project.name}</span>
                  </div>
                  <div className="project-detail__setting-item">
                    <span className="project-detail__setting-label">项目编号:</span>
                    <span className="project-detail__setting-value">{project.jid}</span>
                  </div>
                  <div className="project-detail__setting-item">
                    <span className="project-detail__setting-label">目标URL:</span>
                    <span className="project-detail__setting-value">{project.target_url}</span>
                  </div>
                  <div className="project-detail__setting-item">
                    <span className="project-detail__setting-label">项目分组:</span>
                    <span className="project-detail__setting-value">{project.group}</span>
                  </div>
                  <div className="project-detail__setting-item">
                    <span className="project-detail__setting-label">项目状态:</span>
                    <span className="project-detail__setting-value">
                      {getStatusBadge(project.status)}
                    </span>
                  </div>
                  <div className="project-detail__setting-item">
                    <span className="project-detail__setting-label">创建者ID:</span>
                    <span className="project-detail__setting-value">{project.owner_id}</span>
                  </div>
                </div>
                
                {isAdmin() && (
                  <div className="project-detail__settings-actions">
                    <Button
                      variant="primary"
                      onClick={() => onEditProject(project)}
                    >
                      编辑项目配置
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;