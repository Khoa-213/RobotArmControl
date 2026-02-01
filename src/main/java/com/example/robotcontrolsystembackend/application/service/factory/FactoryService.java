package com.example.robotcontrolsystembackend.application.service.factory;

import com.example.robotcontrolsystembackend.application.dto.request.factory.CreateFactoryRequest;
import com.example.robotcontrolsystembackend.application.dto.response.factory.FactoryResponse;

import java.util.List;
public interface FactoryService {
    FactoryResponse createFactory(CreateFactoryRequest request);
    List<FactoryResponse> searchByName(String name);
}


