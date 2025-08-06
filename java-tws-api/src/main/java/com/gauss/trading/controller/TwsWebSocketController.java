package com.gauss.trading.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gauss.trading.service.TwsMarketDataService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * WebSocket控制器
 * 用于实时推送市场数据到前端
 */
@Component
public class TwsWebSocketController extends TextWebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(TwsWebSocketController.class);
    
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // 移除对TwsMarketDataService的直接依赖，避免循环依赖

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String sessionId = session.getId();
        sessions.put(sessionId, session);
        logger.info("WebSocket连接已建立: {}", sessionId);
        
        // 发送连接确认消息
        Map<String, Object> welcomeMessage = Map.of(
            "type", "connection",
            "status", "connected",
            "sessionId", sessionId,
            "message", "WebSocket连接已建立"
        );
        
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(welcomeMessage)));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String sessionId = session.getId();
        sessions.remove(sessionId);
        logger.info("WebSocket连接已关闭: {} - {}", sessionId, status);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String sessionId = session.getId();
        String payload = message.getPayload();
        
        logger.debug("收到WebSocket消息: {} - {}", sessionId, payload);
        
        try {
            // 解析消息
            Map<String, Object> request = objectMapper.readValue(payload, Map.class);
            String type = (String) request.get("type");
            
            switch (type) {
                case "subscribe":
                    handleSubscribe(session, request);
                    break;
                case "unsubscribe":
                    handleUnsubscribe(session, request);
                    break;
                case "ping":
                    handlePing(session);
                    break;
                default:
                    logger.warn("未知的消息类型: {}", type);
            }
        } catch (Exception e) {
            logger.error("处理WebSocket消息失败: {}", e.getMessage());
            
            // 发送错误响应
            Map<String, Object> errorResponse = Map.of(
                "type", "error",
                "message", "消息处理失败: " + e.getMessage()
            );
            
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(errorResponse)));
        }
    }

    private void handleSubscribe(WebSocketSession session, Map<String, Object> request) throws IOException {
        String symbol = (String) request.get("symbol");
        String sessionId = session.getId();
        
        logger.info("订阅市场数据: {} - {}", sessionId, symbol);
        
        // 发送订阅确认
        Map<String, Object> response = Map.of(
            "type", "subscription",
            "status", "subscribed",
            "symbol", symbol,
            "message", "已订阅 " + symbol + " 的市场数据"
        );
        
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
    }

    private void handleUnsubscribe(WebSocketSession session, Map<String, Object> request) throws IOException {
        String symbol = (String) request.get("symbol");
        String sessionId = session.getId();
        
        logger.info("取消订阅市场数据: {} - {}", sessionId, symbol);
        
        // 发送取消订阅确认
        Map<String, Object> response = Map.of(
            "type", "subscription",
            "status", "unsubscribed",
            "symbol", symbol,
            "message", "已取消订阅 " + symbol + " 的市场数据"
        );
        
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
    }

    private void handlePing(WebSocketSession session) throws IOException {
        Map<String, Object> response = Map.of(
            "type", "pong",
            "timestamp", System.currentTimeMillis()
        );
        
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
    }

    /**
     * 广播市场数据到所有连接的客户端
     */
    public void broadcastMarketData(String symbol, Map<String, Object> marketData) {
        if (sessions.isEmpty()) {
            return;
        }
        
        try {
            Map<String, Object> message = Map.of(
                "type", "marketData",
                "symbol", symbol,
                "data", marketData,
                "timestamp", System.currentTimeMillis()
            );
            
            String messageJson = objectMapper.writeValueAsString(message);
            TextMessage textMessage = new TextMessage(messageJson);
            
            // 广播到所有会话
            sessions.values().forEach(session -> {
                try {
                    if (session.isOpen()) {
                        session.sendMessage(textMessage);
                    }
                } catch (IOException e) {
                    logger.error("发送WebSocket消息失败: {}", e.getMessage());
                }
            });
            
            logger.debug("广播市场数据: {} - {}", symbol, marketData);
        } catch (Exception e) {
            logger.error("广播市场数据失败: {}", e.getMessage());
        }
    }

    /**
     * 获取当前连接的会话数量
     */
    public int getActiveSessionCount() {
        return sessions.size();
    }

    /**
     * 获取所有活跃会话
     */
    public Map<String, WebSocketSession> getActiveSessions() {
        return new ConcurrentHashMap<>(sessions);
    }
} 