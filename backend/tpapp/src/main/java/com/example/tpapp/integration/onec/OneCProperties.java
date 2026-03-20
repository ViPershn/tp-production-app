package com.example.tpapp.integration.onec;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "onec")
public class OneCProperties {

    private String baseUrl;
    private String username;
    private String password;
    private String searchEndpoint;
    private String detailsEndpoint;
    private String operationsEndpoint;

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getSearchEndpoint() {
        return searchEndpoint;
    }

    public void setSearchEndpoint(String searchEndpoint) {
        this.searchEndpoint = searchEndpoint;
    }

    public String getDetailsEndpoint() {
        return detailsEndpoint;
    }

    public void setDetailsEndpoint(String detailsEndpoint) {
        this.detailsEndpoint = detailsEndpoint;
    }

    public String getOperationsEndpoint() {
        return operationsEndpoint;
    }

    public void setOperationsEndpoint(String operationsEndpoint) {
        this.operationsEndpoint = operationsEndpoint;
    }
}