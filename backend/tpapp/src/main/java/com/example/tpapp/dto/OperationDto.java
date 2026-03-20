package com.example.tpapp.dto;

import java.math.BigDecimal;

public record OperationDto(
        Long id,
        Integer operationOrder,
        Integer operationNumber,
        String name,
        String workCenter,
        String setupVariant,
        BigDecimal pieceTimeMinutes,
        BigDecimal pressureValue,
        String pressureUnit,
        BigDecimal temperatureValue,
        String temperatureUnit,
        String operationDescription,
        Boolean isManualEdited
) {
}