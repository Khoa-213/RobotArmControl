package com.example.robotcontrolsystembackend.infrastructure.persistence.repository;

import com.example.robotcontrolsystembackend.domain.enumtype.HubStatus;
import com.example.robotcontrolsystembackend.domain.model.Hub;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HubRepository extends JpaRepository<Hub, Long> {
    List<Hub> findByAreaIdOrderByHubIdAsc(Long areaId);
    List<Hub> findByAreaIdAndHubStatusOrderByHubIdAsc(Long areaId, HubStatus hubStatus);
    boolean existsByAreaId(Long areaId);
}