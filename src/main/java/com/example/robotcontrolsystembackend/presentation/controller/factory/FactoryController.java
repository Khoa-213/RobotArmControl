package com.example.robotcontrolsystembackend.presentation.controller.factory;

import com.example.robotcontrolsystembackend.application.dto.request.factory.CreateFactoryRequest;
import com.example.robotcontrolsystembackend.application.dto.response.factory.FactoryResponse;
import com.example.robotcontrolsystembackend.application.service.factory.FactoryService;
import com.example.robotcontrolsystembackend.common.response.ApiResponse;
import org.springframework.web.bind.annotation.* ;



@RestController
@RequestMapping("/api/factories")
public class FactoryController {
    private final FactoryService factoryService;

    public FactoryController(FactoryService factoryService) {
        this.factoryService = factoryService;
    }

    @PostMapping
    public ApiResponse<FactoryResponse> create(@RequestBody CreateFactoryRequest request) {
        FactoryResponse res = factoryService.createFactory(request);
        return ApiResponse.ok("Tạo factory thành công", res);
    }

}
