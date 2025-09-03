import React, { useState } from 'react';
import { Button, Badge } from './ui';
import { useAuth } from '../contexts/AuthContext';
import ProjectList from './ProjectList';
import ProjectDetail from './ProjectDetail';
import ProjectForm from './ProjectForm';
import UserProfile from './UserProfile';
import projectService from '../services/project';
import './ProjectDashboard.css';

const ProjectDashboard = ({ onProjectSelect, hideHeader = false }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('projects');
  const { logout, user, isAdmin } = useAuth();

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setShowForm(false);
    setEditingProject(null);
    if (onProjectSelect) {
      onProjectSelect(project);
    }
  };

  const handleCreateProject = () => {
    setShowForm(true);
    setEditingProject(null);
    setSelectedProject(null);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowForm(true);
    setSelectedProject(null);
  };

  const handleSaveProject = (savedProject) => {
    setShowForm(false);
    setEditingProject(null);
    setRefreshTrigger(prev => prev + 1);
    if (savedProject) {
      setSelectedProject(savedProject);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  const handleDeleteProject = (project) => {
    setDeleteConfirm(project);
  };

  const confirmDeleteProject = async () => {
    if (!deleteConfirm) return;
    
    try {
      await projectService.deleteProject(deleteConfirm.id);
      setDeleteConfirm(null);
      setSelectedProject(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('删除项目失败:', error);
    }
  };

  const cancelDeleteProject = () => {
    setDeleteConfirm(null);
  };

  const handleBackToList = () => {
    setSelectedProject(null);
    setShowForm(false);
    setEditingProject(null);
  };

  const getConnectionStatus = () => {
    return <Badge variant="success">HTTP API</Badge>;
  };

  const tabs = [
    { id: 'projects', name: '项目管理', icon: '📁' },
    { id: 'profile', name: '个人设置', icon: '⚙️' }
  ];

  return (
    <div className="project-dashboard">
      {!hideHeader && (
        <header className="project-dashboard__header">
          <div className="project-dashboard__header-content">
            <div className="project-dashboard__header-left">
              <h1 className="project-dashboard__title">
                🎯 播放器平台
              </h1>
              <p className="project-dashboard__subtitle">
                播放器项目管理
              </p>
            </div>
            <div className="project-dashboard__header-right">
              <div className="project-dashboard__user-info">
                <span className="project-dashboard__welcome">
                  欢迎, {user?.username}
                </span>
                <Badge variant={isAdmin() ? 'danger' : 'primary'} size="sm">
                  {isAdmin() ? '管理员' : '普通用户'}
                </Badge>
              </div>
              <div className="project-dashboard__connection-status">
                <span className="project-dashboard__connection-label">API:</span>
                {getConnectionStatus()}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
              >
                退出登录
              </Button>
            </div>
          </div>

          <nav className="project-dashboard__nav">
            <div className="project-dashboard__nav-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`project-dashboard__nav-tab ${
                    activeTab === tab.id ? 'project-dashboard__nav-tab--active' : ''
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="project-dashboard__nav-tab-icon">{tab.icon}</span>
                  <span className="project-dashboard__nav-tab-text">{tab.name}</span>
                </button>
              ))}
            </div>
          </nav>
        </header>
      )}

      <main className="project-dashboard__main">
        <div className="project-dashboard__content">
          {activeTab === 'projects' && (
            <>
              {showForm ? (
                <ProjectForm
                  project={editingProject}
                  onSave={handleSaveProject}
                  onCancel={handleCancelForm}
                  isEdit={!!editingProject}
                />
              ) : selectedProject ? (
                <ProjectDetail
                  project={selectedProject}
                  onBack={handleBackToList}
                  onEditProject={handleEditProject}
                  onDeleteProject={handleDeleteProject}
                  refreshTrigger={refreshTrigger}
                />
              ) : (
                <ProjectList
                  onSelectProject={handleSelectProject}
                  selectedProjectId={selectedProject?.id}
                  refreshTrigger={refreshTrigger}
                  onCreateProject={handleCreateProject}
                  onEditProject={handleEditProject}
                  onDeleteProject={handleDeleteProject}
                />
              )}
            </>
          )}

          {activeTab === 'profile' && (
            <div className="project-dashboard__tab-content">
              <UserProfile />
            </div>
          )}
        </div>
      </main>

      {deleteConfirm && (
        <div className="project-dashboard__modal-overlay">
          <div className="project-dashboard__modal">
            <div className="project-dashboard__modal-header">
              <h3>⚠️ 确认删除项目</h3>
            </div>
            <div className="project-dashboard__modal-content">
              <p>确定要删除项目 <strong>{deleteConfirm.name}</strong> 吗？</p>
              <p className="project-dashboard__modal-warning">
                此操作将删除项目及其所有会话数据，且无法撤销！
              </p>
            </div>
            <div className="project-dashboard__modal-actions">
              <Button
                variant="danger"
                onClick={confirmDeleteProject}
              >
                确认删除
              </Button>
              <Button
                variant="ghost"
                onClick={cancelDeleteProject}
              >
                取消
              </Button>
            </div>
          </div>
        </div>
      )}

      <footer className="project-dashboard__footer">
        <div className="project-dashboard__footer-content">
          <div className="project-dashboard__footer-left">
            <span className="project-dashboard__footer-text">
              ⚠️ 仅用于授权安全测试 | 请遵守相关法律法规
            </span>
          </div>
          <div className="project-dashboard__footer-right">
            <span className="project-dashboard__footer-text">
              服务器: localhost:8088 | 项目管理模式
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProjectDashboard;