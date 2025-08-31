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
REACT_APP_API_BASE_URL=https://a7.ag npm run build

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
    
    echo "创建项目目录..."
    sudo mkdir -p ${REMOTE_PATH}
    
    echo "解压文件..."
    cd ${REMOTE_PATH}
    sudo tar -xzf /tmp/${PROJECT_NAME}-dist.tar.gz
    
    echo "设置权限..."
    sudo chown -R www-data:www-data ${REMOTE_PATH}
    sudo chmod -R 755 ${REMOTE_PATH}
    
    echo "清理临时文件..."
    rm -f /tmp/${PROJECT_NAME}-dist.tar.gz
    
    echo "✅ 部署完成!"
    echo "📁 文件已部署到: ${REMOTE_PATH}"
EOF

# 5. 清理本地文件
echo "🧹 清理本地文件..."
rm -f ${PROJECT_NAME}-dist.tar.gz

echo ""
echo "🎉 部署成功完成!"
echo "📁 前端文件已部署到: ${REMOTE_PATH}"
echo "📝 请使用统一的nginx配置来提供服务"
echo ""
echo "如需更新部署，只需重新运行此脚本即可。"