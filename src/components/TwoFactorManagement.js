import React, { useState, useEffect } from 'react';
import { Button, Card, Badge } from './ui';
import { useAuth } from '../contexts/AuthContext';
import TwoFactorSetup from './TwoFactorSetup';
import { toast } from './Toast';
import { formatDate } from '../utils/format';
import './TwoFactorManagement.css';

const TwoFactorManagement = () => {
  const [twoFactorStatus, setTwoFactorStatus] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { authService } = useAuth();

  useEffect(() => {
    checkTwoFactorStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkTwoFactorStatus = async () => {
    try {
      setIsLoading(true);
      const userData = await authService.getCurrentUser();
      setTwoFactorStatus({
        enabled: userData.two_factor_enabled || false,
        enabledAt: userData.updated_at || null
      });
    } catch (error) {
      setError(error.message);
      toast.error(`获取用户信息失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable2FA = () => {
    setShowSetup(true);
    setError('');
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('确定要禁用双因子认证吗？这将降低账户安全性。')) {
      return;
    }

    try {
      setIsLoading(true);
      await authService.disable2FA();
      await checkTwoFactorStatus();
      setError('');
      toast.success('2FA已禁用');
    } catch (error) {
      setError(error.message);
      toast.error(`禁用2FA失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupComplete = () => {
    setShowSetup(false);
    // 重新获取最新状态
    checkTwoFactorStatus();
    setError('');
  };

  const handleSetupCancel = () => {
    setShowSetup(false);
    setError('');
  };

  if (showSetup) {
    return (
      <TwoFactorSetup
        onComplete={handleSetupComplete}
        onCancel={handleSetupCancel}
      />
    );
  }

  return (
    <Card className="two-factor-management">
      <div className="two-factor-management__header">
        <h3 className="two-factor-management__title">
          🔐 双因子认证 (2FA)
        </h3>
        <p className="two-factor-management__subtitle">
          为你的管理员账户提供额外的安全保护
        </p>
      </div>

      {isLoading ? (
        <div className="two-factor-management__loading">
          正在加载2FA状态...
        </div>
      ) : (
        <div className="two-factor-management__content">
          <div className="two-factor-management__status">
            <div className="two-factor-management__status-info">
              <span className="two-factor-management__status-label">状态:</span>
              <Badge 
                variant={twoFactorStatus?.enabled ? 'success' : 'warning'}
                size="sm"
              >
                {twoFactorStatus?.enabled ? '已启用' : '未启用'}
              </Badge>
            </div>
            
            {twoFactorStatus?.enabled && (
              <div className="two-factor-management__status-info">
                <span className="two-factor-management__status-label">启用时间:</span>
                <span className="two-factor-management__status-value">
                  {formatDate(twoFactorStatus.enabledAt)}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="two-factor-management__error">
              ⚠️ {error}
            </div>
          )}

          <div className="two-factor-management__description">
            <h4>什么是双因子认证？</h4>
            <p>
              双因子认证 (2FA) 是一种额外的安全措施，在输入密码后还需要提供
              时间敏感的验证码。即使密码被盗用，没有你的手机也无法登录你的账户。
            </p>
          </div>

          <div className="two-factor-management__actions">
            {twoFactorStatus?.enabled ? (
              <Button
                variant="danger"
                onClick={handleDisable2FA}
                disabled={isLoading}
              >
                禁用 2FA
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleEnable2FA}
                disabled={isLoading}
              >
                启用 2FA
              </Button>
            )}
          </div>

          {!twoFactorStatus?.enabled && (
            <div className="two-factor-management__benefits">
              <h4>启用2FA的好处:</h4>
              <ul>
                <li>🛡️ 大幅提升账户安全性</li>
                <li>🔒 防止密码泄露导致的账户被盗</li>
                <li>📱 兼容 Google Authenticator 等常用应用</li>
                <li>⚡ 验证码30秒自动刷新</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default TwoFactorManagement;