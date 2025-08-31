import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Loading } from './ui';
import { useAuth } from '../contexts/AuthContext';
import SessionList from './SessionList';
import projectService from '../services/project';
import './ProjectDetail.css';

const ProjectDetail = ({ 
  project, 
  onBack, 
  onEditProject, 
  onDeleteProject,
  refreshTrigger 
}) => {
  const [activeTab, setActiveTab] = useState('sessions');
  const [payload, setPayload] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isAdmin } = useAuth();


  const loadProjectPayload = async () => {
    if (!project?.id) return;
    
    setIsLoading(true);
    try {
      const payloadScript = await projectService.getProjectPayload(project.jid);
      setPayload(payloadScript);
    } catch (error) {
      console.error('获取载荷失败:', error);
      setPayload('');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (project?.id && activeTab === 'payload') {
      loadProjectPayload();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
              projectId={project.jid}
              refreshTrigger={refreshTrigger}
            />
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