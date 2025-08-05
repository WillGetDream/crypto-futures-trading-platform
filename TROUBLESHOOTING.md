# 🔧 故障排除指南

## 问题：未找到匹配的合约

### 可能的原因和解决方案

#### 1. **合约符号不正确**
**症状**: 搜索时显示"未找到匹配的合约"

**解决方案**:
- 确保使用正确的合约符号
- 支持的合约符号：
  - `MES` - Micro E-mini S&P 500
  - `MNQ` - Micro E-mini NASDAQ-100
  - `ES` - E-mini S&P 500
  - `NQ` - E-mini NASDAQ 100
  - `YM` - E-mini Dow Jones
  - `MYM` - Micro E-mini Dow Jones
  - `RTY` - E-mini Russell 2000
  - `MRTY` - Micro E-mini Russell 2000

#### 2. **IBKR API连接问题**
**症状**: 搜索无响应或长时间加载

**解决方案**:
1. 确保IBKR Gateway正在运行
2. 检查代理服务器状态
3. 访问测试页面: `http://localhost:5173/test-search.html`

#### 3. **网络连接问题**
**症状**: 搜索失败，显示网络错误

**解决方案**:
1. 检查网络连接
2. 确保可以访问 `localhost:3001`
3. 重启代理服务器

### 快速诊断步骤

#### 步骤1: 检查服务状态
```bash
# 检查代理服务器
curl http://localhost:3001/ibkr/iserver/auth/status

# 检查IBKR Gateway
curl -k https://localhost:5000/v1/api/iserver/auth/status
```

#### 步骤2: 测试搜索功能
1. 访问: `http://localhost:5173/test-search.html`
2. 输入 `MES` 并点击搜索
3. 查看结果

#### 步骤3: 使用备用数据
如果IBKR API不可用，系统会自动使用预定义的合约数据：
- MES合约 (3个不同月份)
- MNQ合约 (3个不同月份)
- ES合约 (2个不同月份)
- NQ合约 (2个不同月份)

### 常见错误信息

#### "未找到匹配的合约"
- 检查合约符号是否正确
- 尝试使用快速搜索按钮
- 确保使用大写字母

#### "搜索失败: 网络错误"
- 检查代理服务器是否运行
- 重启代理服务器: `node proxy-server.js`
- 检查防火墙设置

#### "IBKR API连接失败"
- 确保IBKR Gateway正在运行
- 检查端口5000是否被占用
- 接受SSL证书

### 预防措施

1. **定期检查服务状态**
2. **使用快速搜索按钮**
3. **保持IBKR Gateway运行**
4. **定期重启代理服务器**

### 获取帮助

如果问题仍然存在：
1. 查看浏览器控制台错误信息
2. 检查网络连接
3. 重启所有服务
4. 联系技术支持

---

💡 **提示**: 大多数情况下，使用快速搜索按钮可以避免输入错误，并快速找到需要的合约。 