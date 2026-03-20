package com.example.tpapp.dto;

import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateOperationRequest(
        BigDecimal pressureValue,

        @Size(max = 20)
        String pressureUnit,

        BigDecimal temperatureValue,

        @Size(max = 20)
        String temperatureUnit,

        String operationDescription,

        @Size(max = 255)
        String changedBy,

        String changeReason
) {
}