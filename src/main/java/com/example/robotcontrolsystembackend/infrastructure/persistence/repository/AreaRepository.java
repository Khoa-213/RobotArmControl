package com.example.robotcontrolsystembackend.infrastructure.persistence.repository;

import com.example.robotcontrolsystembackend.domain.enumtype.AreaStatus;
import com.example.robotcontrolsystembackend.domain.model.Area;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AreaRepository extends JpaRepository<Area, Long> {
    List<Area> findByFactoryIdOrderByAreaIdAsc(Long factoryId);
    List<Area> findByFactoryIdAndAreaStatusOrderByAreaIdAsc(Long factoryId, AreaStatus areaStatus);

}
