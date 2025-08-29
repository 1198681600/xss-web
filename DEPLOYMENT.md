# XSS Web 前端部署指南

本文档介绍如何将 XSS Web 前端应用部署到 Ubuntu 服务器。

## 🚀 快速部署（推荐）

### 方式一：自动化脚本部署

1. **在本地机器上执行：**
```bash
# 给脚本执行权限
chmod +x deploy.sh

# 部署到服务器（替换为你的服务器IP和用户名）
./deploy.sh 192.168.1.100 root
```

这个脚本会自动：
- 构建生产版本
- 上传到服务器
- 安装配置 Nginx
- 设置网站

### 方式二：Docker 部署

1. **构建镜像：**
```bash
# 构建 Docker 镜像
docker build -t xss-web .

# 运行容器
docker run -d -p 80:80 --name xss-web xss-web
```

2. **或使用 Docker Compose：**
```bash
# 创建网络（如果还没有）
docker network create xss-network

# 启动服务
docker-compose up -d
```

## 📋 手动部署步骤

### 1. 服务器准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 和 npm（如果需要在服务器上构建）
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 Nginx
sudo apt install -y nginx

# 安装 PM2（可选，用于进程管理）
sudo npm install -g pm2
```

### 2. 本地构建

```bash
# 设置生产环境变量
export REACT_APP_API_BASE_URL=http://your-server-ip:8088

# 构建生产版本
npm run build

# 打包构建文件
tar -czf xss-web-dist.tar.gz -C build .
```

### 3. 上传文件

```bash
# 上传到服务器
scp xss-web-dist.tar.gz root@your-server:/tmp/

# 或使用 rsync
rsync -avz build/ root@your-server:/var/www/xss-web/
```

### 4. 服务器配置

```bash
# SSH 登录服务器
ssh root@your-server

# 创建网站目录
sudo mkdir -p /var/www/xss-web

# 解压文件
cd /var/www/xss-web
sudo tar -xzf /tmp/xss-web-dist.tar.gz

# 设置权限
sudo chown -R www-data:www-data /var/www/xss-web
sudo chmod -R 755 /var/www/xss-web
```

### 5. 配置 Nginx

创建 Nginx 站点配置：

```bash
sudo nano /etc/nginx/sites-available/xss-web
```

添加以下配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或使用 _
    
    root /var/www/xss-web;
    index index.html;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    location / {
        try_files $uri $uri/ /index.html;
        
        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API 代理到后端服务
    location /api/ {
        proxy_pass http://localhost:8088/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

启用站点：

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/xss-web /etc/nginx/sites-enabled/

# 删除默认站点
sudo rm -f /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 🔧 环境配置

### 生产环境变量

在 `.env.production` 文件中配置：

```bash
GENERATE_SOURCEMAP=false
REACT_APP_API_BASE_URL=http://your-server-ip:8088
```

### 开发环境变量

在 `.env.development` 文件中：

```bash
REACT_APP_API_BASE_URL=http://localhost:8088
```

## 🔒 安全配置

### 1. 防火墙设置

```bash
# 允许 HTTP 和 HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 允许 SSH（如果需要）
sudo ufw allow 22/tcp

# 启用防火墙
sudo ufw enable
```

### 2. SSL 证书（推荐）

**注意**: 现代浏览器要求HTTPS环境才能使用Clipboard API，为确保复制功能正常工作，强烈建议配置SSL证书。

使用 Let's Encrypt：

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加以下行
0 12 * * * /usr/bin/certbot renew --quiet
```

如果无法配置HTTPS，应用会自动降级使用传统的复制方法。

## 📊 监控和维护

### 1. 日志查看

```bash
# Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 系统日志
sudo journalctl -u nginx -f
```

### 2. 性能监控

```bash
# 查看 Nginx 状态
sudo systemctl status nginx

# 查看端口占用
sudo netstat -tlnp | grep :80

# 查看磁盘使用
df -h
```

## 🔄 更新部署

### 自动更新

重新运行部署脚本：

```bash
./deploy.sh your-server-ip root
```

### 手动更新

```bash
# 1. 本地构建新版本
npm run build

# 2. 上传到服务器
scp -r build/* root@your-server:/var/www/xss-web/

# 3. 重启 Nginx（如果需要）
sudo systemctl reload nginx
```

## ⚠️ 注意事项

1. **后端服务**: 确保 XSS 后端服务运行在 8088 端口
2. **跨域问题**: 后端需要正确配置 CORS
3. **网络访问**: 确保服务器的 80 和 8088 端口可以访问
4. **资源限制**: 监控服务器资源使用情况
5. **安全考虑**: 仅在授权环境中使用

## 🆘 故障排除

### 常见问题

1. **页面空白**: 检查 API 地址配置和网络连接
2. **404 错误**: 检查 Nginx 配置中的 `try_files` 设置
3. **API 调用失败**: 检查后端服务状态和防火墙设置
4. **权限错误**: 确保文件权限正确设置

### 调试命令

```bash
# 检查服务状态
sudo systemctl status nginx

# 测试 API 连接
curl http://localhost:8088/api/clients

# 检查端口监听
sudo ss -tlnp | grep :80
```

## 📞 技术支持

如果遇到问题，请检查：
1. 服务器系统要求
2. 网络连接状态
3. 日志文件内容
4. 配置文件语法