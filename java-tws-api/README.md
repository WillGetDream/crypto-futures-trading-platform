# Java TWS API

基于IBJts TWS API的Java Spring MVC实现，提供RESTful API接口用于连接Interactive Brokers TWS Gateway。

## 🚀 功能特性

- **TWS连接管理**: 自动连接和断开TWS Gateway
- **合约搜索**: 搜索期货合约并获取详细信息
- **市场数据**: 实时获取市场数据
- **账户信息**: 查询账户摘要和持仓信息
- **RESTful API**: 提供标准的REST API接口
- **WebSocket支持**: 实时数据推送
- **健康检查**: 内置健康检查和监控

## 📋 系统要求

- **Java**: 11或更高版本
- **Maven**: 3.6或更高版本
- **TWS Gateway**: 运行在端口4002
- **IBJts库**: 已下载并放置在`src/IBJts/`目录

## 🏗️ 项目结构

```
java-tws-api/
├── src/main/java/com/gauss/trading/
│   ├── TwsApiApplication.java          # Spring Boot主应用
│   ├── controller/
│   │   └── TwsApiController.java       # REST API控制器
│   └── service/
│       ├── TwsConnectionService.java   # TWS连接服务
│       ├── TwsWrapper.java            # TWS包装器
│       ├── TwsContractService.java    # 合约服务
│       └── TwsMarketDataService.java  # 市场数据服务
├── src/main/resources/
│   └── application.yml                 # 配置文件
├── pom.xml                            # Maven配置
└── README.md                          # 项目文档
```

## 🚀 快速开始

### 1. 环境准备

确保已安装Java 11+和Maven：

```bash
# 检查Java版本
java -version

# 检查Maven版本
mvn -version
```

### 2. 启动TWS Gateway

1. 启动IBKR TWS Gateway
2. 进入Global Configuration → API → Settings
3. 启用"Enable ActiveX and Socket Clients"
4. 设置Socket Port为4002
5. 保存设置并重启

### 3. 编译和运行

使用提供的启动脚本：

```bash
# 编译项目
./start-tws-api.sh compile

# 运行项目
./start-tws-api.sh run

# 或者一次性编译并运行
./start-tws-api.sh all
```

或者手动使用Maven：

```bash
cd java-tws-api

# 编译
mvn compile

# 运行
mvn spring-boot:run

# 打包
mvn package
```

### 4. 验证运行

应用启动后，访问以下地址验证：

- **健康检查**: http://localhost:8080/actuator/health
- **API文档**: http://localhost:8080/api/tws/health

## 🔌 API接口

### 连接管理

#### 连接到TWS
```http
POST /api/tws/connect?host=localhost&port=4002&clientId=0
```

#### 断开连接
```http
POST /api/tws/disconnect
```

#### 获取连接状态
```http
GET /api/tws/status
```

### 合约操作

#### 搜索合约
```http
POST /api/tws/contracts/search?symbol=MES&secType=FUT&exchange=CME&currency=USD
```

#### 获取合约详情
```http
GET /api/tws/contracts/{conId}
```

#### 配置合约
```http
POST /api/tws/contracts/configure?symbol=MES&conId=123456
```

#### 获取已配置的合约
```http
GET /api/tws/contracts/configured
```

### 市场数据

#### 请求市场数据
```http
POST /api/tws/market-data/request?symbol=MES&secType=FUT&exchange=CME&currency=USD
```

#### 取消市场数据
```http
POST /api/tws/market-data/cancel?tickerId=1
```

### 账户信息

#### 获取账户摘要
```http
GET /api/tws/account/summary?group=All&tags=NetLiquidation,BuyingPower,TotalCashValue
```

#### 获取持仓信息
```http
GET /api/tws/account/positions
```

## 📊 响应格式

所有API响应都使用统一的JSON格式：

```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    // 具体数据
  },
  "timestamp": 1640995200000
}
```

错误响应：

```json
{
  "success": false,
  "error": "错误信息",
  "timestamp": 1640995200000
}
```

## 🔧 配置说明

在`application.yml`中可以配置以下参数：

```yaml
# TWS配置
tws:
  host: localhost          # TWS Gateway主机
  port: 4002              # TWS Gateway端口
  client-id: 0            # 客户端ID
  connection-timeout: 10000    # 连接超时时间
  message-timeout: 30000       # 消息超时时间

# 服务器配置
server:
  port: 8080              # API服务器端口
```

## 🛠️ 开发指南

### 添加新的API接口

1. 在`TwsApiController`中添加新的端点
2. 在相应的Service类中实现业务逻辑
3. 在`TwsWrapper`中处理TWS回调

### 调试

启用调试日志：

```yaml
logging:
  level:
    com.gauss.trading: DEBUG
    com.ib.client: DEBUG
```

### 测试

```bash
# 运行测试
mvn test

# 跳过测试打包
mvn package -DskipTests
```

## 🚨 常见问题

### 1. 连接失败

- 检查TWS Gateway是否运行
- 确认端口4002是否开放
- 验证API连接是否启用

### 2. 编译错误

- 检查Java版本是否为11+
- 确认IBJts库路径是否正确
- 验证Maven依赖是否完整

### 3. 运行时错误

- 检查TWS Gateway日志
- 验证合约参数
- 确认账户权限

## 📚 参考资料

- [IBKR TWS API文档](https://www.interactivebrokers.com/en/trading/ib-api.html)
- [IBJts GitHub](https://github.com/InteractiveBrokers/tws-api)
- [Spring Boot文档](https://spring.io/projects/spring-boot)
- [Spring MVC文档](https://spring.io/guides/gs/serving-web-content/)

## 📄 许可证

本项目基于IBKR TWS API开发，遵循IBKR API使用条款。

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📞 支持

如有问题，请：
1. 查看本文档
2. 检查错误日志
3. 提交Issue
4. 联系开发团队 