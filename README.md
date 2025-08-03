# 🚀 Crypto & Futures Trading Platform

一个现代化的加密货币和期货交易平台，支持实时行情、图表分析和专业交易功能。

![Trading Platform](https://img.shields.io/badge/React-18.2.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-cyan.svg)

## ✨ 功能特性

### 📊 交易品种支持
- **加密货币**: BTC, ETH, BNB, ADA, SOL, XRP, DOGE, DOT
- **期货合约**: MES (E-mini S&P 500), MNQ (E-mini NASDAQ-100), MYM (E-mini Dow Jones), MRTY (E-mini Russell 2000)

### 🎯 核心功能
- ✅ **实时价格数据** - 支持CoinGecko API和模拟期货数据
- ✅ **交互式价格图表** - 实时K线图和价格曲线
- ✅ **专业交易面板** - 市价单/限价单，止损止盈
- ✅ **期货交易** - 双向交易，保证金计算，风险管理
- ✅ **投资组合管理** - 持仓展示和盈亏统计
- ✅ **市场列表** - 多品种行情监控
- ✅ **订单历史** - 交易记录追踪

### 🎨 用户体验
- 🌙 **深色主题** - 专业交易界面设计
- 📱 **响应式布局** - 完美适配桌面和移动端
- ⚡ **实时更新** - 价格和图表实时同步
- 🔄 **无缝切换** - 加密货币和期货一键切换

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式框架**: Tailwind CSS
- **图标库**: Lucide React
- **数据源**: CoinGecko API + 模拟期货数据
- **状态管理**: React Hooks
- **图表绘制**: 原生SVG + Canvas

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 `http://localhost:5173` 查看应用

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 📁 项目结构

```
src/
├── components/           # React组件
│   ├── CryptoSelector.tsx    # 品种选择器
│   ├── PriceChart.tsx        # 价格图表
│   ├── TradingPanel.tsx      # 交易面板
│   ├── FuturesTrading.tsx    # 期货交易
│   ├── Portfolio.tsx         # 投资组合
│   ├── MarketList.tsx        # 市场列表
│   └── OrderHistory.tsx      # 订单历史
├── hooks/               # 自定义Hooks
│   └── useRealTimeData.ts    # 实时数据管理
├── App.tsx             # 主应用组件
└── main.tsx           # 应用入口
```

## 🎮 使用指南

### 1. 选择交易品种
- 点击顶部选择器
- 选择加密货币或期货合约
- 价格图表和数据会自动更新

### 2. 查看实时行情
- 价格图表显示实时走势
- 24小时涨跌幅和成交量
- 历史价格曲线

### 3. 进行交易
- **加密货币**: 使用标准交易面板
- **期货合约**: 使用专业期货交易面板
- 支持市价单和限价单
- 可设置止损止盈

### 4. 管理投资组合
- 查看持仓情况
- 盈亏统计
- 资产分布

## 🔧 配置说明

### API配置
项目使用CoinGecko免费API获取加密货币数据，期货数据为模拟数据。如需接入真实期货数据，请：

1. 注册专业金融数据提供商账户
2. 修改 `src/hooks/useRealTimeData.ts` 中的数据获取逻辑
3. 添加相应的API密钥配置

### 自定义配置
- 修改 `TRADING_INSTRUMENTS` 数组添加新的交易品种
- 调整 `tickSize` 和 `contractSize` 等期货合约参数
- 自定义主题颜色在 `tailwind.config.js`

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 开发日志

### v1.0.0 (2025-01-03)
- ✅ 基础交易平台架构
- ✅ 加密货币实时数据集成
- ✅ 价格图表和交易面板
- ✅ 期货交易功能
- ✅ 投资组合管理
- ✅ 响应式设计

## ⚠️ 免责声明

本项目仅用于学习和演示目的。期货和加密货币交易具有高风险，可能导致资金损失。请在进行真实交易前充分了解相关风险，并寻求专业投资建议。

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [CoinGecko](https://www.coingecko.com/) - 提供加密货币数据API
- [Lucide](https://lucide.dev/) - 精美的图标库
- [Tailwind CSS](https://tailwindcss.com/) - 实用的CSS框架
- [Vite](https://vitejs.dev/) - 快速的构建工具

---

⭐ 如果这个项目对你有帮助，请给个星标支持！
