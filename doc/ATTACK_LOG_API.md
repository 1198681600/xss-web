# 攻击记录 API 文档

## 攻击记录查询

### 获取会话攻击记录
`GET /api/sessions/{session_id}/logs`
Authorization: Bearer <token>

**查询参数:**
- `page` (int): 页码，默认为1
- `limit` (int): 每页数量，默认为20，最大100

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
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "created_at": "2025-08-30T15:30:00Z",
        "updated_at": "2025-08-30T15:30:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 20
  }
}
```
- `status` (string): 操作状态，成功为 "success"
- `message` (string): 操作结果描述
- `data.logs` (array): 攻击记录列表，按时间倒序
- `data.logs[].id` (uint): 记录唯一标识
- `data.logs[].session_id` (uint): 会话ID
- `data.logs[].project_id` (uint): 项目ID
- `data.logs[].command` (string): 执行的命令
- `data.logs[].params` (string): 命令参数JSON
- `data.logs[].result` (string): 执行结果
- `data.logs[].status` (string): 执行状态 ("success" | "error")
- `data.logs[].type` (string): 记录类型 ("auto" | "manual")
- `data.logs[].url` (string): 执行页面URL
- `data.logs[].ip` (string): 客户端IP
- `data.logs[].user_agent` (string): 浏览器用户代理
- `data.logs[].created_at` (string): 创建时间
- `data.total` (int): 总记录数
- `data.page` (int): 当前页码
- `data.limit` (int): 每页数量

### 获取项目攻击记录
`GET /api/projects/{project_id}/logs`
Authorization: Bearer <token>

**查询参数:**
- `page` (int): 页码，默认为1
- `limit` (int): 每页数量，默认为20，最大100

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
        "command": "cookie",
        "params": "{}",
        "result": "sessionid=abc123; userid=456",
        "status": "success",
        "type": "auto",
        "url": "https://example.com/page1",
        "ip": "192.168.1.100",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "created_at": "2025-08-30T15:30:00Z",
        "updated_at": "2025-08-30T15:30:00Z",
        "session": {
          "id": 1,
          "jid": "UMG1GAT",
          "ip": "192.168.1.100",
          "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
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
- `status` (string): 操作状态，成功为 "success"
- `message` (string): 操作结果描述
- `data.logs` (array): 攻击记录列表，按时间倒序
- `data.logs[].session` (object): 关联的会话信息
- `data.total` (int): 总记录数
- `data.page` (int): 当前页码
- `data.limit` (int): 每页数量

## 功能说明

### 自动执行机制
- 当victim客户端连接到项目时，服务器会自动执行该项目配置的所有模块
- 每个模块执行间隔500ms，确保不会对目标造成过大压力
- 所有执行结果都会自动保存到攻击记录中

### 记录类型
- `auto`: 客户端连接时自动执行的命令
- `manual`: 通过API手动发送的命令

### 查询功能
- 支持按会话查询：查看特定受害者的所有操作记录
- 支持按项目查询：查看整个项目的所有攻击记录
- 记录按时间倒序排列，最新的记录在前
- 支持分页查询，避免大量数据影响性能