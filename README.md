# Gauss Trading Platform

一个功能完整的交易平台，支持加密货币和期货交易，集成了Interactive Brokers TWS API。

## 🚀 功能特性

### 前端功能
- **实时市场数据**: 支持加密货币和期货的实时价格更新
- **交易面板**: 完整的交易界面，支持下单和管理
- **投资组合管理**: 实时查看持仓和账户信息
- **图表分析**: 交互式价格图表
- **订单历史**: 完整的订单跟踪和管理
- **价格提醒**: 自定义价格警报

### 后端功能
- **Java TWS API集成**: 完整的Interactive Brokers API集成
- **实时数据流**: 支持实时市场数据订阅
- **账户管理**: 账户摘要、持仓信息查询
- **合约搜索**: 支持多种金融产品的合约搜索
- **RESTful API**: 提供完整的REST API接口

## 🛠️ 技术栈

### 前端
- **React 18** + **TypeScript**
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Chart.js** - 图表库
- **Clerk** - 身份验证

### 后端
- **Spring Boot** - Java框架
- **Maven** - 依赖管理
- **IBJts TWS API** - Interactive Brokers官方API
- **Jackson** - JSON序列化

### 基础设施
- **Node.js** - 代理服务器
- **Express** - Web框架
- **http-proxy-middleware** - 代理中间件

## 📦 项目结构

```
project/
├── src/                          # 前端源码
│   ├── components/               # React组件
│   ├── services/                 # API服务
│   ├── config/                   # 配置文件
│   ├── hooks/                    # 自定义Hooks
│   └── IBJts/                    # IBJts API源码
├── java-tws-api/                 # Java后端
│   ├── src/main/java/           # Java源码
│   ├── src/main/resources/      # 配置文件
│   └── pom.xml                  # Maven配置
├── proxy-server.js              # 代理服务器
├── start-tws-api.sh             # Java后端启动脚本
└── package.json                 # Node.js依赖
```

## 🚀 快速开始

### 前置要求
- Node.js 18+
- Java 11+
- Maven 3.6+
- Interactive Brokers TWS Gateway (可选)

### 1. 克隆项目
```bash
git clone <your-repo-url>
cd project
```

### 2. 安装前端依赖
```bash
npm install
```

### 3. 启动前端开发服务器
```bash
npm run dev
```
前端将在 http://localhost:5173 运行

### 4. 启动Java后端
```bash
cd java-tws-api
./start-tws-api.sh
```
或者手动启动：
```bash
cd java-tws-api
mvn clean package -DskipTests
java -cp "target/tws-api-1.0.0-jar-with-dependencies.jar:target/TwsApi.jar" com.gauss.trading.TwsApiApplication
```

### 5. 启动代理服务器
```bash
node proxy-server.js
```

## 🔧 配置

### 环境变量
创建 `.env` 文件：
```env
VITE_ALPHA_VANTAGE_API_KEY=your_api_key
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

### TWS连接配置
在 `java-tws-api/src/main/resources/application.yml` 中配置：
```yaml
tws:
  host: localhost
  port: 4002  # TWS Gateway端口
  client-id: 0
```

## 📡 API接口

### Java后端API (端口8080)
- `GET /api/tws/health` - 健康检查
- `GET /api/tws/status` - 连接状态
- `POST /api/tws/connect` - 连接TWS
- `GET /api/tws/account/summary` - 账户摘要
- `GET /api/tws/account/positions` - 持仓信息
- `POST /api/tws/contracts/search` - 合约搜索
- `POST /api/tws/market-data/request` - 市场数据请求

### 代理服务器API (端口3001)
- `/ibkr/*` - 转发到IBKR API
- `/tws/*` - 转发到TWS API

## 🧪 测试

### 前端测试
```bash
npm run test
```

### Java后端测试
```bash
cd java-tws-api
mvn test
```

### API测试
```bash
# 测试Java后端健康检查
curl http://localhost:8080/api/tws/health

# 测试连接TWS
curl -X POST "http://localhost:8080/api/tws/connect?host=localhost&port=4002&clientId=1"

# 测试账户信息
curl http://localhost:8080/api/tws/account/summary
```

## 🚀 部署

### 前端部署 (Vercel)
```bash
npm run build
vercel --prod
```

### Java后端部署
```bash
cd java-tws-api
mvn clean package -DskipTests
java -jar target/tws-api-1.0.0-jar-with-dependencies.jar
```

## 📝 开发指南

### 添加新的交易功能
1. 在 `src/components/` 中创建新的React组件
2. 在 `src/services/` 中添加相应的API服务
3. 在 `java-tws-api/src/main/java/com/gauss/trading/` 中添加后端逻辑

### 集成新的数据源
1. 在 `src/config/api.ts` 中添加配置
2. 在 `src/services/` 中创建新的服务类
3. 在相应的组件中使用新服务

## 🔍 故障排除

### 常见问题

1. **Java后端启动失败**
   - 检查Java版本: `java -version`
   - 检查Maven版本: `mvn -version`
   - 确保IBJts jar包存在

2. **TWS连接失败**
   - 确保TWS Gateway在端口4002运行
   - 检查防火墙设置
   - 验证TWS配置

3. **前端无法连接后端**
   - 检查CORS配置
   - 验证API端点URL
   - 检查网络连接

### 日志查看
```bash
# Java后端日志
tail -f java-tws-api/logs/application.log

# 前端开发服务器日志
npm run dev
```

## 🤝 贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Interactive Brokers](https://www.interactivebrokers.com/) - TWS API
- [React](https://reactjs.org/) - 前端框架
- [Spring Boot](https://spring.io/projects/spring-boot) - Java框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架

## 📞 支持

如有问题或建议，请创建 [Issue](https://github.com/your-username/project/issues) 或联系开发团队。
