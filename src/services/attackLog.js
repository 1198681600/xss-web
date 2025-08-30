import { API_BASE_URL } from '../constants/api';
import authService from './auth';

class AttackLogService {
  async getSessionLogs(sessionId, page = 1, limit = 20) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('未授权访问');
      }

      const response = await fetch(
        `${API_BASE_URL}/api/logs/sessions/${sessionId}?page=${page}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error(data.message || '获取会话攻击记录失败');
      }

      return data.data;
    } catch (error) {
      throw error;
    }
  }

  async getProjectLogs(projectId, page = 1, limit = 20) {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('未授权访问');
      }

      const response = await fetch(
        `${API_BASE_URL}/api/logs/projects/${projectId}?page=${page}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error(data.message || '获取项目攻击记录失败');
      }

      return data.data;
    } catch (error) {
      throw error;
    }
  }

  formatLogResult(result) {
    if (!result) return '无结果';
    
    try {
      const parsed = JSON.parse(result);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return result;
    }
  }

  formatLogTime(timestamp) {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getCommandDisplayName(command) {
    const commandMap = {
      'cookie': 'Cookie获取',
      'screenshot': '屏幕截图',
      'keylogger': '键盘记录',
      'location': '地理位置',
      'form': '表单数据',
      'clipboard': '剪贴板',
      'camera': '摄像头',
      'microphone': '麦克风',
      'custom': '自定义脚本'
    };
    return commandMap[command] || command;
  }

  getStatusBadgeVariant(status) {
    return status === 'success' ? 'success' : 'danger';
  }

  getTypeBadgeVariant(type) {
    return type === 'auto' ? 'primary' : 'secondary';
  }

  getTypeDisplayName(type) {
    return type === 'auto' ? '自动执行' : '手动执行';
  }
}

export default new AttackLogService();