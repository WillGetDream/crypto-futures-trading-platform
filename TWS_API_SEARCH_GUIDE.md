# 🎯 TWS API 实时合约搜索使用指南

## 📋 功能概述

本系统现在支持通过 **TWS API** 进行实时合约搜索，而不是使用预定义的模拟数据。这意味着您可以搜索到最新的、真实的合约信息。

## 🔧 前置要求

### 1. 安装并启动 TWS 或 IB Gateway
- **TWS (Trader Workstation)**: 下载并安装最新版本
- **IB Gateway**: 轻量级替代方案，专门用于API连接

### 2. 配置 API 连接
在 TWS/Gateway 中启用 API 连接：
1. 打开 TWS/Gateway
2. 进入 `File` → `Global Configuration` → `API` → `Settings`
3. 启用 `Enable ActiveX and Socket Clients`
4. 设置端口：
   - **TWS**: 7496 (默认) 或 4002
   - **IB Gateway**: 5000 (默认)
5. 保存设置并重启

### 3. 启动代理服务器
```bash
# 启动代理服务器（处理SSL证书问题）
node proxy-server.js
```

## 🚀 使用步骤

### 1. 搜索合约
1. 打开应用：http://localhost:5174
2. 滚动到"合约搜索管理器"
3. 在搜索框中输入合约符号（如：`MES`, `MNQ`, `ES`, `NQ`）
4. 点击"🔍 TWS API搜索"按钮

### 2. 查看搜索结果
- 系统会显示"正在连接TWS API..."
- 成功后会显示"🎯 TWS API搜索结果"
- 每个合约显示详细信息：
  - 合约ID (conid)
  - 交易所
  - 到期日
  - 描述

### 3. 配置合约
1. 从搜索结果中选择合适的合约
2. 点击"🎯 配置TWS合约"按钮
3. 系统会显示配置成功消息
4. 合约自动添加到交易界面

### 4. 在交易界面使用
1. 在上方交易界面中查看"🎯 TWS API 已配置合约"分组
2. 选择配置的合约
3. 查看价格图表和交易数据

## 🔍 支持的合约类型

### 期货合约
- **MES**: Micro E-Mini S&P 500
- **MNQ**: Micro E-Mini NASDAQ-100
- **ES**: E-mini S&P 500
- **NQ**: E-mini NASDAQ 100
- **YM**: E-mini Dow Jones
- **MYM**: Micro E-mini Dow Jones
- **RTY**: E-mini Russell 2000
- **MRTY**: Micro E-mini Russell 2000

### 其他合约
- 股票
- 期权
- 外汇
- 商品

## 🌐 API 端点

系统会自动尝试以下端点：

1. **代理服务器端点**:
   - `http://localhost:3001/ibkr/iserver/secdef/search`
   - `http://localhost:3001/tws/iserver/secdef/search`

2. **直接连接端点**:
   - `https://localhost:5000/v1/api/iserver/secdef/search` (IB Gateway)
   - `https://localhost:4002/v1/api/iserver/secdef/search` (TWS)

## ⚠️ 故障排除

### 常见问题

1. **"TWS API搜索失败"**
   - 检查 TWS/Gateway 是否正在运行
   - 确认 API 连接已启用
   - 检查端口设置是否正确

2. **"未找到匹配的合约"**
   - 确认合约符号拼写正确
   - 检查交易所设置（默认：CME）
   - 尝试其他合约符号

3. **SSL证书错误**
   - 确保代理服务器正在运行
   - 检查防火墙设置

4. **连接超时**
   - 检查网络连接
   - 确认 TWS/Gateway 端口可访问
   - 重启代理服务器

### 调试步骤

1. 打开浏览器开发者工具
2. 查看控制台日志
3. 检查网络请求
4. 确认 TWS/Gateway 状态

## 📊 技术细节

### 搜索流程
1. 调用 TWS API `/iserver/secdef/search` 端点
2. 获取基础合约信息
3. 获取每个合约的详细信息
4. 保存到本地数据库
5. 显示在界面上

### 数据格式
```json
{
  "conid": "730283085",
  "symbol": "MES",
  "secType": "FUT",
  "exchange": "CME",
  "currency": "USD",
  "description": "Micro E-Mini S&P 500 DEC25",
  "companyHeader": "Micro E-Mini S&P 500",
  "companyName": "CME Group"
}
```

## 🎉 优势

- ✅ **实时数据**: 获取最新的合约信息
- ✅ **完整信息**: 包含所有合约详情
- ✅ **自动更新**: 支持新合约自动发现
- ✅ **多交易所**: 支持多个交易所的合约
- ✅ **用户友好**: 直观的界面和操作流程

## 📞 支持

如果遇到问题，请检查：
1. TWS/Gateway 连接状态
2. 代理服务器运行状态
3. 浏览器控制台错误信息
4. 网络连接状态

---

**注意**: 本功能需要有效的 IBKR 账户和 TWS/Gateway 连接。请确保遵守 IBKR 的使用条款。 