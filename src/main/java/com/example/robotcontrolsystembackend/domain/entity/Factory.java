package com.example.robotcontrolsystembackend.domain.entity;

import com.example.robotcontrolsystembackend.domain.enumtype.FactoryStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "factory")
@Getter @Setter
@NoArgsConstructor
public class Factory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "factory_id")
    private Long factoryId;

    @Column(name = "factory_name", nullable = false, length = 160)
    private String factoryName;

    @Column(name = "location", length = 255)
    private String location;

    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Enumerated(EnumType.STRING)
    @Column(name = "factory_status", columnDefinition = "factory_status_enum", nullable = false)
    private FactoryStatus factoryStatus;

    public Factory(String factoryName, String location) {
        this.factoryName = factoryName;
        this.location = location;
    }
}
