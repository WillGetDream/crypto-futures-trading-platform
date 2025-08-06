package com.gauss.trading.controller;

import com.gauss.trading.service.TwsConnectionService;
import com.gauss.trading.service.TwsContractService;
import com.gauss.trading.service.TwsMarketDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * TWS API REST控制器
 * 
 * 提供RESTful API接口用于TWS操作
 */
@RestController
@RequestMapping("/api/tws")
@CrossOrigin(origins = "*")
public class TwsApiController {

    @Autowired
    private TwsConnectionService connectionService;

    @Autowired
    private TwsContractService contractService;

    @Autowired
    private TwsMarketDataService marketDataService;

    // ==================== 连接管理 ====================

    /**
     * 连接到TWS Gateway
     */
    @PostMapping("/connect")
    public CompletableFuture<ResponseEntity<Map<String, Object>>> connect(
            @RequestParam(defaultValue = "localhost") String host,
            @RequestParam(defaultValue = "4002") int port,
            @RequestParam(defaultValue = "0") int clientId) {
        
        return connectionService.connect(host, port, clientId)
                .thenApply(success -> {
                    Map<String, Object> response = Map.of(
                        "success", success,
                        "message", success ? "连接成功" : "连接失败",
                        "connectionInfo", connectionService.getConnectionInfo()
                    );
                    return ResponseEntity.ok(response);
                });
    }

    /**
     * 断开TWS连接
     */
    @PostMapping("/disconnect")
    public ResponseEntity<Map<String, Object>> disconnect() {
        connectionService.disconnect();
        
        Map<String, Object> response = Map.of(
            "success", true,
            "message", "连接已断开",
            "connectionInfo", connectionService.getConnectionInfo()
        );
        
        return ResponseEntity.ok(response);
    }

    /**
     * 获取连接状态
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> response = Map.of(
            "connected", connectionService.isConnected(),
            "connectionInfo", connectionService.getConnectionInfo()
        );
        
        return ResponseEntity.ok(response);
    }

    // ==================== 合约操作 ====================

    /**
     * 搜索合约
     */
    @PostMapping("/contracts/search")
    public CompletableFuture<ResponseEntity<Map<String, Object>>> searchContracts(
            @RequestParam String symbol,
            @RequestParam(defaultValue = "FUT") String secType,
            @RequestParam(defaultValue = "CME") String exchange,
            @RequestParam(defaultValue = "USD") String currency) {
        
        return contractService.searchContracts(symbol, secType, exchange, currency)
                .thenApply(result -> ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", result
                )))
                .exceptionally(throwable -> ResponseEntity.ok(Map.of(
                    "success", false,
                    "error", throwable.getMessage()
                )));
    }

    /**
     * 获取合约详情
     */
    @GetMapping("/contracts/{conId}")
    public CompletableFuture<ResponseEntity<Map<String, Object>>> getContractDetails(
            @PathVariable int conId) {
        
        return contractService.getContractDetails(conId)
                .thenApply(result -> ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", result
                )))
                .exceptionally(throwable -> ResponseEntity.ok(Map.of(
                    "success", false,
                    "error", throwable.getMessage()
                )));
    }

    /**
     * 配置合约
     */
    @PostMapping("/contracts/configure")
    public ResponseEntity<Map<String, Object>> configureContract(
            @RequestParam String symbol,
            @RequestParam int conId) {
        
        contractService.configureContract(symbol, conId);
        
        Map<String, Object> response = Map.of(
            "success", true,
            "message", "合约配置成功",
            "symbol", symbol,
            "conId", conId
        );
        
        return ResponseEntity.ok(response);
    }

    /**
     * 获取已配置的合约
     */
    @GetMapping("/contracts/configured")
    public ResponseEntity<Map<String, Object>> getConfiguredContracts() {
        Map<String, Object> contracts = contractService.getConfiguredContracts();
        
        Map<String, Object> response = Map.of(
            "success", true,
            "data", contracts
        );
        
        return ResponseEntity.ok(response);
    }

    // ==================== 市场数据 ====================

    /**
     * 请求市场数据
     */
    @PostMapping("/market-data/request")
    public CompletableFuture<ResponseEntity<Map<String, Object>>> requestMarketData(
            @RequestParam String symbol,
            @RequestParam(defaultValue = "FUT") String secType,
            @RequestParam(defaultValue = "CME") String exchange,
            @RequestParam(defaultValue = "USD") String currency) {
        
        // 使用新的订阅方法
        return marketDataService.subscribeFuturesMarketData("0", symbol, null, null)
                .thenApply(result -> ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", result
                )))
                .exceptionally(throwable -> ResponseEntity.ok(Map.of(
                    "success", false,
                    "error", throwable.getMessage()
                )));
    }

    /**
     * 订阅期货市场数据
     */
    @PostMapping("/market-data/subscribe-futures")
    public CompletableFuture<ResponseEntity<Map<String, Object>>> subscribeFuturesMarketData(
            @RequestParam String conId,
            @RequestParam String symbol,
            @RequestParam(required = false) String contractMonth,
            @RequestParam(required = false) String expiration) {
        
        return marketDataService.subscribeFuturesMarketData(conId, symbol, contractMonth, expiration)
                .thenApply(result -> ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", result
                )))
                .exceptionally(throwable -> ResponseEntity.ok(Map.of(
                    "success", false,
                    "error", throwable.getMessage()
                )));
    }

    /**
     * 获取活跃的市场数据订阅
     */
    @GetMapping("/market-data/subscriptions")
    public ResponseEntity<Map<String, Object>> getActiveSubscriptions() {
        Map<String, Object> subscriptions = marketDataService.getActiveSubscriptions();
        
        Map<String, Object> response = Map.of(
            "success", true,
            "data", subscriptions
        );
        
        return ResponseEntity.ok(response);
    }

    /**
     * 取消市场数据
     */
    @PostMapping("/market-data/cancel")
    public ResponseEntity<Map<String, Object>> cancelMarketData(
            @RequestParam int tickerId) {
        
        marketDataService.cancelMarketData(tickerId);
        
        Map<String, Object> response = Map.of(
            "success", true,
            "message", "市场数据请求已取消",
            "tickerId", tickerId
        );
        
        return ResponseEntity.ok(response);
    }

    // ==================== 账户信息 ====================

    /**
     * 获取账户摘要
     */
    @GetMapping("/account/summary")
    public CompletableFuture<ResponseEntity<Map<String, Object>>> getAccountSummary(
            @RequestParam(defaultValue = "All") String group,
            @RequestParam(defaultValue = "NetLiquidation,BuyingPower,TotalCashValue") String tags) {
        
        return contractService.getAccountSummary(group, tags)
                .thenApply(result -> ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", result
                )))
                .exceptionally(throwable -> ResponseEntity.ok(Map.of(
                    "success", false,
                    "error", throwable.getMessage()
                )));
    }

    /**
     * 获取持仓信息
     */
    @GetMapping("/account/positions")
    public CompletableFuture<ResponseEntity<Map<String, Object>>> getPositions() {
        return contractService.getPositions()
                .thenApply(result -> ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", result
                )))
                .exceptionally(throwable -> ResponseEntity.ok(Map.of(
                    "success", false,
                    "error", throwable.getMessage()
                )));
    }

    // ==================== 健康检查 ====================

    /**
     * 健康检查
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = Map.of(
            "status", "UP",
            "service", "TWS API",
            "connected", connectionService.isConnected(),
            "timestamp", System.currentTimeMillis()
        );
        
        return ResponseEntity.ok(response);
    }
} 