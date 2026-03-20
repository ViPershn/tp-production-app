package com.example.tpapp.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductListItemDto(
        Long id,
        String code,
        String name,
        String status,
        String departmentName,
        BigDecimal outputQuantity,
        LocalDateTime lastSyncAt
) {
}