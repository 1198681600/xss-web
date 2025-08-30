# 用户管理 API 简化文档

## 认证相关

### 用户登录
`POST /api/login`

**请求体:**
```json
{
  "username": "admin",
  "password": "admin123",
  "totp_code": "123456"
}
```
- `username` (string): 用户名
- `password` (string): 密码
- `totp_code` (string): 2FA验证码，仅当用户启用2FA时需要提供

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
      "two_factor_verified": true,
      "created_at": "2025-01-20T10:00:00Z",
      "updated_at": "2025-01-20T10:00:00Z"
    }
  }
}
```
- `status` (string): 操作状态，成功为 "success"
- `message` (string): 操作结果描述
- `data.token` (string): JWT访问令牌
- `data.user.id` (uint): 用户唯一标识
- `data.user.username` (string): 用户名
- `data.user.role` (string): 用户角色 ("user" | "admin")
- `data.user.two_factor_enabled` (bool): 是否启用2FA
- `data.user.two_factor_verified` (bool): 2FA是否已验证
- `data.user.created_at` (string): 创建时间
- `data.user.updated_at` (string): 更新时间

## 用户管理

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
- `status` (string): 操作状态，成功为 "success"
- `message` (string): 操作结果描述
- `data.id` (uint): 用户唯一标识
- `data.username` (string): 用户名
- `data.role` (string): 用户角色 ("user" | "admin")
- `data.two_factor_enabled` (bool): 是否启用2FA
- `data.two_factor_verified` (bool): 2FA是否已验证
- `data.created_at` (string): 创建时间
- `data.updated_at` (string): 更新时间

### 获取所有用户
`GET /api/users`
Authorization: Bearer <token>

**响应体:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "created_at": "2025-01-20T10:00:00Z",
      "updated_at": "2025-01-20T10:00:00Z"
    }
  ]
}
```
- `status` (string): 操作状态，成功为 "success"
- `data` (array): 用户列表数组
- `data[].id` (uint): 用户唯一标识
- `data[].username` (string): 用户名
- `data[].role` (string): 用户角色 ("user" | "admin")
- `data[].created_at` (string): 创建时间
- `data[].updated_at` (string): 更新时间

### 获取特定用户
`GET /api/users/{user_id}`
Authorization: Bearer <token>

**响应体:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "created_at": "2025-01-20T10:00:00Z",
    "updated_at": "2025-01-20T10:00:00Z"
  }
}
```
- `status` (string): 操作状态，成功为 "success"
- `data.id` (uint): 用户唯一标识
- `data.username` (string): 用户名
- `data.role` (string): 用户角色 ("user" | "admin")
- `data.created_at` (string): 创建时间
- `data.updated_at` (string): 更新时间

### 创建用户 (仅管理员)
`POST /api/users`
Authorization: Bearer <token>

**请求体:**
```json
{
  "username": "newuser",
  "password": "password123",
  "role": "user"
}
```
- `username` (string): 用户名，必须唯一
- `password` (string): 密码
- `role` (string): 角色 ("user" | "admin")

**响应体:**
```json
{
  "status": "success",
  "data": {
    "id": 3,
    "username": "newuser",
    "role": "user",
    "created_at": "2025-01-20T12:30:00Z",
    "updated_at": "2025-01-20T12:30:00Z"
  }
}
```
- `status` (string): 操作状态，成功为 "success"
- `data.id` (uint): 新创建用户的唯一标识
- `data.username` (string): 用户名
- `data.role` (string): 用户角色
- `data.created_at` (string): 创建时间
- `data.updated_at` (string): 更新时间

### 删除用户 (仅管理员)
`DELETE /api/users/{user_id}`
Authorization: Bearer <token>

**响应体:**
```json
{
  "status": "success",
  "message": "用户删除成功"
}
```
- `status` (string): 操作状态，成功为 "success"
- `message` (string): 操作结果描述