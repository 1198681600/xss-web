import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Loading } from './ui';
import projectService from '../services/project';
import './ProjectList.css';

const ProjectList = ({ onSelectProject, selectedProjectId, refreshTrigger, onCreateProject, onEditProject, onDeleteProject }) => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadProjects = async () => {
    setIsLoading(true);
    setError('');
    try {
      const projectList = await projectService.getProjects();
      setProjects(projectList || []);
    } catch (error) {
      setError(error.message);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [refreshTrigger]);

  const getStatusBadge = (status) => {
    return status === 'active' ? 
      <Badge variant="success" size="sm">活跃</Badge> :
      <Badge variant="secondary" size="sm">停用</Badge>;
  };

  const getSessionsBadge = (totalSessions, activeSessions) => {
    return (
      <div className="project-list__sessions">
        <Badge variant="primary" size="sm">
          全部 {totalSessions}
        </Badge>
        <Badge variant="success" size="sm">
          活跃 {activeSessions}
        </Badge>
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEditProject = (project) => {
    if (onEditProject) {
      onEditProject(project);
    }
  };

  const handleDeleteProject = (project) => {
    if (onDeleteProject) {
      onDeleteProject(project);
    }
  };

  if (isLoading) {
    return (
      <Card className="project-list__loading">
        <Loading />
        <p>加载项目列表...</p>
      </Card>
    );
  }

  return (
    <div className="project-list">
      <div className="project-list__header">
        <div className="project-list__header-left">
          <h2 className="project-list__title">📁 项目管理</h2>
          <span className="project-list__count">
            共 {projects.length} 个项目
          </span>
        </div>
        <div className="project-list__header-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadProjects}
          >
            🔄 刷新
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onCreateProject}
          >
            + 新建项目
          </Button>
        </div>
      </div>

      {error && (
        <div className="project-list__error">
          ⚠️ {error}
        </div>
      )}

      {projects.length === 0 ? (
        <Card className="project-list__empty">
          <div className="project-list__empty-content">
            <h3>📂 暂无项目</h3>
            <p>点击"新建项目"开始创建您的第一个播放器项目</p>
          </div>
        </Card>
      ) : (
        <div className="project-list__grid">
          {projects.map((project) => (
            <Card
              key={project.id}
              className={`project-list__card ${
                selectedProjectId === project.id ? 'project-list__card--selected' : ''
              }`}
              onClick={() => onSelectProject(project)}
            >
              <div className="project-list__card-header">
                <div className="project-list__card-title">
                  <h3>{project.name}</h3>
                  <span className="project-list__jid">{project.jid}</span>
                </div>
                <div className="project-list__card-status">
                  {getStatusBadge(project.status)}
                </div>
              </div>

              <div className="project-list__card-content">
                <p className="project-list__description">
                  {project.description || '无描述'}
                </p>
                
                <div className="project-list__info-grid">
                  <div className="project-list__info-item">
                    <span className="project-list__info-label">分组:</span>
                    <span className="project-list__info-value">{project.group}</span>
                  </div>
                  
                  <div className="project-list__info-item">
                    <span className="project-list__info-label">创建时间:</span>
                    <span className="project-list__info-value">
                      {formatDate(project.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="project-list__card-footer">
                <div className="project-list__sessions-info">
                  {getSessionsBadge(project.session_count || 0, project.active_sessions || 0)}
                </div>
                
                <div className="project-list__modules">
                  <span className="project-list__modules-label">模块:</span>
                  <div className="project-list__modules-list">
                    {(project.enabled_modules || []).slice(0, 3).map((module) => (
                      <Badge key={module} variant="outline" size="xs">
                        {module}
                      </Badge>
                    ))}
                    {(project.enabled_modules || []).length > 3 && (
                      <Badge variant="outline" size="xs">
                        +{(project.enabled_modules || []).length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="project-list__card-actions">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditProject(project);
                  }}
                  className="project-list__action-btn"
                >
                  ✏️ 编辑
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(project);
                  }}
                  className="project-list__action-btn"
                >
                  🗑️ 删除
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;