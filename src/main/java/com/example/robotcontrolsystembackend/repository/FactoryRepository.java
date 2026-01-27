package com.example.robotcontrolsystembackend.repository;

import com.example.robotcontrolsystembackend.domain.entity.Factory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FactoryRepository extends JpaRepository<Factory, Long> {

    
}
