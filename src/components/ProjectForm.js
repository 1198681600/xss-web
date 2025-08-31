import React, { useState, useEffect } from 'react';
import { Button, Input, Card } from './ui';
import projectService from '../services/project';
import './ProjectForm.css';

const ProjectForm = ({ project, onSave, onCancel, isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    enabled_modules: []
  });
  const [availableModules, setAvailableModules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAvailableModules();
    if (isEdit && project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'active',
        enabled_modules: project.enabled_modules || []
      });
    }
  }, [project, isEdit]);

  const loadAvailableModules = async () => {
    try {
      const modules = await projectService.getXssModules();
      setAvailableModules(modules || []);
    } catch (error) {
      console.error('获取可用模块失败:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleModuleToggle = (moduleName) => {
    setFormData(prev => ({
      ...prev,
      enabled_modules: prev.enabled_modules.includes(moduleName)
        ? prev.enabled_modules.filter(m => m !== moduleName)
        : [...prev.enabled_modules, moduleName]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name) {
      setError('请填写项目名称');
      return;
    }

    if (formData.enabled_modules.length === 0) {
      setError('请至少选择一个攻击模块');
      return;
    }

    setIsLoading(true);
    try {
      let result;
      if (isEdit) {
        result = await projectService.updateProject(project.id, formData);
      } else {
        result = await projectService.createProject(formData);
      }
      onSave(result);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getModulesByCategory = () => {
    const categories = {};
    availableModules.forEach(module => {
      if (!categories[module.category]) {
        categories[module.category] = [];
      }
      categories[module.category].push(module);
    });
    return categories;
  };

  const moduleCategories = getModulesByCategory();

  return (
    <div className="project-form">
      <Card className="project-form__card">
        <div className="project-form__header">
          <h2 className="project-form__title">
            {isEdit ? '📝 编辑项目' : '🆕 创建新项目'}
          </h2>
        </div>

        {error && (
          <div className="project-form__error">
            ⚠️ {error}
          </div>
        )}

        <form className="project-form__form" onSubmit={handleSubmit}>
          <div className="project-form__section">
            <h3 className="project-form__section-title">基本信息</h3>
            
            <div className="project-form__field">
              <label className="project-form__label">项目名称 *</label>
              <Input
                type="text"
                name="name"
                placeholder="输入项目名称"
                value={formData.name}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="project-form__field">
              <label className="project-form__label">项目描述</label>
              <textarea
                name="description"
                className="project-form__textarea"
                placeholder="项目描述信息（可选）"
                value={formData.description}
                onChange={handleInputChange}
                disabled={isLoading}
                rows={3}
              />
            </div>

            <div className="project-form__field">
              <label className="project-form__label">项目状态</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="project-form__select"
                disabled={isLoading}
              >
                <option value="active">活跃</option>
                <option value="inactive">停用</option>
              </select>
            </div>
          </div>

          <div className="project-form__section">
            <h3 className="project-form__section-title">攻击模块配置</h3>
            <p className="project-form__section-desc">
              选择要在此项目中启用的XSS攻击模块
            </p>
            
            <div className="project-form__modules">
              {Object.entries(moduleCategories).map(([category, modules]) => (
                <div key={category} className="project-form__module-category">
                  <h4 className="project-form__category-title">{category}</h4>
                  <div className="project-form__module-grid">
                    {modules.map((module) => (
                      <label
                        key={module.name}
                        className={`project-form__module-item ${
                          formData.enabled_modules.includes(module.name) 
                            ? 'project-form__module-item--selected' 
                            : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.enabled_modules.includes(module.name)}
                          onChange={() => handleModuleToggle(module.name)}
                          className="project-form__module-checkbox"
                          disabled={isLoading}
                        />
                        <div className="project-form__module-content">
                          <span className="project-form__module-name">
                            {module.display_name}
                          </span>
                          <span className="project-form__module-desc">
                            {module.description}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="project-form__actions">
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? '保存中...' : (isEdit ? '更新项目' : '创建项目')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading}
            >
              取消
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProjectForm;