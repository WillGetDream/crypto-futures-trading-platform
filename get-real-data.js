import fetch from 'node-fetch';
import https from 'https';

// 创建忽略SSL证书的agent
const agent = new https.Agent({
  rejectUnauthorized: false
});

// 获取合约实时数据
async function getContractData(conid) {
  try {
    console.log(`🔍 获取合约 ${conid} 的实时数据...`);
    
    const response = await fetch(`https://localhost:5000/v1/api/iserver/marketdata/snapshot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conids: [conid]
      }),
      agent: agent
    });

    if (!response.ok) {
      console.log(`⚠️ 合约 ${conid} 数据获取失败: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log(`✅ 合约 ${conid} 数据:`, data);
    return data;
  } catch (error) {
    console.error(`❌ 获取合约 ${conid} 数据失败:`, error.message);
    return null;
  }
}

// 主函数
async function main() {
  const contracts = [
    { symbol: 'MES DEC25', conid: 730283085 },
    { symbol: 'ES DEC25', conid: 495512563 },
    { symbol: 'MNQ DEC25', conid: 730283094 },
    { symbol: 'NQ DEC25', conid: 563947738 }
  ];

  console.log('🚀 开始获取实时合约数据...\n');

  for (const contract of contracts) {
    const data = await getContractData(contract.conid);
    if (data) {
      console.log(`📊 ${contract.symbol}:`, data);
    } else {
      console.log(`❌ ${contract.symbol}: 无数据`);
    }
    console.log('---');
  }

  console.log('✅ 数据获取完成！');
}

// 运行脚本
main().catch(console.error); 