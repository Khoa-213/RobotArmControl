package com.example.robotcontrolsystembackend.application.dto.response.runtime;

import com.example.robotcontrolsystembackend.domain.enumtype.ControlMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for control session status
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionStatusResponse {
    
    /**
     * Whether a session is currently active
     */
    private boolean sessionActive;
    
    /**
     * Current control mode (null if no active session)
     */
    private ControlMode controlMode;
    
    /**
     * Number of connected WebSocket clients
     */
    private int connectedClients;
    
    /**
     * Whether AI Camera is currently active
     */
    private boolean cameraActive;
    
    /**
     * Session message/description
     */
    private String message;
}
