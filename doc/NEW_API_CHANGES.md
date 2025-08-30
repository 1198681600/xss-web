# API 更新说明 - 攻击记录系统

## 🆕 新增API端点

### 获取当前用户信息
`GET /api/me`
Authorization: Bearer <token>

**响应体:**
```json
{
  "status": "success",
  "message": "获取当前用户信息成功",
  "data": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "two_factor_enabled": true,
    "two_factor_verified": true,
    "created_at": "2025-01-20T10:00:00Z",
    "updated_at": "2025-01-20T10:00:00Z"
  }
}
```

### 获取会话攻击记录
`GET /api/logs/sessions/{session_id}?page=1&limit=20`
Authorization: Bearer <token>

**响应体:**
```json
{
  "status": "success",
  "message": "获取攻击记录成功",
  "data": {
    "logs": [
      {
        "id": 1,
        "session_id": 1,
        "project_id": 1,
        "command": "cookie",
        "params": "{}",
        "result": "sessionid=abc123; userid=456",
        "status": "success",
        "type": "auto",
        "url": "https://example.com/page1",
        "ip": "192.168.1.100",
        "user_agent": "Mozilla/5.0...",
        "created_at": "2025-08-30T15:30:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 20
  }
}
```

### 获取项目攻击记录
`GET /api/logs/projects/{project_id}?page=1&limit=20`
Authorization: Bearer <token>

**响应体:**
```json
{
  "status": "success",
  "message": "获取项目攻击记录成功", 
  "data": {
    "logs": [
      {
        "id": 1,
        "session_id": 1,
        "project_id": 1,
        "command": "localStorage",
        "result": "{\"key1\":\"value1\"}",
        "type": "auto",
        "url": "https://example.com/page2",
        "created_at": "2025-08-30T15:32:00Z",
        "session": {
          "id": 1,
          "jid": "UMG1GAT",
          "ip": "192.168.1.100",
          "status": "online"
        }
      }
    ],
    "total": 125,
    "page": 1,
    "limit": 20
  }
}
```

## 🔄 修改的API端点

### 2FA权限变更
- **旧:** 只有管理员能设置2FA (`POST /api/users/:id/2fa/setup`)  
- **新:** 任何用户都能为自己设置2FA (`POST /api/me/2fa/setup`)
- **旧:** 只有管理员能禁用2FA (`POST /api/users/:id/2fa/disable`)
- **新:** 用户可以禁用自己的2FA (`POST /api/me/2fa/disable`)

### 用户登录（已更新）
`POST /api/login`

**请求体增加字段:**
```json
{
  "username": "admin",
  "password": "admin123",
  "totp_code": "123456"
}
```
- `totp_code` (string): 2FA验证码，**任何启用2FA的用户**都需要提供（不再限制只有管理员）

**响应体增加字段:**
```json
{
  "data": {
    "user": {
      "two_factor_enabled": true,
      "two_factor_verified": true
    }
  }
}
```

### 用户2FA管理（新增）
`POST /api/me/2fa/setup`
Authorization: Bearer <token>

**响应体:**
```json
{
  "status": "success",
  "message": "2FA设置成功",
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
}
```

`POST /api/me/2fa/disable`
Authorization: Bearer <token>

**响应体:**
```json
{
  "status": "success", 
  "message": "2FA已禁用"
}
```

## ⚡ 新增自动功能

### 自动模块执行
- **触发时机:** victim客户端连接到项目时
- **执行内容:** 自动执行该项目配置的所有启用模块
- **执行间隔:** 每个模块间隔500ms执行
- **记录存储:** 所有执行结果自动保存到攻击记录表

### 攻击记录系统
- **自动记录:** 所有XSS命令执行都会自动记录到数据库
- **记录类型:** 
  - `auto` - 客户端连接时自动执行
  - `manual` - 通过API手动发送
- **查询支持:** 
  - 按会话查询（查看特定受害者的所有操作）
  - 按项目查询（查看整个项目的攻击记录）
  - 支持分页，按时间倒序

## 📊 前端开发建议

### 1. 用户认证更新
```javascript
// 登录时检查2FA状态
const loginResponse = await api.post('/api/login', {
  username,
  password,
  totp_code: user.two_factor_enabled ? totpCode : undefined
})

// 获取当前用户信息
const currentUser = await api.get('/api/me')
```

### 2. 攻击记录查询
```javascript
// 查看特定会话的攻击记录
const sessionLogs = await api.get(`/api/logs/sessions/${sessionId}?page=1&limit=20`)

// 查看项目的所有攻击记录  
const projectLogs = await api.get(`/api/logs/projects/${projectId}?page=1&limit=20`)
```

### 3. 实时监控建议
- 在项目详情页显示实时攻击记录
- 每5-10秒刷新最新记录
- 支持记录筛选（按命令类型、时间范围等）
- 显示攻击记录统计（总数、成功率等）

### 4. UI展示建议
- **会话详情页:** 显示该会话的所有攻击记录时间线
- **项目总览页:** 显示项目的攻击记录摘要和统计
- **记录详情:** 支持展开查看完整的命令参数和执行结果
- **类型标识:** 用不同颜色或图标区分自动/手动执行的记录

## 🔧 技术说明

### 数据库变更
- 新增 `attack_logs` 表
- 所有现有数据保持不变
- 新功能向后兼容

### 性能考虑
- 攻击记录支持分页查询，避免一次加载过多数据
- 自动执行间隔500ms，避免对目标造成压力
- 记录异步保存，不影响实时性能

### 错误处理
- 自动执行失败不影响客户端连接
- 记录保存失败只记录日志，不中断服务
- API查询支持空结果返回