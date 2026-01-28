package com.example.robotcontrolsystembackend.presentation.controller.factory;

import com.example.robotcontrolsystembackend.domain.model.Factory;
import com.example.robotcontrolsystembackend.repository.FactoryRepository;
import org.springframework.web.bind.annotation.* ;

import java.util.List;

@RestController
@RequestMapping("/api/factories")
public class FactoryController {

    private final FactoryRepository factoryRepository;//

    public FactoryController(FactoryRepository factoryRepository) {
        this.factoryRepository = factoryRepository;
    }

    @GetMapping
    public List<Factory> getAll() {
        return factoryRepository.findAll();
    }

    @PostMapping
    public Factory create(@RequestBody Factory factory) {
        // factoryId sẽ auto-generate
        return factoryRepository.save(factory);
    }
}
