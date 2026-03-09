package com.example.robotcontrolsystembackend.config.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final RobotControlWebSocketHandler robotControlHandler;

    public WebSocketConfig(RobotControlWebSocketHandler robotControlHandler) {
        this.robotControlHandler = robotControlHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(robotControlHandler, "/ws/robot-control")
                .setAllowedOrigins("*");
    }
}