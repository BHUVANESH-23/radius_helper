package com.example.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")  // allow all API paths
                        .allowedOrigins("http://localhost:5173")  // allow your frontend
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")  // allow these HTTP methods
                        .allowedHeaders("*");  // allow all headers
            }
        };
    }
}
