#!/bin/bash

echo "🚀 开始自动部署到 Vercel..."

# 检查是否安装了 vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装 Vercel CLI..."
    npm install -g vercel
fi

# 构建项目
echo "🔨 构建项目..."
npm run build

# 尝试自动部署
echo "🚀 部署到 Vercel..."
vercel --prod --yes --token $VERCEL_TOKEN

echo "✅ 部署完成！" 