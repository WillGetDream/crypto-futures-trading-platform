package com.gauss.trading;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * TWS API Spring Boot 应用程序
 * 
 * 基于IBJts TWS API的Spring MVC实现
 * 提供RESTful API接口用于连接Interactive Brokers TWS Gateway
 */
@SpringBootApplication
public class TwsApiApplication {

    public static void main(String[] args) {
        System.out.println("🚀 启动TWS API Spring Boot应用程序...");
        SpringApplication.run(TwsApiApplication.class, args);
        System.out.println("✅ TWS API应用程序启动成功!");
        System.out.println("📡 API地址: http://localhost:8080");
        System.out.println("📊 健康检查: http://localhost:8080/actuator/health");
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