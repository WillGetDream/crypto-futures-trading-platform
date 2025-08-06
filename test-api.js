// TWS API 连接测试脚本
import fetch from 'node-fetch';

const endpoints = [
  {
    name: '代理服务器 - IB Gateway',
    url: 'http://localhost:3001/ibkr/iserver/auth/status'
  },
  {
    name: '代理服务器 - TWS',
    url: 'http://localhost:3001/tws/iserver/auth/status'
  },
  {
    name: '直接连接 - IB Gateway',
    url: 'https://localhost:5000/v1/api/iserver/auth/status'
  },
  {
    name: '直接连接 - TWS',
    url: 'https://localhost:4002/v1/api/iserver/auth/status'
  }
];

const searchEndpoints = [
  {
    name: '代理服务器 - IB Gateway 搜索',
    url: 'http://localhost:3001/ibkr/iserver/secdef/search?symbol=MES&exchange=CME&currency=USD&secType=FUT'
  },
  {
    name: '代理服务器 - TWS 搜索',
    url: 'http://localhost:3001/tws/iserver/secdef/search?symbol=MES&exchange=CME&currency=USD&secType=FUT'
  },
  {
    name: '直接连接 - IB Gateway 搜索',
    url: 'https://localhost:5000/v1/api/iserver/secdef/search?symbol=MES&exchange=CME&currency=USD&secType=FUT'
  },
  {
    name: '直接连接 - TWS 搜索',
    url: 'https://localhost:4002/v1/api/iserver/secdef/search?symbol=MES&exchange=CME&currency=USD&secType=FUT'
  }
];

async function testEndpoint(endpoint) {
  console.log(`\n🔍 测试端点: ${endpoint.name}`);
  console.log(`   URL: ${endpoint.url}`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
    
    const response = await fetch(endpoint.url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'IBKR-Client/1.0'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log(`   状态码: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ 连接成功`);
      console.log(`   响应数据: ${JSON.stringify(data).substring(0, 200)}...`);
      return true;
    } else {
      console.log(`   ❌ 连接失败: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ 请求失败: ${error.message}`);
    return false;
  }
}

async function testAllEndpoints() {
  console.log('🚀 开始测试TWS API连接...\n');
  
  console.log('=== 连接状态测试 ===');
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 延迟1秒
  }
  
  console.log('\n=== 合约搜索测试 ===');
  for (const endpoint of searchEndpoints) {
    await testEndpoint(endpoint);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 延迟1秒
  }
  
  console.log('\n✅ 所有端点测试完成');
}

// 运行测试
testAllEndpoints().catch(console.error); 