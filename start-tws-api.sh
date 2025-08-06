#!/bin/bash

# Java TWS API 启动脚本

set -e

echo "🚀 启动Java TWS API..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查Java环境
check_java() {
    echo -e "${BLUE}检查Java环境...${NC}"
    
    if ! command -v java &> /dev/null; then
        echo -e "${RED}❌ Java未找到，请安装Java 11或更高版本${NC}"
        exit 1
    fi
    
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
    if [ "$JAVA_VERSION" -lt 11 ]; then
        echo -e "${RED}❌ Java版本过低，需要Java 11或更高版本${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Java版本: $(java -version 2>&1 | head -n 1)${NC}"
}

# 检查Maven
check_maven() {
    echo -e "${BLUE}检查Maven...${NC}"
    
    if ! command -v mvn &> /dev/null; then
        echo -e "${RED}❌ Maven未找到，请安装Maven${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Maven版本: $(mvn -version | head -n 1)${NC}"
}

# 检查IBJts库
check_ibjts() {
    echo -e "${BLUE}检查IBJts库...${NC}"
    
    if [ ! -f "src/IBJts/source/JavaClient/TwsApi.jar" ]; then
        echo -e "${RED}❌ IBJts库未找到: src/IBJts/source/JavaClient/TwsApi.jar${NC}"
        echo -e "${YELLOW}请确保已下载IBJts TWS API库${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ IBJts库存在${NC}"
}

# 编译项目
compile_project() {
    echo -e "${BLUE}编译Java TWS API项目...${NC}"
    
    cd java-tws-api
    
    # 清理之前的构建
    echo "清理之前的构建..."
    mvn clean
    
    # 编译项目
    echo "编译项目..."
    mvn compile
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 编译成功${NC}"
    else
        echo -e "${RED}❌ 编译失败${NC}"
        exit 1
    fi
    
    cd ..
}

# 运行项目
run_project() {
    echo -e "${BLUE}运行Java TWS API...${NC}"
    
    cd java-tws-api
    
    # 运行Spring Boot应用
    echo "启动Spring Boot应用..."
    mvn spring-boot:run
    
    cd ..
}

# 打包项目
package_project() {
    echo -e "${BLUE}打包Java TWS API...${NC}"
    
    cd java-tws-api
    
    # 打包项目
    echo "打包项目..."
    mvn package -DskipTests
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 打包成功${NC}"
        echo "JAR文件位置: target/tws-api-1.0.0.jar"
    else
        echo -e "${RED}❌ 打包失败${NC}"
        exit 1
    fi
    
    cd ..
}

# 运行JAR文件
run_jar() {
    echo -e "${BLUE}运行JAR文件...${NC}"
    
    if [ ! -f "java-tws-api/target/tws-api-1.0.0.jar" ]; then
        echo -e "${RED}❌ JAR文件未找到，请先打包项目${NC}"
        exit 1
    fi
    
    cd java-tws-api
    
    echo "启动应用..."
    java -jar target/tws-api-1.0.0.jar
    
    cd ..
}

# 显示帮助
show_help() {
    echo -e "${BLUE}📖 使用说明${NC}"
    echo "================================"
    echo ""
    echo "可用命令:"
    echo "  compile    - 编译项目"
    echo "  package    - 打包项目"
    echo "  run        - 运行项目 (Maven)"
    echo "  jar        - 运行JAR文件"
    echo "  all        - 编译并运行项目"
    echo "  help       - 显示此帮助"
    echo ""
    echo "示例:"
    echo "  ./start-tws-api.sh compile"
    echo "  ./start-tws-api.sh run"
    echo "  ./start-tws-api.sh all"
    echo ""
}

# 主函数
main() {
    echo "================================"
    echo "Java TWS API 启动脚本"
    echo "================================"
    echo ""
    
    # 检查参数
    case "$1" in
        "compile")
            check_java
            check_maven
            check_ibjts
            compile_project
            ;;
        "package")
            check_java
            check_maven
            check_ibjts
            compile_project
            package_project
            ;;
        "run")
            check_java
            check_maven
            check_ibjts
            run_project
            ;;
        "jar")
            check_java
            run_jar
            ;;
        "all")
            check_java
            check_maven
            check_ibjts
            compile_project
            run_project
            ;;
        "help"|"")
            show_help
            ;;
        *)
            echo -e "${RED}❌ 未知命令: $1${NC}"
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@" 