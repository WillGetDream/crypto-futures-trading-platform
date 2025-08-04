# API 设置指南

## 实时数据API配置

本项目已集成多个免费的金融数据API来获取实时价格数据。

### 1. Alpha Vantage API (推荐)

**注册地址**: https://www.alphavantage.co/support/#api-key

**免费额度**: 每天500次请求

**设置步骤**:
1. 访问 https://www.alphavantage.co/support/#api-key
2. 注册免费账户
3. 获取API密钥
4. 在项目根目录创建 `.env.local` 文件
5. 添加以下内容:
   ```
   VITE_ALPHA_VANTAGE_API_KEY=your_api_key_here
   ```

### 2. Yahoo Finance API (备用)

**特点**: 完全免费，无需注册

**限制**: 每天1000次请求

**自动使用**: 当Alpha Vantage API不可用时自动切换

### 3. CoinGecko API (加密货币)

**特点**: 完全免费，无需注册

**限制**: 每分钟50次请求

**自动使用**: 用于获取加密货币价格数据

## 支持的期货合约

| 合约代码 | 名称 | 交易所符号 |
|---------|------|-----------|
| MES | E-mini S&P 500 | ES=F |
| MNQ | E-mini NASDAQ-100 | NQ=F |
| MYM | E-mini Dow Jones | YM=F |
| MRTY | E-mini Russell 2000 | RTY=F |

## 支持的加密货币

- Bitcoin (BTC)
- Ethereum (ETH)
- BNB (BNB)
- Cardano (ADA)
- Solana (SOL)
- XRP (XRP)
- Dogecoin (DOGE)
- Polkadot (DOT)

## 故障排除

### API限制错误
如果遇到API限制，系统会自动切换到备用数据源。

### 网络错误
检查网络连接，确保可以访问外部API。

### 数据不准确
- 确保使用最新的API密钥
- 检查API服务状态
- 考虑升级到付费API计划

## 开发说明

项目使用多层数据源策略:
1. **主要数据源**: Alpha Vantage API
2. **备用数据源**: Yahoo Finance API
3. **最后备用**: 模拟数据

这种设计确保即使在API不可用的情况下，应用仍能正常运行。 