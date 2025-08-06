#!/bin/bash

# Gauss Trading Platform - 一键启动脚本
# 启动前端、Java后端和代理服务器

set -e

echo "🚀 Gauss Trading Platform 启动脚本"
echo "=================================="

# 检查依赖
check_dependencies() {
    echo "📋 检查依赖..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js 未安装，请先安装 Node.js 18+"
        exit 1
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        echo "❌ npm 未安装，请先安装 npm"
        exit 1
    fi
    
    # 检查Java
    if ! command -v java &> /dev/null; then
        echo "❌ Java 未安装，请先安装 Java 11+"
        exit 1
    fi
    
    # 检查Maven
    if ! command -v mvn &> /dev/null; then
        echo "❌ Maven 未安装，请先安装 Maven 3.6+"
        exit 1
    fi
    
    echo "✅ 依赖检查通过"
}

# 安装前端依赖
install_frontend_deps() {
    echo "📦 安装前端依赖..."
    if [ ! -d "node_modules" ]; then
        npm install
    else
        echo "✅ 前端依赖已存在"
    fi
}

# 编译Java后端
build_java_backend() {
    echo "🔨 编译Java后端..."
    cd java-tws-api
    
    # 检查是否需要编译
    if [ ! -f "target/tws-api-1.0.0-jar-with-dependencies.jar" ]; then
        echo "📦 打包Java应用..."
        mvn clean package -DskipTests
        
        # 复制TWS API jar包
        if [ -f "../src/IBJts/source/JavaClient/TwsApi.jar" ]; then
            cp ../src/IBJts/source/JavaClient/TwsApi.jar target/
        fi
    else
        echo "✅ Java应用已编译"
    fi
    
    cd ..
}

# 启动Java后端
start_java_backend() {
    echo "☕ 启动Java后端..."
    cd java-tws-api
    
    # 检查Java后端是否已在运行
    if lsof -i :8080 > /dev/null 2>&1; then
        echo "✅ Java后端已在运行 (端口8080)"
    else
        echo "🚀 启动Java后端..."
        nohup java -cp "target/tws-api-1.0.0-jar-with-dependencies.jar:target/TwsApi.jar" com.gauss.trading.TwsApiApplication > java-backend.log 2>&1 &
        JAVA_PID=$!
        echo "✅ Java后端已启动 (PID: $JAVA_PID)"
        
        # 等待Java后端启动
        echo "⏳ 等待Java后端启动..."
        sleep 10
        
        # 检查Java后端是否成功启动
        if curl -s http://localhost:8080/api/tws/health > /dev/null; then
            echo "✅ Java后端启动成功"
        else
            echo "❌ Java后端启动失败，请检查日志: java-tws-api/java-backend.log"
        fi
    fi
    
    cd ..
}

# 启动代理服务器
start_proxy_server() {
    echo "🌐 启动代理服务器..."
    
    # 检查代理服务器是否已在运行
    if lsof -i :3001 > /dev/null 2>&1; then
        echo "✅ 代理服务器已在运行 (端口3001)"
    else
        echo "🚀 启动代理服务器..."
        nohup node proxy-server.js > proxy-server.log 2>&1 &
        PROXY_PID=$!
        echo "✅ 代理服务器已启动 (PID: $PROXY_PID)"
        
        # 等待代理服务器启动
        sleep 3
        
        # 检查代理服务器是否成功启动
        if curl -s http://localhost:3001/ > /dev/null; then
            echo "✅ 代理服务器启动成功"
        else
            echo "❌ 代理服务器启动失败，请检查日志: proxy-server.log"
        fi
    fi
}

# 启动前端
start_frontend() {
    echo "⚛️ 启动前端开发服务器..."
    
    # 检查前端是否已在运行
    if lsof -i :5173 > /dev/null 2>&1; then
        echo "✅ 前端开发服务器已在运行 (端口5173)"
    else
        echo "🚀 启动前端开发服务器..."
        nohup npm run dev > frontend.log 2>&1 &
        FRONTEND_PID=$!
        echo "✅ 前端开发服务器已启动 (PID: $FRONTEND_PID)"
        
        # 等待前端启动
        echo "⏳ 等待前端启动..."
        sleep 5
        
        # 检查前端是否成功启动
        if curl -s http://localhost:5173/ > /dev/null; then
            echo "✅ 前端启动成功"
        else
            echo "❌ 前端启动失败，请检查日志: frontend.log"
        fi
    fi
}

# 显示服务状态
show_status() {
    echo ""
    echo "📊 服务状态:"
    echo "=========="
    
    # 检查前端
    if lsof -i :5173 > /dev/null 2>&1; then
        echo "✅ 前端: http://localhost:5173"
    else
        echo "❌ 前端: 未运行"
    fi
    
    # 检查Java后端
    if lsof -i :8080 > /dev/null 2>&1; then
        echo "✅ Java后端: http://localhost:8080"
    else
        echo "❌ Java后端: 未运行"
    fi
    
    # 检查代理服务器
    if lsof -i :3001 > /dev/null 2>&1; then
        echo "✅ 代理服务器: http://localhost:3001"
    else
        echo "❌ 代理服务器: 未运行"
    fi
    
    echo ""
    echo "🎉 Gauss Trading Platform 启动完成！"
    echo "🌐 访问前端: http://localhost:5173"
    echo "📡 API文档: http://localhost:8080/api/tws/health"
    echo ""
    echo "💡 提示:"
    echo "- 查看日志: tail -f *.log"
    echo "- 停止服务: ./stop-all.sh"
    echo "- 重启服务: ./restart-all.sh"
}

# 主函数
main() {
    check_dependencies
    install_frontend_deps
    build_java_backend
    start_java_backend
    start_proxy_server
    start_frontend
    show_status
}

# 运行主函数
main "$@" 