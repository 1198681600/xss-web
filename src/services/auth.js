import { API_BASE_URL } from '../constants/api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  async login(username, password, twoFactorCode = null) {
    try {
      const requestBody = { username, password };
      if (twoFactorCode) {
        requestBody.totp_code = twoFactorCode;
      }

      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        this.token = data.data.token;
        this.user = data.data.user;
        
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));

        return { success: true, user: this.user };
      } else {
        // 检查错误信息判断是否需要2FA
        const errorMsg = data.message || '登录失败';
        
        if (errorMsg.includes('2FA验证码') || errorMsg.includes('需要提供验证码') || errorMsg.includes('管理员账户需要提供2FA验证码') || errorMsg.includes('账户已启用2FA')) {
          return { 
            success: false, 
            requiresTwoFactor: true,
            error: '需要2FA验证码'
          };
        }
        
        if (errorMsg.includes('需要设置2FA') || errorMsg.includes('未设置2FA')) {
          return { 
            success: false, 
            needsSetup: true,
            error: '需要设置2FA'
          };
        }
        
        return { 
          success: false, 
          error: errorMsg
        };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  getUser() {
    return this.user;
  }

  getToken() {
    return this.token;
  }

  isAdmin() {
    return this.user?.role === 'admin';
  }

  isUser() {
    return this.user?.role === 'user';
  }

  async verifyToken() {
    if (!this.token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();
      
      if (data.status !== 'success') {
        this.logout();
        return false;
      }

      // 更新用户信息
      if (data.data?.user) {
        this.user = data.data.user;
        localStorage.setItem('user', JSON.stringify(this.user));
      }

      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  async createUser(userData) {
    if (!this.isAdmin()) {
      throw new Error('只有管理员可以创建用户');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error(data.message || '创建用户失败');
      }

      return data.data;
    } catch (error) {
      throw error;
    }
  }

  async getUserList() {
    if (!this.isAdmin()) {
      throw new Error('只有管理员可以查看用户列表');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error(data.message || '获取用户列表失败');
      }

      return data.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(userId) {
    if (!this.isAdmin()) {
      throw new Error('只有管理员可以删除用户');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error(data.message || '删除用户失败');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/me`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error(data.message || '获取用户信息失败');
      }

      // 更新本地用户信息
      this.user = data.data;
      localStorage.setItem('user', JSON.stringify(this.user));

      return data.data;
    } catch (error) {
      throw error;
    }
  }

  async setup2FA() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/me/2fa/setup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error(data.message || '设置2FA失败');
      }

      return data.data;
    } catch (error) {
      throw error;
    }
  }

  async disable2FA() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/me/2fa/disable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error(data.message || '禁用2FA失败');
      }

      // 更新本地用户信息
      await this.getCurrentUser();
      
      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService();