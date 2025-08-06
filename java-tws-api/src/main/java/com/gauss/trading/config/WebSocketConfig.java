package com.gauss.trading.config;

import com.gauss.trading.controller.TwsWebSocketController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * WebSocket配置类
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Autowired
    private TwsWebSocketController webSocketController;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(webSocketController, "/ws/market-data")
                .setAllowedOrigins("*") // 允许所有来源，生产环境应该限制
                .withSockJS(); // 启用SockJS支持，提供降级方案
    }
} 