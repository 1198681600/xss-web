# Google 2FA 前端接入指南

## 概述

本文档说明如何在前端实现Google两步验证（2FA）功能，包括设置、验证和管理流程。

## API接口

### 1. 设置2FA
`POST /api/users/:id/2fa/setup`
Authorization: Bearer <admin_token>

**响应体:**
```json
{
  "status": "success",
  "message": "2FA设置成功",
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
  }
}
```
- `secret` (string): TOTP密钥（供手动输入）
- `qr_code` (string): QR码图片的base64编码

### 2. 验证2FA码
`POST /api/2fa/verify`
Authorization: Bearer <token>

**请求体:**
```json
{
  "user_id": 1,
  "totp_code": "123456"
}
```
- `user_id` (number): 用户ID
- `totp_code` (string): 6位验证码

**响应体:**
```json
{
  "status": "success",
  "message": "2FA验证成功",
  "data": null
}
```

### 3. 禁用2FA
`POST /api/users/:id/2fa/disable`
Authorization: Bearer <admin_token>

**响应体:**
```json
{
  "status": "success",
  "message": "2FA已禁用",
  "data": null
}
```

### 4. 管理员登录（含2FA）
`POST /api/login`

**请求体:**
```json
{
  "username": "admin",
  "password": "password123",
  "totp_code": "123456"
}
```
- `username` (string): 用户名
- `password` (string): 密码  
- `totp_code` (string): 6位验证码（管理员且启用2FA时必填）

**响应体:**
```json
{
  "status": "success",
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "two_factor_enabled": true,
      "two_factor_verified": true
    }
  }
}
```

## 前端实现流程

### 1. 2FA设置流程

```javascript
// 步骤1: 管理员为用户设置2FA
async function setup2FA(userId) {
  const response = await fetch(`/api/users/${userId}/2fa/setup`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  const result = await response.json();
  if (result.status === 'success') {
    // 显示QR码给用户扫描
    showQRCode(result.data.qr_code);
    // 显示密钥供手动输入
    showSecret(result.data.secret);
    
    return result.data;
  }
  throw new Error(result.message);
}

// 步骤2: 用户验证设置
async function verify2FA(userId, totpCode) {
  const response = await fetch('/api/2fa/verify', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_id: userId,
      totp_code: totpCode
    })
  });
  
  const result = await response.json();
  if (result.status === 'success') {
    alert('2FA设置完成！');
    return true;
  }
  throw new Error(result.message);
}
```

### 2. 管理员登录流程

```javascript
async function adminLogin(username, password, totpCode = '') {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username,
      password,
      totp_code: totpCode
    })
  });
  
  const result = await response.json();
  
  if (result.status === 'success') {
    // 登录成功，保存token
    localStorage.setItem('token', result.data.token);
    localStorage.setItem('user', JSON.stringify(result.data.user));
    return result.data;
  } else {
    // 检查是否需要2FA验证码
    if (result.message.includes('2FA验证码')) {
      throw new Error('NEED_2FA');
    }
    throw new Error(result.message);
  }
}

// 登录表单处理示例
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const totpCode = document.getElementById('totpCode').value;
  
  try {
    await adminLogin(username, password, totpCode);
    window.location.href = '/dashboard';
  } catch (error) {
    if (error.message === 'NEED_2FA') {
      // 显示2FA输入框
      document.getElementById('totpSection').style.display = 'block';
      document.getElementById('totpCode').focus();
    } else {
      alert('登录失败: ' + error.message);
    }
  }
});
```

### 3. HTML表单示例

```html
<!-- 登录表单 -->
<form id="loginForm">
  <div>
    <label for="username">用户名:</label>
    <input type="text" id="username" required>
  </div>
  
  <div>
    <label for="password">密码:</label>
    <input type="password" id="password" required>
  </div>
  
  <!-- 2FA输入框（默认隐藏） -->
  <div id="totpSection" style="display: none;">
    <label for="totpCode">验证码:</label>
    <input type="text" id="totpCode" placeholder="6位验证码" maxlength="6">
    <small>请输入Google Authenticator中显示的6位验证码</small>
  </div>
  
  <button type="submit">登录</button>
</form>

<!-- 2FA设置页面 -->
<div id="setup2FAModal" style="display: none;">
  <h3>设置Google两步验证</h3>
  
  <div>
    <h4>方法1: 扫描QR码</h4>
    <img id="qrCodeImage" src="" alt="QR Code">
    <p>使用Google Authenticator扫描上方二维码</p>
  </div>
  
  <div>
    <h4>方法2: 手动输入密钥</h4>
    <code id="secretKey"></code>
    <button onclick="copySecret()">复制密钥</button>
  </div>
  
  <div>
    <label for="verifyCode">输入验证码确认设置:</label>
    <input type="text" id="verifyCode" placeholder="6位验证码" maxlength="6">
    <button onclick="confirmSetup()">确认</button>
  </div>
</div>
```

### 4. 2FA管理功能

```javascript
// 为用户设置2FA
async function enableUser2FA(userId) {
  try {
    const setup = await setup2FA(userId);
    
    // 显示设置界面
    document.getElementById('qrCodeImage').src = `data:image/png;base64,${setup.qr_code}`;
    document.getElementById('secretKey').textContent = setup.secret;
    document.getElementById('setup2FAModal').style.display = 'block';
    
    // 保存当前设置的用户ID
    window.currentSetupUserId = userId;
    
  } catch (error) {
    alert('设置2FA失败: ' + error.message);
  }
}

// 确认2FA设置
async function confirmSetup() {
  const verifyCode = document.getElementById('verifyCode').value;
  
  if (!verifyCode || verifyCode.length !== 6) {
    alert('请输入6位验证码');
    return;
  }
  
  try {
    await verify2FA(window.currentSetupUserId, verifyCode);
    document.getElementById('setup2FAModal').style.display = 'none';
    alert('2FA设置成功！');
    
    // 刷新用户列表
    refreshUserList();
  } catch (error) {
    alert('验证失败: ' + error.message);
  }
}

// 禁用用户2FA
async function disableUser2FA(userId) {
  if (!confirm('确定要禁用此用户的2FA吗？')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/users/${userId}/2fa/disable`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAdminToken()}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    if (result.status === 'success') {
      alert('2FA已禁用');
      refreshUserList();
    } else {
      alert('禁用失败: ' + result.message);
    }
  } catch (error) {
    alert('操作失败: ' + error.message);
  }
}

// 复制密钥到剪贴板
function copySecret() {
  const secret = document.getElementById('secretKey').textContent;
  navigator.clipboard.writeText(secret).then(() => {
    alert('密钥已复制到剪贴板');
  });
}

// 获取管理员token
function getAdminToken() {
  return localStorage.getItem('token');
}
```

## 用户体验建议

### 1. 登录界面改进
- 当检测到需要2FA验证码时，平滑显示验证码输入框
- 提供清晰的错误提示
- 验证码输入框应自动聚焦

### 2. 设置界面设计
- 同时提供QR码和手动输入选项
- 提供"复制密钥"功能
- 明确的步骤指引

### 3. 状态显示
- 在用户列表中显示2FA启用状态
- 管理员可以查看哪些用户已启用2FA
- 提供快速启用/禁用操作

## 安全注意事项

### 1. 密钥保护
- 2FA密钥在数据库中加密存储
- 前端不应长期缓存敏感信息
- QR码应在设置完成后销毁

### 2. 验证码处理
- 验证码有时间窗口限制（通常30秒）
- 每个验证码只能使用一次
- 输入错误应有合理的重试限制

### 3. 权限控制
- 只有管理员可以为用户设置2FA
- 用户只能验证自己的2FA设置
- 禁用2FA需要管理员权限

## 错误处理

### 常见错误码和处理
```javascript
const ERROR_MESSAGES = {
  'NEED_2FA': '需要输入2FA验证码',
  '2FA验证码错误': '验证码错误，请重新输入',
  '管理员账户需要提供2FA验证码': '管理员登录需要2FA验证',
  '只有管理员可以设置2FA': '权限不足',
  '用户不存在': '用户不存在',
  '生成2FA密钥失败': '系统错误，请稍后重试'
};

function handleError(error) {
  const message = ERROR_MESSAGES[error.message] || error.message;
  // 显示友好的错误提示
  showErrorMessage(message);
}
```

## 测试建议

### 1. 功能测试
- 测试管理员启用2FA后的登录流程
- 测试普通用户无法设置2FA
- 测试验证码过期情况
- 测试网络异常情况

### 2. 用户体验测试
- 测试不同移动设备上的QR码扫描
- 测试手动输入密钥的流程
- 测试验证码输入的各种边界情况

### 3. 安全测试
- 确保密钥不会泄露到前端
- 测试重放攻击防护
- 验证权限控制的有效性