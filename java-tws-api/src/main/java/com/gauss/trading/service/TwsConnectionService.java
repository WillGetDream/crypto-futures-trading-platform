package com.gauss.trading.service;

import com.ib.client.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * TWS连接服务
 * 
 * 管理TWS Gateway连接和基础通信
 */
@Service
public class TwsConnectionService {

    private static final Logger logger = LoggerFactory.getLogger(TwsConnectionService.class);

    private EClientSocket client;
    private EReader reader;
    private EReaderSignal signal;
    private TwsWrapper wrapper;

    private final AtomicInteger nextRequestId = new AtomicInteger(1);
    private final ConcurrentHashMap<Integer, CompletableFuture<Object>> pendingRequests = new ConcurrentHashMap<>();

    private String host = "localhost";
    private int port = 4002;
    private int clientId = 0;
    private boolean isConnected = false;
    
    // 添加市场数据服务引用
    private TwsMarketDataService marketDataService;

    /**
     * 连接到TWS Gateway
     */
    public CompletableFuture<Boolean> connect(String host, int port, int clientId) {
        this.host = host;
        this.port = port;
        this.clientId = clientId;

        return CompletableFuture.supplyAsync(() -> {
            try {
                logger.info("正在连接到TWS: {}:{} (客户端ID: {})", host, port, clientId);

                // 创建TWS组件
                signal = new EJavaSignal();
                wrapper = new TwsWrapper(this);
                client = new EClientSocket(wrapper, signal);

                // 连接到TWS
                client.eConnect(host, port, clientId);

                if (client.isConnected()) {
                    // 启动消息读取器
                    reader = new EReader(client, signal);
                    reader.start();

                    // 启动消息处理线程
                    startMessageProcessing();

                    isConnected = true;
                    logger.info("✅ TWS连接成功!");
                    return true;
                } else {
                    logger.error("❌ TWS连接失败");
                    return false;
                }

            } catch (Exception e) {
                logger.error("❌ TWS连接异常: {}", e.getMessage(), e);
                return false;
            }
        });
    }

    /**
     * 断开TWS连接
     */
    public void disconnect() {
        if (isConnected && client != null) {
            logger.info("正在断开TWS连接...");
            
            isConnected = false;
            
            // 停止消息处理
            stopMessageProcessing();
            
            // 断开连接
            client.eDisconnect();
            
            logger.info("✅ TWS连接已断开");
        }
    }

    /**
     * 检查连接状态
     */
    public boolean isConnected() {
        return isConnected && client != null && client.isConnected();
    }

    /**
     * 获取下一个请求ID
     */
    public int getNextRequestId() {
        return nextRequestId.getAndIncrement();
    }

    /**
     * 注册待处理的请求
     */
    public void registerPendingRequest(int requestId, CompletableFuture<Object> future) {
        pendingRequests.put(requestId, future);
    }

    /**
     * 完成待处理的请求
     */
    public void completePendingRequest(int requestId, Object result) {
        CompletableFuture<Object> future = pendingRequests.remove(requestId);
        if (future != null) {
            future.complete(result);
        }
    }

    /**
     * 完成待处理的请求（异常）
     */
    public void completePendingRequestWithError(int requestId, Throwable error) {
        CompletableFuture<Object> future = pendingRequests.remove(requestId);
        if (future != null) {
            future.completeExceptionally(error);
        }
    }

    /**
     * 获取客户端实例
     */
    public EClientSocket getClient() {
        return client;
    }

    /**
     * 获取包装器实例
     */
    public TwsWrapper getWrapper() {
        return wrapper;
    }
    
    public void setMarketDataService(TwsMarketDataService marketDataService) {
        this.marketDataService = marketDataService;
    }
    
    public TwsMarketDataService getMarketDataService() {
        return marketDataService;
    }

    /**
     * 启动消息处理
     */
    private void startMessageProcessing() {
        Thread messageThread = new Thread(() -> {
            while (isConnected) {
                try {
                    if (reader != null) {
                        reader.processMsgs();
                    }
                    Thread.sleep(10); // 10ms延迟
                } catch (Exception e) {
                    logger.error("消息处理异常: {}", e.getMessage(), e);
                    break;
                }
            }
        });
        messageThread.setName("TWS-Message-Processor");
        messageThread.setDaemon(true);
        messageThread.start();
    }

    /**
     * 停止消息处理
     */
    private void stopMessageProcessing() {
        // 消息处理线程会在isConnected为false时自动停止
    }

    /**
     * 获取连接信息
     */
    public String getConnectionInfo() {
        return String.format("TWS连接: %s:%d (客户端ID: %d, 状态: %s)", 
                           host, port, clientId, isConnected() ? "已连接" : "未连接");
    }
} 