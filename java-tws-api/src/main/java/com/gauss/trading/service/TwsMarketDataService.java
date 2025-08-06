package com.gauss.trading.service;

import com.gauss.trading.controller.TwsWebSocketController;
import com.ib.client.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * TWS市场数据服务
 * 
 * 处理市场数据订阅和实时报价
 */
@Service
public class TwsMarketDataService {

    private static final Logger logger = LoggerFactory.getLogger(TwsMarketDataService.class);

    @Autowired
    private TwsConnectionService connectionService;

    @Autowired
    private TwsWebSocketController webSocketController;

    private final AtomicInteger nextTickerId = new AtomicInteger(1000);
    private final ConcurrentHashMap<Integer, CompletableFuture<Object>> marketDataRequests = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Integer, MarketDataInfo> activeSubscriptions = new ConcurrentHashMap<>();

    /**
     * 市场数据信息
     */
    public static class MarketDataInfo {
        public int tickerId;
        public String symbol;
        public String conId;
        public double lastPrice;
        public double bid;
        public double ask;
        public int bidSize;
        public int askSize;
        public int volume;
        public long timestamp;
        public String exchange;
        public String contractMonth;
        public String expiration;

        public MarketDataInfo(int tickerId, String symbol, String conId) {
            this.tickerId = tickerId;
            this.symbol = symbol;
            this.conId = conId;
            this.timestamp = System.currentTimeMillis();
        }

        public Map<String, Object> toMap() {
            Map<String, Object> map = new ConcurrentHashMap<>();
            map.put("tickerId", tickerId);
            map.put("symbol", symbol);
            map.put("conId", conId);
            map.put("lastPrice", lastPrice);
            map.put("bid", bid);
            map.put("ask", ask);
            map.put("bidSize", bidSize);
            map.put("askSize", askSize);
            map.put("volume", volume);
            map.put("timestamp", timestamp);
            map.put("exchange", exchange != null ? exchange : "");
            map.put("contractMonth", contractMonth != null ? contractMonth : "");
            map.put("expiration", expiration != null ? expiration : "");
            return map;
        }
    }

    /**
     * 订阅期货合约的实时市场数据
     */
    public CompletableFuture<Object> subscribeFuturesMarketData(String conId, String symbol, String contractMonth, String expiration) {
        logger.info("订阅期货市场数据: conId={}, symbol={}, contractMonth={}, expiration={}", conId, symbol, contractMonth, expiration);

        return CompletableFuture.supplyAsync(() -> {
            try {
                if (!connectionService.isConnected()) {
                    throw new RuntimeException("TWS未连接");
                }

                // 创建合约对象
                Contract contract = new Contract();
                contract.conid(Integer.parseInt(conId));
                contract.symbol(symbol);
                contract.secType("FUT");
                contract.exchange("CME");
                contract.currency("USD");
                
                // 设置合约月份和到期日
                if (contractMonth != null && !contractMonth.isEmpty()) {
                    contract.lastTradeDateOrContractMonth(contractMonth);
                }
                if (expiration != null && !expiration.isEmpty()) {
                    contract.lastTradeDate(expiration);
                }

                // 获取下一个ticker ID
                int tickerId = nextTickerId.getAndIncrement();
                
                // 创建市场数据信息对象
                MarketDataInfo marketDataInfo = new MarketDataInfo(tickerId, symbol, conId);
                marketDataInfo.contractMonth = contractMonth;
                marketDataInfo.expiration = expiration;
                marketDataInfo.exchange = "CME";
                
                // 存储订阅信息
                activeSubscriptions.put(tickerId, marketDataInfo);
                
                // 注册请求
                CompletableFuture<Object> future = new CompletableFuture<>();
                marketDataRequests.put(tickerId, future);

                // 订阅市场数据
                connectionService.getClient().reqMktData(tickerId, contract, "", false, false, null);

                logger.info("✅ 已发起期货市场数据订阅: tickerId={}, symbol={}", tickerId, symbol);
                
                // 返回初始市场数据信息
                return marketDataInfo.toMap();

            } catch (Exception e) {
                logger.error("订阅期货市场数据异常: {}", e.getMessage(), e);
                throw new RuntimeException("订阅市场数据失败: " + e.getMessage());
            }
        });
    }

    /**
     * 取消市场数据订阅
     */
    public void cancelMarketData(int tickerId) {
        try {
            if (connectionService.isConnected()) {
                connectionService.getClient().cancelMktData(tickerId);
                activeSubscriptions.remove(tickerId);
                marketDataRequests.remove(tickerId);
                logger.info("✅ 已取消市场数据订阅: tickerId={}", tickerId);
            }
        } catch (Exception e) {
            logger.error("取消市场数据订阅异常: {}", e.getMessage(), e);
        }
    }

    /**
     * 获取活跃的市场数据订阅
     */
    public Map<String, Object> getActiveSubscriptions() {
        Map<String, Object> result = new ConcurrentHashMap<>();
        activeSubscriptions.forEach((tickerId, info) -> {
            result.put(String.valueOf(tickerId), info.toMap());
        });
        return result;
    }

    /**
     * 处理tick价格更新
     */
    public void handleTickPrice(int tickerId, int field, double price, TickAttrib attrib) {
        MarketDataInfo info = activeSubscriptions.get(tickerId);
        if (info != null) {
            info.timestamp = System.currentTimeMillis();
            
            switch (field) {
                case 1: // Bid
                    info.bid = price;
                    break;
                case 2: // Ask
                    info.ask = price;
                    break;
                case 4: // Last
                    info.lastPrice = price;
                    break;
                case 6: // High
                    // 可以添加high字段
                    break;
                case 7: // Low
                    // 可以添加low字段
                    break;
                case 9: // Close
                    // 可以添加close字段
                    break;
            }
            
            logger.debug("Tick价格更新: tickerId={}, field={}, price={}, symbol={}", tickerId, field, price, info.symbol);
            
            // 通知前端数据更新
            notifyMarketDataUpdate(tickerId, info);
        }
    }

    /**
     * 处理tick数量更新
     */
    public void handleTickSize(int tickerId, int field, Decimal size) {
        MarketDataInfo info = activeSubscriptions.get(tickerId);
        if (info != null) {
            info.timestamp = System.currentTimeMillis();
            
            switch (field) {
                case 0: // Bid Size
                    info.bidSize = (int) size.longValue();
                    break;
                case 3: // Ask Size
                    info.askSize = (int) size.longValue();
                    break;
                case 5: // Last Size
                    // 可以添加lastSize字段
                    break;
                case 8: // Volume
                    info.volume = (int) size.longValue();
                    break;
            }
            
            logger.debug("Tick数量更新: tickerId={}, field={}, size={}, symbol={}", tickerId, field, size, info.symbol);
            
            // 通知前端数据更新
            notifyMarketDataUpdate(tickerId, info);
        }
    }

    /**
     * 通知前端市场数据更新
     */
    private void notifyMarketDataUpdate(int tickerId, MarketDataInfo info) {
        try {
            // 完成对应的请求
            CompletableFuture<Object> future = marketDataRequests.get(tickerId);
            if (future != null && !future.isDone()) {
                future.complete(info.toMap());
            }
            
            // 记录市场数据更新日志
            logger.info("📊 市场数据更新: tickerId={}, symbol={}, lastPrice={}, bid={}, ask={}, volume={}", 
                tickerId, info.symbol, info.lastPrice, info.bid, info.ask, info.volume);
            
            // 通过WebSocket推送实时数据到前端
            if (webSocketController != null) {
                Map<String, Object> marketData = info.toMap();
                webSocketController.broadcastMarketData(info.symbol, marketData);
                logger.debug("WebSocket推送市场数据: symbol={}, data={}", info.symbol, marketData);
            }
            
        } catch (Exception e) {
            logger.error("通知市场数据更新异常: {}", e.getMessage(), e);
        }
    }

    /**
     * 获取指定ticker的市场数据
     */
    public MarketDataInfo getMarketData(int tickerId) {
        return activeSubscriptions.get(tickerId);
    }

    /**
     * 获取所有活跃的市场数据
     */
    public Map<Integer, MarketDataInfo> getAllMarketData() {
        return new ConcurrentHashMap<>(activeSubscriptions);
    }
} 