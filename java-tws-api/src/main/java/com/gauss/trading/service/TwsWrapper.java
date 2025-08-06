package com.gauss.trading.service;

import com.ib.client.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.HashSet;
import java.util.HashMap;

/**
 * TWS包装器
 * 
 * 继承自DefaultEWrapper，处理TWS API回调
 */
public class TwsWrapper extends DefaultEWrapper {

    private static final Logger logger = LoggerFactory.getLogger(TwsWrapper.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final TwsConnectionService connectionService;
    private final Map<Integer, ContractDetails> contractDetailsMap = new ConcurrentHashMap<>();

    public TwsWrapper(TwsConnectionService connectionService) {
        this.connectionService = connectionService;
    }

    // ==================== 核心回调方法 ====================

    @Override
    public void connectAck() {
        logger.info("TWS连接确认");
        connectionService.completePendingRequest(0, true);
    }

    @Override
    public void connectionClosed() {
        logger.info("TWS连接关闭");
        connectionService.completePendingRequest(0, false);
    }

    @Override
    public void contractDetails(int reqId, ContractDetails contractDetails) {
        try {
            logger.info("收到合约详情: reqId={}, symbol={}", reqId, contractDetails.contract().symbol());
            
            // 存储合约详情
            contractDetailsMap.put(reqId, contractDetails);
            
            // 转换为可序列化的Map，处理null值
            Map<String, Object> contractMap = new HashMap<>();
            contractMap.put("conId", contractDetails.contract().conid());
            contractMap.put("symbol", contractDetails.contract().symbol() != null ? contractDetails.contract().symbol() : "");
            contractMap.put("secType", contractDetails.contract().secType() != null ? contractDetails.contract().secType() : "");
            contractMap.put("exchange", contractDetails.contract().exchange() != null ? contractDetails.contract().exchange() : "");
            contractMap.put("currency", contractDetails.contract().currency() != null ? contractDetails.contract().currency() : "");
            contractMap.put("multiplier", contractDetails.contract().multiplier() != null ? contractDetails.contract().multiplier() : "");
            contractMap.put("tradingClass", contractDetails.contract().tradingClass() != null ? contractDetails.contract().tradingClass() : "");
            contractMap.put("description", contractDetails.contract().description() != null ? contractDetails.contract().description() : "");
            
            // 添加到期日期信息
            contractMap.put("contractMonth", contractDetails.contractMonth() != null ? contractDetails.contractMonth() : "");
            contractMap.put("realExpirationDate", contractDetails.realExpirationDate() != null ? contractDetails.realExpirationDate() : "");
            contractMap.put("lastTradeTime", contractDetails.lastTradeTime() != null ? contractDetails.lastTradeTime() : "");
            
            // 转换为JSON
            String json = objectMapper.writeValueAsString(contractMap);
            
            // 完成请求
            connectionService.completePendingRequest(reqId, json);
            
        } catch (Exception e) {
            logger.error("处理合约详情异常: {}", e.getMessage(), e);
            connectionService.completePendingRequestWithError(reqId, e);
        }
    }

    @Override
    public void contractDetailsEnd(int reqId) {
        logger.info("合约详情请求完成: reqId={}", reqId);
    }

    @Override
    public void tickPrice(int tickerId, int field, double price, TickAttrib attrib) {
        try {
            logger.debug("Tick价格: tickerId={}, field={}, price={}", tickerId, field, price);
            
            // 创建市场数据对象
            Map<String, Object> marketData = Map.of(
                "tickerId", tickerId,
                "field", field,
                "price", price,
                "type", "price"
            );
            
            String json = objectMapper.writeValueAsString(marketData);
            connectionService.completePendingRequest(tickerId, json);
            
        } catch (Exception e) {
            logger.error("处理Tick价格异常: {}", e.getMessage(), e);
        }
    }

    @Override
    public void tickSize(int tickerId, int field, Decimal size) {
        try {
            logger.debug("Tick数量: tickerId={}, field={}, size={}", tickerId, field, size);
            
            Map<String, Object> marketData = Map.of(
                "tickerId", tickerId,
                "field", field,
                "size", size,
                "type", "size"
            );
            
            String json = objectMapper.writeValueAsString(marketData);
            connectionService.completePendingRequest(tickerId, json);
            
        } catch (Exception e) {
            logger.error("处理Tick数量异常: {}", e.getMessage(), e);
        }
    }

    public void orderStatus(int orderId, String status, int filled, int remaining,
                           double avgFillPrice, int permId, int parentId, double lastFillPrice,
                           int clientId, String whyHeld, double mktCapPrice) {
        try {
            logger.info("订单状态: orderId={}, status={}, filled={}, remaining={}", 
                       orderId, status, filled, remaining);
            
            Map<String, Object> orderStatus = Map.of(
                "orderId", orderId,
                "status", status,
                "filled", filled,
                "remaining", remaining,
                "avgFillPrice", avgFillPrice
            );
            
            String json = objectMapper.writeValueAsString(orderStatus);
            connectionService.completePendingRequest(orderId, json);
            
        } catch (Exception e) {
            logger.error("处理订单状态异常: {}", e.getMessage(), e);
        }
    }

    @Override
    public void accountSummary(int reqId, String account, String tag, String value, String currency) {
        try {
            logger.info("账户摘要: reqId={}, account={}, tag={}, value={}", reqId, account, tag, value);
            
            Map<String, Object> accountSummary = Map.of(
                "reqId", reqId,
                "account", account,
                "tag", tag,
                "value", value,
                "currency", currency
            );
            
            String json = objectMapper.writeValueAsString(accountSummary);
            connectionService.completePendingRequest(reqId, json);
            
        } catch (Exception e) {
            logger.error("处理账户摘要异常: {}", e.getMessage(), e);
        }
    }

    @Override
    public void position(String account, Contract contract, Decimal pos, double avgCost) {
        try {
            logger.info("持仓: account={}, symbol={}, pos={}, avgCost={}", 
                       account, contract.symbol(), pos, avgCost);
            
            Map<String, Object> position = Map.of(
                "account", account,
                "symbol", contract.symbol(),
                "position", pos,
                "avgCost", avgCost
            );
            
            String json = objectMapper.writeValueAsString(position);
            connectionService.completePendingRequest(0, json);
            
        } catch (Exception e) {
            logger.error("处理持仓异常: {}", e.getMessage(), e);
        }
    }

    public void error(int id, int errorCode, String errorString) {
        logger.error("TWS错误: id={}, errorCode={}, errorString={}", id, errorCode, errorString);
        
        try {
            Map<String, Object> error = Map.of(
                "id", id,
                "errorCode", errorCode,
                "errorString", errorString
            );
            
            String json = objectMapper.writeValueAsString(error);
            connectionService.completePendingRequestWithError(id, new Exception(errorString));
            
        } catch (Exception e) {
            logger.error("处理错误异常: {}", e.getMessage(), e);
        }
    }

    @Override
    public void nextValidId(int orderId) {
        logger.info("下一个有效ID: {}", orderId);
    }

    public void connectionLost() {
        logger.warn("连接丢失");
        connectionService.completePendingRequest(0, false);
    }

    // ==================== 其他重要方法的重写 ====================

    @Override
    public void tickString(int tickerId, int tickType, String value) {
        logger.debug("Tick字符串: tickerId={}, tickType={}, value={}", tickerId, tickType, value);
    }

    @Override
    public void tickGeneric(int tickerId, int tickType, double value) {
        logger.debug("Tick通用: tickerId={}, tickType={}, value={}", tickerId, tickType, value);
    }

    @Override
    public void openOrder(int orderId, Contract contract, Order order, OrderState orderState) {
        logger.info("开仓订单: orderId={}, symbol={}", orderId, contract.symbol());
    }

    @Override
    public void openOrderEnd() {
        logger.info("开仓订单结束");
    }

    @Override
    public void execDetails(int reqId, Contract contract, Execution execution) {
        logger.info("执行详情: reqId={}, symbol={}", reqId, contract.symbol());
    }

    @Override
    public void execDetailsEnd(int reqId) {
        logger.info("执行详情结束: reqId={}", reqId);
    }

    @Override
    public void accountSummaryEnd(int reqId) {
        logger.info("账户摘要结束: reqId={}", reqId);
    }

    @Override
    public void positionEnd() {
        logger.info("持仓结束");
    }

    @Override
    public void currentTime(long time) {
        logger.debug("当前时间: {}", time);
    }

    public void winError(String str, int lastError) {
        logger.error("Windows错误: {}, lastError={}", str, lastError);
    }

    @Override
    public void managedAccounts(String accountsList) {
        logger.info("管理账户: {}", accountsList);
    }

    @Override
    public void receiveFA(int faDataType, String xml) {
        logger.info("接收FA: faDataType={}", faDataType);
    }

    @Override
    public void historicalData(int reqId, Bar bar) {
        logger.debug("历史数据: reqId={}, bar={}", reqId, bar);
    }

    @Override
    public void historicalDataEnd(int reqId, String startDateStr, String endDateStr) {
        logger.info("历史数据结束: reqId={}", reqId);
    }

    @Override
    public void scannerParameters(String xml) {
        logger.info("扫描器参数: {}", xml);
    }

    @Override
    public void scannerData(int reqId, int rank, ContractDetails contractDetails, String distance,
                           String benchmark, String projection, String legsStr) {
        logger.info("扫描器数据: reqId={}, rank={}", reqId, rank);
    }

    @Override
    public void scannerDataEnd(int reqId) {
        logger.info("扫描器数据结束: reqId={}", reqId);
    }

    @Override
    public void realtimeBar(int reqId, long time, double open, double high, double low, double close,
                           Decimal volume, Decimal wap, int count) {
        logger.debug("实时K线: reqId={}, close={}", reqId, close);
    }

    @Override
    public void fundamentalData(int reqId, String data) {
        logger.info("基本面数据: reqId={}", reqId);
    }

    @Override
    public void deltaNeutralValidation(int reqId, DeltaNeutralContract underComp) {
        logger.info("Delta中性验证: reqId={}", reqId);
    }

    @Override
    public void tickSnapshotEnd(int reqId) {
        logger.info("Tick快照结束: reqId={}", reqId);
    }

    @Override
    public void marketDataType(int reqId, int marketDataType) {
        logger.info("市场数据类型: reqId={}, marketDataType={}", reqId, marketDataType);
    }

    // 删除commissionReport方法，因为CommissionReport类不存在

    @Override
    public void positionMulti(int reqId, String account, String modelCode, Contract contract, Decimal pos, double avgCost) {
        logger.info("多账户持仓: reqId={}, account={}", reqId, account);
    }

    @Override
    public void positionMultiEnd(int reqId) {
        logger.info("多账户持仓结束: reqId={}", reqId);
    }

    @Override
    public void accountUpdateMulti(int reqId, String account, String modelCode, String key, String value, String currency) {
        logger.info("多账户更新: reqId={}, account={}", reqId, account);
    }

    @Override
    public void accountUpdateMultiEnd(int reqId) {
        logger.info("多账户更新结束: reqId={}", reqId);
    }

    @Override
    public void securityDefinitionOptionalParameter(int reqId, String exchange, int underlyingConId, String tradingClass,
                                                   String multiplier, Set<String> expirations, Set<Double> strikes) {
        logger.info("证券定义可选参数: reqId={}", reqId);
    }

    @Override
    public void securityDefinitionOptionalParameterEnd(int reqId) {
        logger.info("证券定义可选参数结束: reqId={}", reqId);
    }

    @Override
    public void softDollarTiers(int reqId, SoftDollarTier[] tiers) {
        logger.info("软美元层级: reqId={}", reqId);
    }

    @Override
    public void familyCodes(FamilyCode[] familyCodes) {
        logger.info("家族代码: {}", familyCodes);
    }

    @Override
    public void symbolSamples(int reqId, ContractDescription[] contractDescriptions) {
        logger.info("符号样本: reqId={}", reqId);
    }

    @Override
    public void mktDepthExchanges(DepthMktDataDescription[] depthMktDataDescriptions) {
        logger.info("市场深度交易所: {}", depthMktDataDescriptions);
    }

    @Override
    public void tickNews(int tickerId, long timeStamp, String providerCode, String articleId, String headline, String extraData) {
        logger.info("Tick新闻: tickerId={}", tickerId);
    }

    // 删除smartComponents方法，因为与父类方法冲突

    @Override
    public void tickReqParams(int tickerId, double minTick, String bboExchange, int snapshotPermissions) {
        logger.info("Tick请求参数: tickerId={}", tickerId);
    }

    @Override
    public void newsProviders(NewsProvider[] newsProviders) {
        logger.info("新闻提供商: {}", newsProviders);
    }

    @Override
    public void newsArticle(int requestId, int articleType, String articleText) {
        logger.info("新闻文章: requestId={}", requestId);
    }

    @Override
    public void historicalNews(int requestId, String time, String providerCode, String articleId, String headline) {
        logger.info("历史新闻: requestId={}", requestId);
    }

    @Override
    public void historicalNewsEnd(int requestId, boolean hasMore) {
        logger.info("历史新闻结束: requestId={}", requestId);
    }

    @Override
    public void headTimestamp(int reqId, String headTimestamp) {
        logger.info("头部时间戳: reqId={}", reqId);
    }

    @Override
    public void histogramData(int reqId, List<HistogramEntry> items) {
        logger.info("直方图数据: reqId={}", reqId);
    }

    @Override
    public void historicalDataUpdate(int reqId, Bar bar) {
        logger.debug("历史数据更新: reqId={}", reqId);
    }

    @Override
    public void rerouteMktDataReq(int reqId, int conId, String exchange) {
        logger.info("重新路由市场数据请求: reqId={}", reqId);
    }

    @Override
    public void rerouteMktDepthReq(int reqId, int conId, String exchange) {
        logger.info("重新路由市场深度请求: reqId={}", reqId);
    }

    @Override
    public void marketRule(int marketRuleId, PriceIncrement[] priceIncrements) {
        logger.info("市场规则: marketRuleId={}", marketRuleId);
    }

    @Override
    public void pnl(int reqId, double dailyPnL, double unrealizedPnL, double realizedPnL) {
        logger.info("PnL: reqId={}, dailyPnL={}", reqId, dailyPnL);
    }

    @Override
    public void pnlSingle(int reqId, Decimal pos, double dailyPnL, double unrealizedPnL, double realizedPnL, double value) {
        logger.info("单个PnL: reqId={}, pos={}", reqId, pos);
    }

    @Override
    public void historicalTicks(int reqId, List<HistoricalTick> ticks, boolean done) {
        logger.info("历史Ticks: reqId={}, count={}", reqId, ticks.size());
    }

    @Override
    public void historicalTicksBidAsk(int reqId, List<HistoricalTickBidAsk> ticks, boolean done) {
        logger.info("历史Ticks买卖: reqId={}, count={}", reqId, ticks.size());
    }

    @Override
    public void historicalTicksLast(int reqId, List<HistoricalTickLast> ticks, boolean done) {
        logger.info("历史Ticks最后: reqId={}, count={}", reqId, ticks.size());
    }

    @Override
    public void tickByTickAllLast(int reqId, int tickType, long time, double price, Decimal size, TickAttribLast tickAttribLast,
                                 String exchange, String specialConditions) {
        logger.debug("Tick逐Tick全部最后: reqId={}, price={}", reqId, price);
    }

    @Override
    public void tickByTickBidAsk(int reqId, long time, double bidPrice, double askPrice, Decimal bidSize, Decimal askSize,
                                TickAttribBidAsk tickAttribBidAsk) {
        logger.debug("Tick逐Tick买卖: reqId={}, bid={}, ask={}", reqId, bidPrice, askPrice);
    }

    @Override
    public void tickByTickMidPoint(int reqId, long time, double midPoint) {
        logger.debug("Tick逐Tick中点: reqId={}, midPoint={}", reqId, midPoint);
    }

    @Override
    public void orderBound(long orderId, int apiClientId, int apiOrderId) {
        logger.info("订单绑定: orderId={}", orderId);
    }

    @Override
    public void completedOrder(Contract contract, Order order, OrderState orderState) {
        logger.info("完成订单: symbol={}", contract.symbol());
    }

    @Override
    public void completedOrdersEnd() {
        logger.info("完成订单结束");
    }

    @Override
    public void replaceFAEnd(int reqId, String text) {
        logger.info("替换FA结束: reqId={}", reqId);
    }

    @Override
    public void wshMetaData(int reqId, String data) {
        logger.info("WSH元数据: reqId={}", reqId);
    }

    @Override
    public void wshEventData(int reqId, String data) {
        logger.info("WSH事件数据: reqId={}", reqId);
    }

    @Override
    public void historicalSchedule(int reqId, String startDateTime, String endDateTime, String timeZone,
                                 List<HistoricalSession> sessions) {
        logger.info("历史计划: reqId={}", reqId);
    }

    @Override
    public void userInfo(int reqId, String whiteBrandingId) {
        logger.info("用户信息: reqId={}", reqId);
    }

    @Override
    public void verifyCompleted(boolean isSuccessful, String errorText) {
        logger.info("验证完成: isSuccessful={}, errorText={}", isSuccessful, errorText);
    }

    @Override
    public void verifyAndAuthCompleted(boolean isSuccessful, String errorText) {
        logger.info("验证和认证完成: isSuccessful={}, errorText={}", isSuccessful, errorText);
    }

    @Override
    public void displayGroupList(int reqId, String groups) {
        logger.info("显示组列表: reqId={}", reqId);
    }

    @Override
    public void displayGroupUpdated(int reqId, String contractInfo) {
        logger.info("显示组更新: reqId={}", reqId);
    }

    @Override
    public void updateAccountValue(String key, String value, String currency, String accountName) {
        logger.info("更新账户值: key={}, value={}, currency={}", key, value, currency);
    }

    @Override
    public void updateMktDepth(int tickerId, int position, int operation, int side, double price, Decimal size) {
        logger.debug("更新市场深度: tickerId={}, position={}, operation={}", tickerId, position, operation);
    }

    @Override
    public void verifyAndAuthMessageAPI(String apiData, String xyzChallenge) {
        logger.info("验证和认证消息API: apiData={}", apiData);
    }
} 