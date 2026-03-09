package com.example.robotcontrolsystembackend.presentation.controller.runtime;

import com.example.robotcontrolsystembackend.application.dto.request.runtime.StartSessionRequest;
import com.example.robotcontrolsystembackend.application.dto.response.runtime.SessionStatusResponse;
import com.example.robotcontrolsystembackend.application.service.runtime.ControlSessionService;
import com.example.robotcontrolsystembackend.common.response.ApiResponse;
import com.example.robotcontrolsystembackend.domain.enumtype.ControlMode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Control Session Controller
 * Manages robot control sessions with CAMERA or BUTTON mode
 * - GET operations: All authenticated users (ADMIN, OPERATOR, VIEWER)
 * - POST/PUT/DELETE operations: ADMIN and OPERATOR only
 */
@RestController
@RequestMapping("/api/control-sessions")
@RequiredArgsConstructor
@Tag(name = "Control Session", description = "APIs for managing robot control sessions")
public class ControlSessionController {

    private final ControlSessionService controlSessionService;

    @GetMapping
    @Operation(summary = "Get all sessions", description = "Retrieve all control sessions (All roles)")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'VIEWER')")
    public ResponseEntity<ApiResponse<String>> getAllSessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        // TODO: Implement with ControlSessionService
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("Sessions retrieved successfully")
                .data("List of sessions")
                .build());
    }

    @GetMapping("/{sessionId}")
    @Operation(summary = "Get session by ID", description = "Retrieve a specific control session (All roles)")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'VIEWER')")
    public ResponseEntity<ApiResponse<String>> getSessionById(@PathVariable Long sessionId) {
        // TODO: Implement with ControlSessionService
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("Session retrieved successfully")
                .data("Session " + sessionId)
                .build());
    }

    @GetMapping("/active")
    @Operation(summary = "Get active sessions", description = "Retrieve all active control sessions (All roles)")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'VIEWER')")
    public ResponseEntity<ApiResponse<String>> getActiveSessions() {
        // TODO: Implement with ControlSessionService
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("Active sessions retrieved successfully")
                .data("List of active sessions")
                .build());
    }

    @PostMapping
    @Operation(summary = "Create session", description = "Create a new control session (ADMIN, OPERATOR only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<ApiResponse<String>> createSession(@RequestBody Object request) {
        // TODO: Implement with ControlSessionService
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("Session created successfully")
                .data("New session")
                .build());
    }

    @PutMapping("/{sessionId}")
    @Operation(summary = "Update session", description = "Update a control session (ADMIN, OPERATOR only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<ApiResponse<String>> updateSession(
            @PathVariable Long sessionId,
            @RequestBody Object request) {
        // TODO: Implement with ControlSessionService
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("Session updated successfully")
                .data("Updated session " + sessionId)
                .build());
    }

    @PostMapping("/{sessionId}/end")
    @Operation(summary = "End session", description = "End a control session (ADMIN, OPERATOR only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<ApiResponse<String>> endSession(@PathVariable Long sessionId) {
        // TODO: Implement with ControlSessionService
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("Session ended successfully")
                .data("Ended session " + sessionId)
                .build());
    }

    @DeleteMapping("/{sessionId}")
    @Operation(summary = "Delete session", description = "Delete a control session (ADMIN only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSession(@PathVariable Long sessionId) {
        // TODO: Implement with ControlSessionService
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Session deleted successfully")
                .build());
    }

    // ==================== CONTROL SESSION (CAMERA / BUTTON) ====================

    @PostMapping("/start")
    @Operation(summary = "Start control session", 
               description = "Start a control session with CAMERA or BUTTON mode. " +
                           "CAMERA mode activates AI Camera for hand gesture control. " +
                           "BUTTON mode enables manual control via frontend buttons. " +
                           "(ADMIN, OPERATOR only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<ApiResponse<SessionStatusResponse>> startSession(
            @Valid @RequestBody StartSessionRequest request) {
        SessionStatusResponse response = controlSessionService.startSession(request);
        return ResponseEntity.ok(ApiResponse.<SessionStatusResponse>builder()
                .success(response.isSessionActive())
                .message(response.getMessage())
                .data(response)
                .build());
    }

    @PostMapping("/stop")
    @Operation(summary = "Stop control session", 
               description = "Stop the current control session (ADMIN, OPERATOR only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<ApiResponse<SessionStatusResponse>> stopSession() {
        SessionStatusResponse response = controlSessionService.stopSession();
        return ResponseEntity.ok(ApiResponse.<SessionStatusResponse>builder()
                .success(true)
                .message(response.getMessage())
                .data(response)
                .build());
    }

    @GetMapping("/status")
    @Operation(summary = "Get session status", 
               description = "Get current control session status including mode and camera state (All roles)")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'VIEWER')")
    public ResponseEntity<ApiResponse<SessionStatusResponse>> getSessionStatus() {
        SessionStatusResponse response = controlSessionService.getSessionStatus();
        return ResponseEntity.ok(ApiResponse.<SessionStatusResponse>builder()
                .success(true)
                .message(response.getMessage())
                .data(response)
                .build());
    }

    // ==================== BUTTON MODE CONTROL ====================

    @PostMapping("/button/angle")
    @Operation(summary = "Send single joint angle", 
               description = "Send angle command for a specific joint (BUTTON mode only). " +
                           "Joint index: 0-5, Angle: depends on joint limits. " +
                           "(ADMIN, OPERATOR only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<ApiResponse<Void>> sendAngle(
            @RequestParam int jointIndex,
            @RequestParam double angle) {
        
        if (controlSessionService.getCurrentControlMode() != ControlMode.BUTTON) {
            return ResponseEntity.badRequest().body(ApiResponse.<Void>builder()
                    .success(false)
                    .message("Not in BUTTON mode. Current mode: " + controlSessionService.getCurrentControlMode())
                    .build());
        }
        
        boolean success = controlSessionService.sendAngleCommand(jointIndex, angle);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(success)
                .message(success ? "Angle sent successfully" : "Failed to send angle")
                .build());
    }

    @PostMapping("/button/angles")
    @Operation(summary = "Send all joint angles", 
               description = "Send angles for all 6 joints at once (BUTTON mode only). " +
                           "Array must have exactly 6 values. " +
                           "(ADMIN, OPERATOR only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<ApiResponse<Void>> sendAllAngles(@RequestBody double[] angles) {
        
        if (controlSessionService.getCurrentControlMode() != ControlMode.BUTTON) {
            return ResponseEntity.badRequest().body(ApiResponse.<Void>builder()
                    .success(false)
                    .message("Not in BUTTON mode. Current mode: " + controlSessionService.getCurrentControlMode())
                    .build());
        }
        
        if (angles == null || angles.length != 6) {
            return ResponseEntity.badRequest().body(ApiResponse.<Void>builder()
                    .success(false)
                    .message("Angles array must have exactly 6 values")
                    .build());
        }
        
        boolean success = controlSessionService.sendAllAngles(angles);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(success)
                .message(success ? "Angles sent successfully" : "Failed to send angles")
                .build());
    }

    // ==================== LEGACY CAMERA CONTROL (for backward compatibility) ====================

    @PostMapping("/camera/start")
    @Operation(summary = "Start AI Camera (legacy)", 
               description = "Start AI Camera mode - equivalent to starting session with CAMERA mode (ADMIN, OPERATOR only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<ApiResponse<SessionStatusResponse>> startCamera() {
        StartSessionRequest request = StartSessionRequest.builder()
                .controlMode(ControlMode.CAMERA)
                .build();
        SessionStatusResponse response = controlSessionService.startSession(request);
        return ResponseEntity.ok(ApiResponse.<SessionStatusResponse>builder()
                .success(response.isSessionActive())
                .message(response.getMessage())
                .data(response)
                .build());
    }

    @PostMapping("/camera/stop")
    @Operation(summary = "Stop AI Camera (legacy)", 
               description = "Stop current session - equivalent to /stop (ADMIN, OPERATOR only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<ApiResponse<SessionStatusResponse>> stopCamera() {
        return stopSession();
    }

    @GetMapping("/camera/status")
    @Operation(summary = "Get Camera status (legacy)", 
               description = "Get session status - equivalent to /status (All roles)")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'VIEWER')")
    public ResponseEntity<ApiResponse<SessionStatusResponse>> getCameraStatus() {
        return getSessionStatus();
    }
}
