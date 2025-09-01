import React, { useState } from 'react';
import { Button, Badge } from './ui';
import AllProjectsList from './AllProjectsList';
import ProjectDetail from './ProjectDetail';
import './ProjectDashboard.css';

const AllProjectsDashboard = ({ hideHeader = false }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSelectProject = (project) => {
    setSelectedProject(project);
  };

  const handleBackToList = () => {
    setSelectedProject(null);
  };

  const getConnectionStatus = () => {
    return <Badge variant="success">HTTP API</Badge>;
  };

  return (
    <div className="project-dashboard">
      {!hideHeader && (
        <header className="project-dashboard__header">
          <div className="project-dashboard__header-content">
            <div className="project-dashboard__header-left">
              <h1 className="project-dashboard__title">
                🗂️ 所有用户项目
              </h1>
              <p className="project-dashboard__subtitle">
                查看和管理所有用户的项目
              </p>
            </div>
            <div className="project-dashboard__header-right">
              <div className="project-dashboard__connection-status">
                <span className="project-dashboard__connection-label">API:</span>
                {getConnectionStatus()}
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="project-dashboard__main">
        <div className="project-dashboard__content">
          {selectedProject ? (
            <ProjectDetail
              project={selectedProject}
              onBack={handleBackToList}
              refreshTrigger={refreshTrigger}
              isOtherUserProject={true}
            />
          ) : (
            <AllProjectsList
              onSelectProject={handleSelectProject}
              selectedProjectId={selectedProject?.id}
              refreshTrigger={refreshTrigger}
            />
          )}
        </div>
      </main>

      <footer className="project-dashboard__footer">
        <div className="project-dashboard__footer-content">
          <div className="project-dashboard__footer-left">
            <span className="project-dashboard__footer-text">
              ⚠️ 仅用于授权安全测试 | 请遵守相关法律法规
            </span>
          </div>
          <div className="project-dashboard__footer-right">
            <span className="project-dashboard__footer-text">
              服务器: localhost:8088 | 所有用户项目管理
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AllProjectsDashboard;