package com.example.robotcontrolsystembackend.presentation.controller.runtime;

import com.example.robotcontrolsystembackend.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Control Session Controller for AI Camera
 * Manages robot control sessions
 * - GET operations: All authenticated users (ADMIN, OPERATOR, VIEWER)
 * - POST/PUT/DELETE operations: ADMIN and OPERATOR only
 */
@RestController
@RequestMapping("/api/control-sessions")
@RequiredArgsConstructor
@Tag(name = "Control Session", description = "APIs for managing control sessions")
public class ControlSessionController {

    // TODO: Inject ControlSessionService when implemented

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
}
