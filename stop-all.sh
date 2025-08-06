#!/bin/bash

# Gauss Trading Platform - 停止所有服务脚本

echo "🛑 Gauss Trading Platform 停止脚本"
echo "=================================="

# 停止前端开发服务器
echo "🛑 停止前端开发服务器..."
pkill -f "vite" || echo "前端开发服务器未运行"

# 停止代理服务器
echo "🛑 停止代理服务器..."
pkill -f "proxy-server.js" || echo "代理服务器未运行"

# 停止Java后端
echo "🛑 停止Java后端..."
pkill -f "TwsApiApplication" || echo "Java后端未运行"

# 等待进程完全停止
sleep 3

# 检查端口是否已释放
echo "📊 检查服务状态:"
echo "================"

if lsof -i :5173 > /dev/null 2>&1; then
    echo "❌ 前端开发服务器仍在运行 (端口5173)"
else
    echo "✅ 前端开发服务器已停止"
fi

if lsof -i :3001 > /dev/null 2>&1; then
    echo "❌ 代理服务器仍在运行 (端口3001)"
else
    echo "✅ 代理服务器已停止"
fi

if lsof -i :8080 > /dev/null 2>&1; then
    echo "❌ Java后端仍在运行 (端口8080)"
else
    echo "✅ Java后端已停止"
fi

echo ""
echo "🎉 所有服务已停止！"
echo "💡 提示: 使用 ./start-all.sh 重新启动服务" 