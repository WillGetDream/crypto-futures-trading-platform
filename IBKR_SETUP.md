# IBKR API 设置指南

## 概述

Interactive Brokers (IBKR) 提供了强大的API来获取实时市场数据。本指南将帮助你配置IBKR API来获取MES期货的实时数据。

## 1. IBKR账户设置

### 1.1 创建IBKR账户
1. 访问 [Interactive Brokers官网](https://www.interactivebrokers.com/)
2. 注册账户并完成验证
3. 激活账户并存入资金（可选，仅用于交易）

### 1.2 下载TWS或IB Gateway
- **TWS (Trader Workstation)**: 完整的交易平台，包含API功能
- **IB Gateway**: 轻量级API网关，专门用于API连接

## 2. 配置TWS/IB Gateway

### 2.1 启用API连接
1. 打开TWS或IB Gateway
2. 进入 **File** → **Global Configuration** (TWS) 或 **Edit** → **Settings** (IB Gateway)
3. 在 **API** → **Settings** 中：
   - 启用 **Enable ActiveX and Socket Clients**
   - 设置 **Socket port**: 7497 (TWS) 或 7496 (IB Gateway)
   - 启用 **Download open orders on connection**
   - 启用 **Include FX positions in portfolio**

### 2.2 配置API权限
1. 在 **API** → **Precautions** 中：
   - 禁用 **Bypass Order Precautions for API Orders**
   - 启用 **Read-Only API**
   - 配置 **Trusted IPs** (可选)

### 2.3 市场数据订阅
1. 确保你的账户有市场数据订阅
2. 对于MES期货，需要订阅CME市场数据
3. 检查 **Market Data Subscriptions** 设置

## 3. 环境变量配置

在 `.env.local` 文件中添加IBKR配置：

```env
# IBKR配置
VITE_IBKR_HOST=localhost
VITE_IBKR_PORT=7497
VITE_IBKR_CLIENT_ID=1

# 备用数据源API密钥
VITE_POLYGON_API_KEY=your_polygon_api_key_here
VITE_FINNHUB_API_KEY=your_finnhub_api_key_here
```

## 4. 备用数据源配置

### 4.1 Polygon.io (推荐)
- **注册**: https://polygon.io/
- **价格**: 付费服务，提供高质量实时数据
- **特点**: 延迟低，数据准确，支持期货

### 4.2 Finnhub
- **注册**: https://finnhub.io/
- **价格**: 免费版每天60次请求
- **特点**: 免费额度有限，但数据质量不错

### 4.3 Alpha Vantage (已配置)
- 当前已配置，每天500次免费请求
- 适合开发和测试

## 5. 测试连接

### 5.1 启动TWS/IB Gateway
1. 确保TWS或IB Gateway正在运行
2. 检查连接状态
3. 确认API端口已开放

### 5.2 测试应用
1. 重启开发服务器
2. 访问应用
3. 选择MES期货
4. 检查实时数据是否正常显示

## 6. 故障排除

### 常见问题

1. **"Connection refused"错误**
   - 检查TWS/IB Gateway是否运行
   - 确认端口配置正确
   - 检查防火墙设置

2. **"Market data not available"错误**
   - 确认账户有市场数据订阅
   - 检查CME数据订阅状态
   - 验证交易时间

3. **"API connection failed"错误**
   - 检查API设置是否正确
   - 确认客户端ID唯一
   - 重启TWS/IB Gateway

4. **数据延迟问题**
   - 使用付费数据源
   - 检查网络连接
   - 考虑使用IB Gateway而非TWS

## 7. 生产环境部署

### 7.1 服务器配置
- 使用IB Gateway而非TWS
- 配置稳定的网络连接
- 设置自动重启机制

### 7.2 数据源选择
- 生产环境建议使用付费数据源
- 配置多个备用数据源
- 实现数据质量监控

### 7.3 安全考虑
- 使用VPN连接
- 配置IP白名单
- 定期更新API密钥

## 8. 高级配置

### 8.1 自定义合约
可以添加更多期货合约：

```typescript
// 在ibkrService.ts中添加
const CONTRACT_MAP = {
  'mes': 'ES=F',      // E-mini S&P 500
  'mnq': 'NQ=F',      // E-mini NASDAQ-100
  'mym': 'YM=F',      // E-mini Dow Jones
  'mrty': 'RTY=F'     // E-mini Russell 2000
};
```

### 8.2 数据缓存
实现数据缓存以提高性能：

```typescript
class DataCache {
  private cache = new Map();
  private ttl = 1000; // 1秒缓存

  set(key: string, value: any) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (item && Date.now() - item.timestamp < this.ttl) {
      return item.value;
    }
    return null;
  }
}
```

### 8.3 错误重试机制
实现自动重试机制：

```typescript
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}
```

## 9. 监控和维护

### 9.1 连接监控
- 监控API连接状态
- 记录数据获取成功率
- 设置告警机制

### 9.2 数据质量监控
- 检查数据延迟
- 验证价格合理性
- 监控数据完整性

### 9.3 性能优化
- 优化请求频率
- 实现数据缓存
- 使用连接池

## 10. 支持资源

- [IBKR API文档](https://interactivebrokers.github.io/tws-api/)
- [Polygon.io文档](https://polygon.io/docs/)
- [Finnhub文档](https://finnhub.io/docs/api)
- [Alpha Vantage文档](https://www.alphavantage.co/documentation/)

## 11. 测试清单

- [ ] IBKR账户已创建并激活
- [ ] TWS/IB Gateway已安装并配置
- [ ] API连接已启用
- [ ] 市场数据订阅已激活
- [ ] 环境变量已配置
- [ ] 备用数据源已设置
- [ ] 应用能正常获取MES数据
- [ ] 数据延迟在可接受范围内
- [ ] 错误处理机制正常工作
- [ ] 生产环境部署准备就绪 