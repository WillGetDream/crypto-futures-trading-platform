# IBKR API 下载和连接指南

## 1. IBKR API 下载

### 官方下载地址
- **IBKR API 官方页面**: https://www.interactivebrokers.com/en/trading/ib-api.php
- **直接下载链接**: https://www.interactivebrokers.com/download/ibapi/ibapi-10.19.2.zip

### 下载内容
下载的ZIP文件包含：
- `ibapi/` - Python API库
- `samples/` - 示例代码
- `doc/` - API文档

## 2. 安装方法

### 方法1: 使用pip安装（推荐）
```bash
pip install ibapi
```

### 方法2: 手动安装
```bash
# 解压下载的文件
unzip ibapi-10.19.2.zip

# 进入ibapi目录
cd ibapi

# 安装
python setup.py install
```

## 3. 基本连接代码

### Python 示例
```python
from ibapi.client import EClient
from ibapi.wrapper import EWrapper
from ibapi.contract import Contract
import threading
import time

class IBApp(EWrapper, EClient):
    def __init__(self):
        EClient.__init__(self, self)
        self.data = []
        
    def nextValidId(self, orderId):
        print(f"连接成功! Order ID: {orderId}")
        
    def error(self, reqId, errorCode, errorString):
        print(f"错误 {reqId} {errorCode} {errorString}")

def main():
    app = IBApp()
    
    # 连接到IB Gateway
    app.connect("127.0.0.1", 4002, 0)
    
    # 启动消息循环
    api_thread = threading.Thread(target=app.run, daemon=True)
    api_thread.start()
    
    # 等待连接
    time.sleep(1)
    
    # 请求MES合约数据
    contract = Contract()
    contract.symbol = "MES"
    contract.secType = "FUT"
    contract.exchange = "CME"
    contract.currency = "USD"
    contract.lastTradingDay = "20241220"  # 根据实际合约调整
    
    app.reqMktData(1, contract, "", False, False, [])
    
    # 保持运行
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        app.disconnect()

if __name__ == "__main__":
    main()
```

## 4. JavaScript/Node.js 连接

### 安装Node.js库
```bash
npm install ibapi
```

### Node.js 示例
```javascript
const { IB } = require('ibapi');

const ib = new IB({
    port: 4002,
    host: '127.0.0.1',
    clientId: 0
});

ib.on('connected', () => {
    console.log('连接到IB Gateway成功!');
    
    // 请求MES合约数据
    const contract = {
        symbol: 'MES',
        secType: 'FUT',
        exchange: 'CME',
        currency: 'USD',
        lastTradingDay: '20241220'
    };
    
    ib.reqMktData(1, contract, '', false, false, []);
});

ib.on('error', (error) => {
    console.error('IB API错误:', error);
});

ib.connect();
```

## 5. 当前项目中的IBKR连接

### 环境变量设置
在 `.env.local` 文件中：
```
VITE_IBKR_HOST=127.0.0.1
VITE_IBKR_PORT=4002
VITE_IBKR_CLIENT_ID=0
```

### 项目中的连接代码
查看 `src/services/ibkrService.ts` 文件，其中包含：
- REST API连接
- WebSocket连接
- 市场数据订阅
- 错误处理

## 6. IB Gateway 配置

### 必需设置
1. **启用API连接**: 在Gateway中勾选"Enable ActiveX and Socket Clients"
2. **端口设置**: 设置为4002
3. **本地主机限制**: 确保允许127.0.0.1连接
4. **市场数据订阅**: 确保有MES期货的市场数据权限

### 连接测试
```bash
# 测试端口是否开放
telnet 127.0.0.1 4002

# 测试REST API
curl http://127.0.0.1:4002/v1/api/one/user
```

## 7. 常见问题解决

### 连接被拒绝
- 检查IB Gateway是否运行
- 确认端口4002已开放
- 验证API权限已启用

### 认证失败
- 确保已在Gateway中登录账户
- 检查账户状态是否正常
- 验证市场数据订阅

### 市场数据权限
- 联系IBKR客服确认MES期货数据权限
- 检查账户类型是否支持期货交易

## 8. 有用的链接

- **IBKR API文档**: https://interactivebrokers.github.io/tws-api/
- **IB Gateway下载**: https://www.interactivebrokers.com/en/trading/ib-api.php
- **API示例代码**: https://github.com/InteractiveBrokers/tws-api
- **社区支持**: https://ibkr.info/

## 9. 下一步

1. 下载并安装IBKR API
2. 配置IB Gateway
3. 测试基本连接
4. 集成到当前项目中

需要我帮你设置具体的连接代码吗？ 