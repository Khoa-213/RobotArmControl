package com.example.robotcontrolsystembackend.infrastructure.serviceimpl.runtime;

import com.example.robotcontrolsystembackend.application.dto.request.runtime.StartSessionRequest;
import com.example.robotcontrolsystembackend.application.dto.response.runtime.SessionStatusResponse;
import com.example.robotcontrolsystembackend.application.service.runtime.ControlSessionService;
import com.example.robotcontrolsystembackend.config.websocket.RobotControlWebSocketHandler;
import com.example.robotcontrolsystembackend.domain.enumtype.ControlMode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ControlSessionServiceImpl implements ControlSessionService {
    
    private final RobotControlWebSocketHandler webSocketHandler;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // Track session state
    private volatile boolean sessionActive = false;
    private volatile ControlMode currentControlMode = null;
    private volatile boolean cameraActive = false;
    
    @Override
    public SessionStatusResponse startSession(StartSessionRequest request) {
        try {
            ControlMode mode = request.getControlMode();
            
            // If session already active with different mode, stop it first
            if (sessionActive && currentControlMode != mode) {
                stopSession();
            }
            
            sessionActive = true;
            currentControlMode = mode;
            
            String message;
            
            if (mode == ControlMode.CAMERA) {
                // Start AI Camera mode - broadcast START command
                String wsMessage = "{\"type\":\"camera_control\",\"command\":\"START\"}";
                webSocketHandler.broadcastMessage(wsMessage);
                cameraActive = true;
                message = "Session started with CAMERA mode - AI Camera activated";
                log.info("Control session started - CAMERA mode, START_CAMERA command sent");
            } else {
                // BUTTON mode - no camera activation
                cameraActive = false;
                message = "Session started with BUTTON mode - Manual control enabled";
                log.info("Control session started - BUTTON mode");
            }
            
            return SessionStatusResponse.builder()
                    .sessionActive(true)
                    .controlMode(mode)
                    .connectedClients(webSocketHandler.getConnectedClientsCount())
                    .cameraActive(cameraActive)
                    .message(message)
                    .build();
                    
        } catch (Exception e) {
            log.error("Failed to start control session: {}", e.getMessage());
            return SessionStatusResponse.builder()
                    .sessionActive(false)
                    .controlMode(null)
                    .connectedClients(webSocketHandler.getConnectedClientsCount())
                    .cameraActive(false)
                    .message("Failed to start session: " + e.getMessage())
                    .build();
        }
    }
    
    @Override
    public SessionStatusResponse stopSession() {
        try {
            // Stop camera if it was active
            if (cameraActive) {
                String wsMessage = "{\"type\":\"camera_control\",\"command\":\"STOP\"}";
                webSocketHandler.broadcastMessage(wsMessage);
                log.info("STOP_CAMERA command sent");
            }
            
            sessionActive = false;
            cameraActive = false;
            ControlMode previousMode = currentControlMode;
            currentControlMode = null;
            
            log.info("Control session stopped (was {} mode)", previousMode);
            
            return SessionStatusResponse.builder()
                    .sessionActive(false)
                    .controlMode(null)
                    .connectedClients(webSocketHandler.getConnectedClientsCount())
                    .cameraActive(false)
                    .message("Session stopped successfully")
                    .build();
                    
        } catch (Exception e) {
            log.error("Failed to stop control session: {}", e.getMessage());
            return SessionStatusResponse.builder()
                    .sessionActive(sessionActive)
                    .controlMode(currentControlMode)
                    .connectedClients(webSocketHandler.getConnectedClientsCount())
                    .cameraActive(cameraActive)
                    .message("Failed to stop session: " + e.getMessage())
                    .build();
        }
    }
    
    @Override
    public SessionStatusResponse getSessionStatus() {
        return SessionStatusResponse.builder()
                .sessionActive(sessionActive)
                .controlMode(currentControlMode)
                .connectedClients(webSocketHandler.getConnectedClientsCount())
                .cameraActive(cameraActive)
                .message(sessionActive ? 
                        "Session active with " + currentControlMode + " mode" : 
                        "No active session")
                .build();
    }
    
    @Override
    public boolean isSessionActive() {
        return sessionActive;
    }
    
    @Override
    public ControlMode getCurrentControlMode() {
        return currentControlMode;
    }
    
    @Override
    public int getConnectedClientsCount() {
        return webSocketHandler.getConnectedClientsCount();
    }
    
    @Override
    public boolean sendAngleCommand(int jointIndex, double angle) {
        if (!sessionActive || currentControlMode != ControlMode.BUTTON) {
            log.warn("Cannot send angle command - session not active or not in BUTTON mode");
            return false;
        }
        
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("type", "button_angle");
            payload.put("jointIndex", jointIndex);
            payload.put("angle", angle);
            
            String message = objectMapper.writeValueAsString(payload);
            webSocketHandler.broadcastMessage(message);
            log.debug("Sent angle command: joint={}, angle={}", jointIndex, angle);
            return true;
        } catch (Exception e) {
            log.error("Failed to send angle command: {}", e.getMessage());
            return false;
        }
    }
    
    @Override
    public boolean sendAllAngles(double[] angles) {
        if (!sessionActive || currentControlMode != ControlMode.BUTTON) {
            log.warn("Cannot send angles - session not active or not in BUTTON mode");
            return false;
        }
        
        if (angles == null || angles.length != 6) {
            log.warn("Invalid angles array - must have exactly 6 values");
            return false;
        }
        
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("type", "button_angles");
            payload.put("angles", Arrays.stream(angles).boxed().toArray());
            
            String message = objectMapper.writeValueAsString(payload);
            webSocketHandler.broadcastMessage(message);
            log.debug("Sent all angles: {}", Arrays.toString(angles));
            return true;
        } catch (Exception e) {
            log.error("Failed to send angles: {}", e.getMessage());
            return false;
        }
    }
}
