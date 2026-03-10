package com.example.robotcontrolsystembackend.config;

import com.datastax.oss.driver.api.core.CqlSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.cassandra.repository.config.EnableCassandraRepositories;

import java.net.URL;

@Configuration
@EnableCassandraRepositories(
    basePackages = "com.example.robotcontrolsystembackend.infrastructure.persistence.repository.cassandra"
)
public class CassandraConfig {

    @Value("${spring.cassandra.keyspace-name}")
    private String keyspaceName;

    @Value("${spring.cassandra.username}")
    private String username;

    @Value("${spring.cassandra.password}")
    private String password;

    @Value("${spring.cassandra.scb-filename}")
    private String scbFilename;

    @Bean
    public CqlSession cassandraSession() {
        URL scbUrl = getClass().getClassLoader().getResource(scbFilename);
        return CqlSession.builder()
                .withCloudSecureConnectBundle(scbUrl)
                .withAuthCredentials(username, password)
                .withKeyspace(keyspaceName)
                .build();
    }
}


