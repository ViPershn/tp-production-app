package com.example.tpapp.controller;

import com.example.tpapp.dto.OperationDto;
import com.example.tpapp.dto.UpdateOperationRequest;
import com.example.tpapp.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/operations")
public class OperationController {

    private final ProductService productService;

    @PutMapping("/{id}")
    public OperationDto updateOperation(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOperationRequest request
    ) {
        return productService.updateOperation(id, request);
    }
}