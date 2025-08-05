import fetch from 'node-fetch';
import https from 'https';

// 创建忽略SSL证书的agent
const agent = new https.Agent({
  rejectUnauthorized: false
});

// 搜索IBKR合约的脚本
async function searchContracts(symbol = 'MES') {
  try {
    console.log(`🔍 搜索 ${symbol} 合约...`);
    
    // 搜索基础合约
    const searchResponse = await fetch(`https://localhost:5000/v1/api/iserver/secdef/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbol: symbol,
        secType: 'FUT',
        exchange: 'CME',
        currency: 'USD'
      }),
      agent: agent // 使用忽略SSL证书的agent
    });

    if (!searchResponse.ok) {
      throw new Error(`搜索失败: ${searchResponse.status}`);
    }

    const contracts = await searchResponse.json();
    console.log(`✅ 找到 ${contracts.length} 个合约:`);
    
    // 显示基础合约信息
    for (let i = 0; i < contracts.length; i++) {
      const contract = contracts[i];
      console.log(`\n${i + 1}. ${contract.symbol} - ${contract.companyName}`);
      console.log(`   合约ID: ${contract.conid}`);
      console.log(`   交易所: ${contract.exchange}`);
      console.log(`   描述: ${contract.description}`);
      
      // 显示可用月份
      if (contract.sections) {
        const futSection = contract.sections.find(s => s.secType === 'FUT');
        if (futSection && futSection.months) {
          console.log(`   可用月份: ${futSection.months}`);
          
          // 获取每个月份的具体合约
          const months = futSection.months.split(';');
          console.log(`\n   具体月份合约:`);
          
          for (const month of months) {
            try {
              const monthResponse = await fetch(`https://localhost:5000/v1/api/iserver/secdef/info?conid=${contract.conid}&sectype=FUT&month=${month}&exchange=CME`, {
                agent: agent // 使用忽略SSL证书的agent
              });
              if (monthResponse.ok) {
                const monthData = await monthResponse.json();
                if (monthData && monthData.length > 0) {
                  const monthContract = monthData[0];
                  console.log(`     ${month}: 合约ID ${monthContract.conid}, 到期 ${monthContract.maturityDate}, 乘数 ${monthContract.multiplier}`);
                }
              }
            } catch (error) {
              console.log(`     ${month}: 获取失败`);
            }
          }
        }
      }
    }
    
    return contracts;
  } catch (error) {
    console.error('❌ 搜索失败:', error.message);
    return [];
  }
}

// 主函数
async function main() {
  const symbol = process.argv[2] || 'MES';
  console.log(`🚀 开始搜索 ${symbol} 合约...\n`);
  
  const contracts = await searchContracts(symbol);
  
  if (contracts.length > 0) {
    console.log(`\n✅ 搜索完成！找到 ${contracts.length} 个合约。`);
    console.log(`\n💡 你可以选择任意合约ID来配置你的应用。`);
  } else {
    console.log(`\n❌ 未找到 ${symbol} 合约。`);
  }
}

// 运行脚本
main().catch(console.error); 