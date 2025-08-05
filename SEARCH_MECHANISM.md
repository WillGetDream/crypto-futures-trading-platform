# 🔍 搜索机制详细说明

## 当前搜索流程

### 1. 搜索请求流程
```
用户输入搜索词 → 前端组件 → IBKR服务 → 代理服务器 → IBKR Gateway
```

### 2. 实际数据来源

#### ❌ IBKR API (通常不可用)
- **端点**: `https://localhost:5000/v1/api/iserver/contract/search`
- **状态**: 返回"Resource not found"
- **原因**: IBKR Gateway的合约搜索API可能未启用或路径不正确

#### ✅ 预定义数据 (实际使用)
- **来源**: 代码中硬编码的合约数据
- **更新频率**: 静态数据，需要手动更新
- **可靠性**: 100%可用

## 数据对比

### IBKR实时API (理想情况)
```javascript
// 如果IBKR API正常工作，会返回实时数据
{
  "conid": "730283085",
  "symbol": "MES",
  "secType": "FUT",
  "exchange": "CME",
  "currency": "USD",
  "description": "Micro E-Mini S&P 500 DEC25",
  "companyHeader": "Micro E-Mini S&P 500",
  "companyName": "CME Group",
  "sections": [...],
  "lastPrice": 5234.50,  // 实时价格
  "bid": 5234.25,        // 实时买价
  "ask": 5234.75,        // 实时卖价
  "volume": 12345,       // 实时成交量
  "timestamp": "2025-01-03T10:30:00Z"
}
```

### 当前预定义数据 (实际情况)
```javascript
// 当前使用的静态数据
{
  "conid": "730283085",
  "symbol": "MES",
  "secType": "FUT",
  "exchange": "CME",
  "currency": "USD",
  "description": "Micro E-Mini S&P 500 DEC25",
  "companyHeader": "Micro E-Mini S&P 500",
  "companyName": "CME Group",
  "sections": [{ secType: 'FUT', exchange: 'CME', months: 'DEC25;MAR26;JUN26;SEP26' }]
  // 注意：没有实时价格数据
}
```

## 支持的合约

### 预定义合约列表
- **MES**: 3个不同月份 (DEC25, SEP25, MAR26)
- **MNQ**: 3个不同月份 (DEC25, SEP25, MAR26)
- **ES**: 2个不同月份 (DEC25, SEP25)
- **NQ**: 2个不同月份 (DEC25, SEP25)
- **YM**: 1个月份 (DEC25)
- **MYM**: 1个月份 (DEC25)
- **RTY**: 1个月份 (DEC25)
- **MRTY**: 1个月份 (DEC25)

## 实时性分析

### ❌ 非实时数据
- **合约信息**: 静态预定义
- **价格数据**: 模拟数据 (随机生成)
- **成交量**: 模拟数据
- **更新时间**: 固定

### ✅ 实时功能
- **搜索响应**: 实时响应
- **用户交互**: 实时反馈
- **配置保存**: 实时保存到localStorage

## 改进建议

### 1. 启用真正的IBKR API
```bash
# 需要配置IBKR Gateway的合约搜索功能
# 可能需要特定的API权限或配置
```

### 2. 添加实时价格订阅
```javascript
// 配置合约后，订阅实时价格
ibkrService.subscribeToRealTimeData(conid);
```

### 3. 使用其他数据源
- **Alpha Vantage API**: 免费，每天500次请求
- **Yahoo Finance API**: 免费，无需密钥
- **CoinGecko API**: 免费，加密货币数据

## 当前状态总结

| 功能 | 状态 | 数据来源 |
|------|------|----------|
| 合约搜索 | ✅ 工作 | 预定义数据 |
| 合约配置 | ✅ 工作 | 本地存储 |
| 价格显示 | ⚠️ 模拟 | 随机生成 |
| 实时更新 | ❌ 无 | 静态数据 |
| IBKR连接 | ✅ 连接 | 认证成功 |

## 结论

**当前搜索不是实时IBKR API**，而是使用预定义的静态数据。这确保了功能的可用性，但缺乏实时性。如果需要真正的实时数据，需要：

1. 配置IBKR Gateway的合约搜索API
2. 或集成其他实时数据源
3. 或实现WebSocket连接获取实时价格

---

💡 **提示**: 虽然数据不是实时的，但搜索功能完全可用，可以正常配置和使用合约。 