import React, { useState, useEffect } from 'react';
import { Button, Input, Card } from './ui';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../constants/api';
import { toast } from './Toast';
import './TwoFactorSetup.css';

const TwoFactorSetup = ({ onComplete, onCancel }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: 显示QR码, 2: 验证代码
  const [hasInitialized, setHasInitialized] = useState(false);
  const { authService, user } = useAuth();

  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true);
      generateQRCode();
    }
  }, [hasInitialized]);

  const generateQRCode = async () => {
    try {
      setIsLoading(true);
      const setupData = await authService.setup2FA();
      
      console.log('2FA Setup Response:', setupData);
      setSecret(setupData.secret);
      
      // 检查是否需要添加data URI前缀
      let qrCodeData = setupData.qr_code;
      if (!qrCodeData.startsWith('data:')) {
        qrCodeData = `data:image/png;base64,${qrCodeData}`;
      }
      
      setQrCodeUrl(qrCodeData);
      console.log('QR Code URL set:', qrCodeData.substring(0, 50) + '...');
    } catch (error) {
      setError(error.message);
      toast.error(`生成2FA设置失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      setError('请输入6位验证码');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          totp_code: verificationCode,
        }),
      });

      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error(data.message || '验证失败');
      }

      // 验证成功后，用户信息会在TwoFactorManagement中通过/api/me更新
      toast.success('2FA设置成功！');
      onComplete();
    } catch (error) {
      setError(error.message);
      toast.error(`2FA验证失败: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    setStep(2);
    setError('');
  };

  return (
    <div className="two-factor-setup">
      <Card className="two-factor-setup__card">
        <div className="two-factor-setup__header">
          <h2 className="two-factor-setup__title">
            🔐 设置双因子认证 (2FA)
          </h2>
          <p className="two-factor-setup__subtitle">
            为你的管理员账户添加额外的安全保护
          </p>
        </div>

        {step === 1 && (
          <div className="two-factor-setup__step">
            <div className="two-factor-setup__step-header">
              <h3>步骤 1: 扫描二维码</h3>
              <p>使用 Google Authenticator 或其他 TOTP 应用扫描下方二维码</p>
            </div>

            {isLoading ? (
              <div className="two-factor-setup__loading">
                正在生成二维码...
              </div>
            ) : (
              <div className="two-factor-setup__qr-section">
                {qrCodeUrl ? (
                  <div className="two-factor-setup__qr-container">
                    <img 
                      src={qrCodeUrl} 
                      alt="2FA Setup QR Code"
                      className="two-factor-setup__qr-code"
                      onError={() => setError('二维码加载失败')}
                      onLoad={() => console.log('QR Code loaded successfully')}
                    />
                  </div>
                ) : (
                  <div className="two-factor-setup__qr-placeholder">
                    {error ? '二维码生成失败' : '正在生成二维码...'}
                  </div>
                )}
                
                <div className="two-factor-setup__manual-setup">
                  <p className="two-factor-setup__manual-title">
                    无法扫描? 手动输入密钥:
                  </p>
                  <code className="two-factor-setup__secret">
                    {secret}
                  </code>
                  <p className="two-factor-setup__manual-note">
                    账户名: {user?.username} | 服务: XSS Security Platform
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="two-factor-setup__error">
                ⚠️ {error}
              </div>
            )}

            <div className="two-factor-setup__actions">
              <Button
                variant="ghost"
                onClick={onCancel}
                disabled={isLoading}
              >
                取消
              </Button>
              <Button
                variant="primary"
                onClick={handleNextStep}
                disabled={isLoading || !qrCodeUrl}
              >
                下一步
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="two-factor-setup__step">
            <div className="two-factor-setup__step-header">
              <h3>步骤 2: 验证设置</h3>
              <p>输入 Google Authenticator 中显示的6位验证码</p>
            </div>

            <form onSubmit={handleVerifyCode} className="two-factor-setup__verify-form">
              <div className="two-factor-setup__field">
                <Input
                  type="text"
                  placeholder="验证码 (6位数字)"
                  value={verificationCode}
                  onChange={(e) => {
                    setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                    if (error) setError('');
                  }}
                  disabled={isLoading}
                  maxLength="6"
                  pattern="[0-9]{6}"
                  autoComplete="off"
                />
              </div>

              {error && (
                <div className="two-factor-setup__error">
                  ⚠️ {error}
                </div>
              )}

              <div className="two-factor-setup__actions">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                >
                  返回
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading || verificationCode.length !== 6}
                >
                  {isLoading ? '验证中...' : '验证并启用2FA'}
                </Button>
              </div>
            </form>

            <div className="two-factor-setup__tips">
              <h4>💡 使用提示:</h4>
              <ul>
                <li>确保手机时间与服务器时间同步</li>
                <li>验证码每30秒刷新一次</li>
                <li>如果验证失败，请等待新的验证码生成</li>
              </ul>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TwoFactorSetup;