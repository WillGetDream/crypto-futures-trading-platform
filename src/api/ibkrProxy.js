// IBKR API代理函数
export async function ibkrProxy(endpoint, options = {}) {
  try {
    // 使用fetch的no-cors模式，然后通过其他方式处理
    const response = await fetch(`https://localhost:5000/v1/api/iserver${endpoint}`, {
      ...options,
      mode: 'cors', // 尝试cors模式
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('IBKR代理请求失败:', error);
    throw error;
  }
}

// 搜索期货合约
export async function searchFuturesContracts(symbol, exchange = 'CME', currency = 'USD') {
  return ibkrProxy('/secdef/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      symbol,
      secType: 'FUT',
      exchange,
      currency
    })
  });
}

// 获取合约详情
export async function getContractDetails(conid, sectype, month, exchange) {
  let url = `/secdef/info?conid=${conid}`;
  if (sectype) url += `&sectype=${sectype}`;
  if (month) url += `&month=${month}`;
  if (exchange) url += `&exchange=${exchange}`;
  
  return ibkrProxy(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
} 