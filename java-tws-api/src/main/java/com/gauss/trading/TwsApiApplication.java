package com.gauss.trading;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.beans.factory.annotation.Autowired;
import com.gauss.trading.service.TwsConnectionService;
import com.gauss.trading.service.TwsMarketDataService;
import org.springframework.context.event.EventListener;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * TWS API Spring Boot 应用程序
 * 
 * 基于IBJts TWS API的Spring MVC实现
 * 提供RESTful API接口用于连接Interactive Brokers TWS Gateway
 */
@SpringBootApplication
public class TwsApiApplication {

    private static final Logger logger = LoggerFactory.getLogger(TwsApiApplication.class);

    @Autowired
    private TwsConnectionService connectionService;
    
    @Autowired
    private TwsMarketDataService marketDataService;

    public static void main(String[] args) {
        System.out.println("🚀 启动TWS API Spring Boot应用程序...");
        SpringApplication.run(TwsApiApplication.class, args);
        System.out.println("✅ TWS API应用程序启动成功!");
        System.out.println("📡 API地址: http://localhost:8080");
        System.out.println("📊 健康检查: http://localhost:8080/actuator/health");
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        logger.info("🚀 启动TWS API Spring Boot应用程序...");
        
        // 设置市场数据服务
        connectionService.setMarketDataService(marketDataService);
        
        logger.info("✅ TWS API应用程序启动成功!");
        logger.info("📡 API地址: http://localhost:8080");
        logger.info("📊 健康检查: http://localhost:8080/actuator/health");
    }

    /**
     * 配置CORS跨域支持
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(false)
                        .maxAge(3600);
            }
        };
    }
} 