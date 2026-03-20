package com.example.tpapp.integration.onec;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/integration/1c")
public class OneCIntegrationController {

    private final OneCClient oneCClient;

    @GetMapping("/search")
    public JsonNode search(@RequestParam String name) {
        return oneCClient.searchByName(name);
    }

    @GetMapping("/process/{id}")
    public JsonNode getProcess(@PathVariable String id) {
        return oneCClient.getProcessById(id);
    }

    @GetMapping("/process/{id}/operations")
    public JsonNode getOperations(@PathVariable String id) {
        return oneCClient.getOperationsByProcessId(id);
    }
}