import React, { useState, useEffect } from 'react';
import { Button, Input, Card, Badge } from './ui';
import { useAuth } from '../contexts/AuthContext';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const { authService } = useAuth();

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const userList = await authService.getUserList();
      setUsers(userList);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');

    if (!newUser.username || !newUser.password) {
      setError('请填写完整信息');
      return;
    }

    try {
      await authService.createUser(newUser);
      setNewUser({ username: '', password: '', role: 'user' });
      setShowCreateForm(false);
      await loadUsers();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="user-management">
      <div className="user-management__header">
        <h2 className="user-management__title">👤 用户管理</h2>
        <Button
          variant="primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? '取消' : '+ 创建用户'}
        </Button>
      </div>

      {error && (
        <div className="user-management__error">
          ⚠️ {error}
        </div>
      )}

      {showCreateForm && (
        <Card className="user-management__create-form">
          <h3>创建新用户</h3>
          <form onSubmit={handleCreateUser}>
            <div className="user-management__form-group">
              <Input
                type="text"
                name="username"
                placeholder="用户名"
                value={newUser.username}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="user-management__form-group">
              <Input
                type="password"
                name="password"
                placeholder="密码"
                value={newUser.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="user-management__form-group">
              <select
                name="role"
                value={newUser.role}
                onChange={handleInputChange}
                className="user-management__select"
              >
                <option value="user">普通用户</option>
                <option value="admin">管理员</option>
              </select>
            </div>
            <div className="user-management__form-actions">
              <Button type="submit" variant="primary">
                创建用户
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowCreateForm(false)}
              >
                取消
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="user-management__list">
        <h3>用户列表</h3>
        {isLoading ? (
          <div className="user-management__loading">加载中...</div>
        ) : users.length === 0 ? (
          <div className="user-management__empty">暂无用户</div>
        ) : (
          <div className="user-management__users">
            {users.map((user) => (
              <div key={user.id} className="user-management__user-item">
                <div className="user-management__user-info">
                  <span className="user-management__username">{user.username}</span>
                  <Badge
                    variant={user.role === 'admin' ? 'danger' : 'primary'}
                    size="sm"
                  >
                    {user.role === 'admin' ? '管理员' : '普通用户'}
                  </Badge>
                </div>
                <div className="user-management__user-meta">
                  <span className="user-management__create-time">
                    创建时间: {new Date(user.createdAt).toLocaleString()}
                  </span>
                  {user.lastLogin && (
                    <span className="user-management__last-login">
                      最后登录: {new Date(user.lastLogin).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserManagement;