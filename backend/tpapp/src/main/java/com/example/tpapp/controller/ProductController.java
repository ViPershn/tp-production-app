package com.example.tpapp.controller;

import com.example.tpapp.dto.ProductDetailsDto;
import com.example.tpapp.dto.ProductListItemDto;
import com.example.tpapp.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public List<ProductListItemDto> getProducts(
            @RequestParam(required = false) String search
    ) {
        return productService.getProducts(search);
    }

    @GetMapping("/{id}")
    public ProductDetailsDto getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }
}