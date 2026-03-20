package com.example.tpapp.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ProductDetailsDto(
        Long id,
        String oneCId,
        String code,
        String name,
        String status,
        String departmentName,
        String groupName,
        BigDecimal outputQuantity,
        String productDescription,
        String sourceType,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime lastSyncAt,
        List<OperationDto> operations
) {
}