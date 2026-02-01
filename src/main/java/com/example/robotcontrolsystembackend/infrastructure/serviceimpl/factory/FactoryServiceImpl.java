package com.example.robotcontrolsystembackend.infrastructure.serviceimpl.factory;

import com.example.robotcontrolsystembackend.application.dto.request.factory.CreateFactoryRequest;
import com.example.robotcontrolsystembackend.application.dto.response.factory.FactoryResponse;
import com.example.robotcontrolsystembackend.application.service.factory.FactoryService;
import com.example.robotcontrolsystembackend.common.exception.AppException;
import com.example.robotcontrolsystembackend.common.exception.ErrorCode;
import com.example.robotcontrolsystembackend.domain.enumtype.FactoryStatus;
import com.example.robotcontrolsystembackend.domain.model.Factory;
import com.example.robotcontrolsystembackend.infrastructure.persistence.repository.FactoryRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FactoryServiceImpl implements FactoryService {

    private final FactoryRepository factoryRepository;

    @Override
    @Transactional
    public FactoryResponse createFactory(CreateFactoryRequest request) {
        // 1) Validate
        if (request == null || request.getFactoryName() == null || request.getFactoryName().trim().isEmpty()) {
            throw new AppException(ErrorCode.FACTORY_NAME_REQUIRED, "factory_name không được rỗng");
        }

        String name = request.getFactoryName().trim();

        // 2) Business rule (optional): không cho trùng tên
        if (factoryRepository.existsByFactoryNameIgnoreCase(name)) {
            throw new AppException(ErrorCode.FACTORY_NAME_ALREADY_EXISTS, "Factory name đã tồn tại");
        }

        // 3) Build entity
        Factory factory = Factory.builder()
                .factoryName(name)
                .location(request.getLocation() == null ? null : request.getLocation().trim())
                .factoryStatus(FactoryStatus.Active) // default theo DB
                .build();

        // 4) Save
        Factory saved = factoryRepository.save(factory);

        // 5) Map response
        return FactoryResponse.builder()
                .factoryId(saved.getFactoryId())
                .factoryName(saved.getFactoryName())
                .location(saved.getLocation())
                .factoryStatus(saved.getFactoryStatus())
                .build();
    }
    @Override
    @Transactional(readOnly = true)
    public List<FactoryResponse> searchByName(String name) {
        String keyword = (name == null) ? "" : name.trim();
        List<Factory> factories = factoryRepository.findByFactoryNameContainingIgnoreCase(keyword);
        
        return factories.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private FactoryResponse mapToResponse(Factory factory) {
        return FactoryResponse.builder()
                .factoryId(factory.getFactoryId())
                .factoryName(factory.getFactoryName())
                .location(factory.getLocation())
                .factoryStatus(factory.getFactoryStatus())
                .build();
    }
}
