package com.example.robotcontrolsystembackend.presentation.controller.factory;

import com.example.robotcontrolsystembackend.application.dto.request.factory.CreateDeviceRequest;
import com.example.robotcontrolsystembackend.application.dto.request.factory.UpdateDeviceRequest;
import com.example.robotcontrolsystembackend.application.dto.response.factory.DeviceResponse;
import com.example.robotcontrolsystembackend.application.service.factory.DeviceService;
import com.example.robotcontrolsystembackend.common.response.ApiResponse;
import com.example.robotcontrolsystembackend.domain.enumtype.StatusFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;

    @PostMapping("/hubs/{hubId}/devices")
    public ApiResponse<DeviceResponse> createDevice(@PathVariable Long hubId,
                                                    @RequestBody CreateDeviceRequest request) {
        return ApiResponse.ok("Tạo Device thành công", deviceService.createDevice(hubId, request));
    }

    @GetMapping("/hubs/{hubId}/devices")
    public ApiResponse<List<DeviceResponse>> getDevicesByHub(@PathVariable Long hubId) {
        return ApiResponse.ok("Lấy danh sách Device thành công", deviceService.getDevicesByHub(hubId));
    }

    @PutMapping("/devices/{deviceId}")
    public ApiResponse<DeviceResponse> updateDevice(@PathVariable Long deviceId,
                                                    @RequestBody UpdateDeviceRequest request) {
        return ApiResponse.ok("Cập nhật Device thành công", deviceService.updateDevice(deviceId, request));
    }

    @DeleteMapping("/devices/{deviceId}")
    public ApiResponse<Void> deleteDevice(@PathVariable Long deviceId) {
        deviceService.deleteDevice(deviceId);
        return ApiResponse.ok("Xoá Device thành công", null);
    }

    // LIST ACTIVE
    @GetMapping("/hubs/{hubId}/devices/active")
    public ApiResponse<List<DeviceResponse>> getDevicesActive(@PathVariable Long hubId) {
        return ApiResponse.ok("Lấy danh sách Device Active", deviceService.getDevicesByHubActive(hubId));
    }

    // LIST NOT ACTIVE
    @GetMapping("/hubs/{hubId}/devices/not-active")
    public ApiResponse<List<DeviceResponse>> getDevicesNotActive(@PathVariable Long hubId) {
        return ApiResponse.ok("Lấy danh sách Device NotActive", deviceService.getDevicesByHubNotActive(hubId));
    }

    // RESTORE
    @PatchMapping("/devices/{deviceId}/activate")
    public ApiResponse<DeviceResponse> activateDevice(@PathVariable Long deviceId) {
        return ApiResponse.ok("Kích hoạt lại Device thành công", deviceService.activateDevice(deviceId));
    }

    @GetMapping("/hubs/{hubId}/devices/search")
    public ApiResponse<List<DeviceResponse>> searchDevices(
            @PathVariable Long hubId,
            @RequestParam String keyword,
            @RequestParam(required = false) StatusFilter status
    ) {
        return ApiResponse.ok("Search Device", deviceService.searchDevices(hubId, keyword, status));
    }
}
