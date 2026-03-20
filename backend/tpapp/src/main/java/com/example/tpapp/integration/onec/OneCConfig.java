package com.example.tpapp.integration.onec;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(OneCProperties.class)
public class OneCConfig {

    @Bean
    public RestClient oneCRestClient(OneCProperties properties) {
        return RestClient.builder()
                .baseUrl(properties.getBaseUrl())
                .defaultHeader(
                        HttpHeaders.AUTHORIZATION,
                        basicAuth(properties.getUsername(), properties.getPassword())
                )
                .build();
    }

    private String basicAuth(String username, String password) {
        String pair = username + ":" + password;
        String encoded = java.util.Base64.getEncoder().encodeToString(pair.getBytes());
        return "Basic " + encoded;
    }
}