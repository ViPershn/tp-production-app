package com.example.tpapp.integration.onec;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
public class OneCClient {

    private final RestClient oneCRestClient;
    private final OneCProperties properties;

    public JsonNode searchByName(String name) {
        String uri = UriComponentsBuilder
                .fromPath(properties.getSearchEndpoint())
                .queryParam("name", name)
                .toUriString();

        return oneCRestClient.get()
                .uri(uri)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode getProcessById(String id) {
        String uri = properties.getDetailsEndpoint().replace("{id}", id);

        return oneCRestClient.get()
                .uri(uri)
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode getOperationsByProcessId(String id) {
        String uri = properties.getOperationsEndpoint().replace("{id}", id);

        return oneCRestClient.get()
                .uri(uri)
                .retrieve()
                .body(JsonNode.class);
    }
}