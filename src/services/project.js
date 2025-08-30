import { API_BASE_URL } from '../constants/api';
import authService from './auth';

class ProjectService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authService.getToken()}`,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (response.status === 401) {
        authService.logout();
        window.location.href = '/login';
        throw new Error('认证失败，请重新登录');
      }
      
      if (data.status !== 'success') {
        throw new Error(data.message || `请求失败: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async getProjects() {
    const response = await this.request('/api/projects');
    return response.data;
  }

  async getProject(projectId) {
    const response = await this.request(`/api/projects/${projectId}`);
    return response.data;
  }

  async createProject(projectData) {
    const response = await this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
    return response.data;
  }

  async updateProject(projectId, projectData) {
    const response = await this.request(`/api/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
    return response.data;
  }

  async deleteProject(projectId) {
    const response = await this.request(`/api/projects/${projectId}`, {
      method: 'DELETE',
    });
    return response;
  }

  async getProjectSessions(projectId) {
    const response = await this.request(`/api/projects/${projectId}/sessions`);
    return response.data;
  }

  async getSession(sessionId) {
    const response = await this.request(`/api/sessions/${sessionId}`);
    return response.data;
  }

  async getXssModules() {
    const response = await this.request('/api/xss-modules');
    return response.data;
  }

  async updateProjectModules(projectId, enabledModules) {
    const response = await this.request(`/api/projects/${projectId}/modules`, {
      method: 'PUT',
      body: JSON.stringify({ enabled_modules: enabledModules }),
    });
    return response.data;
  }

  async getProjectStats(projectId) {
    const response = await this.request(`/api/projects/${projectId}/stats`);
    return response.data;
  }

  async getProjectPayload(projectId) {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/payload`, {
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
      },
    });
    
    if (response.status === 401) {
      authService.logout();
      window.location.href = '/login';
      throw new Error('认证失败，请重新登录');
    }
    
    if (!response.ok) {
      throw new Error('获取载荷失败');
    }
    
    return await response.text();
  }

  async sendProjectCommand(projectId, command, params = {}) {
    const response = await this.request(`/api/projects/${projectId}/commands`, {
      method: 'POST',
      body: JSON.stringify({ command, params }),
    });
    return response.data;
  }

  async sendSessionCommand(sessionId, command, params = {}) {
    const response = await this.request(`/api/sessions/${sessionId}/commands`, {
      method: 'POST',
      body: JSON.stringify({ command, params }),
    });
    return response.data;
  }
}

export default new ProjectService();