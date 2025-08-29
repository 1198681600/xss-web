import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';

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

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
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