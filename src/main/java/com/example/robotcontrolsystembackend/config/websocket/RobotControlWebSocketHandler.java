package com.example.robotcontrolsystembackend.config.websocket;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class RobotControlWebSocketHandler extends TextWebSocketHandler implements RobotSessionSender {

    private final ObjectMapper objectMapper;

    // all sessions (for legacy broadcast)
    private final ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    // deviceId -> session
    private final ConcurrentHashMap<String, WebSocketSession> deviceSessions = new ConcurrentHashMap<>();
    // sessionId -> deviceId
    private final ConcurrentHashMap<String, String> sessionToDevice = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.put(session.getId(), session);
        log.info("Client connected: {} | Total: {}", session.getId(), sessions.size());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        log.debug("Received from {}: {}", session.getId(), payload);

        try {
            JsonNode root = objectMapper.readTree(payload);
            String type = root.path("type").asText("");

            if ("register".equals(type)) {
                String deviceId = root.path("deviceId").asText("");
                if (!deviceId.isEmpty()) {
                    deviceSessions.put(deviceId, session);
                    sessionToDevice.put(session.getId(), deviceId);
                    log.info("Registered deviceId={} for session={}", deviceId, session.getId());
                    // optional: send ack
                    session.sendMessage(new TextMessage("{\"type\":\"register_ack\",\"deviceId\":\"" + deviceId + "\"}"));
                }
                return;
            }

            // If message includes target deviceId -> route to that device only
            String targetDevice = root.path("deviceId").asText("");
            if (!targetDevice.isEmpty()) {
                WebSocketSession targetSession = deviceSessions.get(targetDevice);
                if (targetSession != null && targetSession.isOpen()) {
                    targetSession.sendMessage(new TextMessage(payload));
                    log.debug("Routed message to device {} (session {})", targetDevice, targetSession.getId());
                    return;
                } else {
                    log.warn("Target device {} not connected; ignoring message", targetDevice);
                    return;
                }
            }

            // Fallback: broadcast to all (legacy behaviour)
            broadcastMessage(payload);
        } catch (IOException e) {
            log.error("Failed parse/route WS message: {}", e.getMessage());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session.getId());
        String device = sessionToDevice.remove(session.getId());
        if (device != null) {
            deviceSessions.remove(device);
            log.info("Device {} disconnected (session {})", device, session.getId());
        }
        log.info("Client disconnected: {} | Remaining: {}", session.getId(), sessions.size());
    }

    public void broadcastMessage(String message) {
        TextMessage textMessage = new TextMessage(message);
        sessions.values().forEach(s -> {
            if (s != null && s.isOpen()) {
                try {
                    s.sendMessage(textMessage);
                } catch (IOException e) {
                    log.error("Failed to send message to session {}: {}", s.getId(), e.getMessage());
                }
            }
        });
        log.info("Broadcast message to {} clients: {}", sessions.size(), message);
    }

    public boolean sendToDevice(String deviceId, String message) {
        WebSocketSession s = deviceSessions.get(deviceId);
        if (s != null && s.isOpen()) {
            try {
                s.sendMessage(new TextMessage(message));
                return true;
            } catch (IOException e) {
                log.error("Failed to send to device {}: {}", deviceId, e.getMessage());
            }
        }
        return false;
    }

    public int getConnectedClientsCount() {
        return sessions.size();
    }
}