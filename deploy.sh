#!/bin/bash

# XSS Web 前端部署脚本
# 使用方法: ./deploy.sh <server-ip> [server-user]

set -e  # 遇到错误时停止执行

# 检查参数
if [ $# -lt 1 ]; then
    echo "使用方法: $0 <服务器IP> [用户名(默认root)]"
    echo "示例: $0 192.168.1.100 root"
    exit 1
fi

SERVER_IP=$1
SERVER_USER=${2:-root}
PROJECT_NAME="xss-web"
REMOTE_PATH="/var/www/${PROJECT_NAME}"

echo "🚀 开始部署 XSS Web 前端到服务器: ${SERVER_USER}@${SERVER_IP}"

# 1. 构建生产版本
echo "📦 构建生产版本..."
REACT_APP_API_BASE_URL=http://${SERVER_IP}:8088 npm run build

# 2. 创建部署包
echo "📁 创建部署包..."
tar -czf ${PROJECT_NAME}-dist.tar.gz -C build .

# 3. 上传到服务器
echo "📤 上传文件到服务器..."
scp ${PROJECT_NAME}-dist.tar.gz ${SERVER_USER}@${SERVER_IP}:/tmp/

# 4. 在服务器上执行部署
echo "⚙️  在服务器上执行部署..."
ssh ${SERVER_USER}@${SERVER_IP} << EOF
    set -e
    
    echo "安装必要软件..."
    apt update
    apt install -y nginx
    
    echo "创建项目目录..."
    mkdir -p ${REMOTE_PATH}
    
    echo "解压文件..."
    cd ${REMOTE_PATH}
    tar -xzf /tmp/${PROJECT_NAME}-dist.tar.gz
    
    echo "设置权限..."
    chown -R www-data:www-data ${REMOTE_PATH}
    chmod -R 755 ${REMOTE_PATH}
    
    echo "配置 Nginx..."
    cat > /etc/nginx/sites-available/${PROJECT_NAME} << 'NGINX_CONFIG'
server {
    listen 80;
    server_name _;
    
    root ${REMOTE_PATH};
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
        try_files \$uri \$uri/ /index.html;
        
        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API 代理 (可选)
    location /api/ {
        proxy_pass http://localhost:8088/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
NGINX_CONFIG
    
    echo "启用站点..."
    ln -sf /etc/nginx/sites-available/${PROJECT_NAME} /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    echo "测试 Nginx 配置..."
    nginx -t
    
    echo "重启 Nginx..."
    systemctl restart nginx
    systemctl enable nginx
    
    echo "清理临时文件..."
    rm -f /tmp/${PROJECT_NAME}-dist.tar.gz
    
    echo "✅ 部署完成!"
    echo "🌐 访问地址: http://${SERVER_IP}"
EOF

# 5. 清理本地文件
echo "🧹 清理本地文件..."
rm -f ${PROJECT_NAME}-dist.tar.gz

echo ""
echo "🎉 部署成功完成!"
echo "🌐 前端访问地址: http://${SERVER_IP}"
echo "📝 请确保你的 XSS 后端服务运行在: http://${SERVER_IP}:8088"
echo ""
echo "如需更新部署，只需重新运行此脚本即可。"