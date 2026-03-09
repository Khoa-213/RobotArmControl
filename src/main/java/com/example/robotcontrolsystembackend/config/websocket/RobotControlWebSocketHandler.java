package com.example.robotcontrolsystembackend.config.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Component
public class RobotControlWebSocketHandler extends TextWebSocketHandler {

    private static final CopyOnWriteArrayList<WebSocketSession> sessions = new CopyOnWriteArrayList<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
        log.info("Client connected: {} | Total: {}", session.getId(), sessions.size());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        log.debug("Received: {}", payload);

        // Broadcast to all clients (Unity, Frontend, etc.)
        for (WebSocketSession s : sessions) {
            if (s.isOpen()) {
                s.sendMessage(message);
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
        log.info("Client disconnected: {} | Remaining: {}", session.getId(), sessions.size());
    }

    /**
     * Broadcast a message to all connected clients
     * Used by ControlSessionService to send camera control commands
     */
    public void broadcastMessage(String message) {
        TextMessage textMessage = new TextMessage(message);
        for (WebSocketSession s : sessions) {
            if (s.isOpen()) {
                try {
                    s.sendMessage(textMessage);
                } catch (IOException e) {
                    log.error("Failed to send message to session {}: {}", s.getId(), e.getMessage());
                }
            }
        }
        log.info("Broadcast message to {} clients: {}", sessions.size(), message);
    }

    /**
     * Get the number of connected clients
     */
    public int getConnectedClientsCount() {
        return sessions.size();
    }
}