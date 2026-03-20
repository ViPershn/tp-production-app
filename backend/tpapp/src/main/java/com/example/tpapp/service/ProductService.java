package com.example.tpapp.service;

import com.example.tpapp.dto.OperationDto;
import com.example.tpapp.dto.ProductDetailsDto;
import com.example.tpapp.dto.ProductListItemDto;
import com.example.tpapp.dto.UpdateOperationRequest;
import com.example.tpapp.entity.TpOperation;
import com.example.tpapp.entity.TpOperationChange;
import com.example.tpapp.entity.TpProduct;
import com.example.tpapp.exception.NotFoundException;
import com.example.tpapp.repository.TpOperationChangeRepository;
import com.example.tpapp.repository.TpOperationRepository;
import com.example.tpapp.repository.TpProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final TpProductRepository productRepository;
    private final TpOperationRepository operationRepository;
    private final TpOperationChangeRepository operationChangeRepository;

    @Transactional(readOnly = true)
    public List<ProductListItemDto> getProducts(String search) {
        List<TpProduct> products = (search == null || search.isBlank())
                ? productRepository.findAllOrdered()
                : productRepository.findByNameContainingIgnoreCaseOrderByNameAsc(search.trim());

        return products.stream()
                .map(this::toListItemDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductDetailsDto getProductById(Long id) {
        TpProduct product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Продукт не найден: id=" + id));

        List<OperationDto> operations = operationRepository.findByProductIdOrderByOperationOrderAsc(id)
                .stream()
                .map(this::toOperationDto)
                .toList();

        return new ProductDetailsDto(
                product.getId(),
                product.getOneCId(),
                product.getCode(),
                product.getName(),
                product.getStatus(),
                product.getDepartmentName(),
                product.getGroupName(),
                product.getOutputQuantity(),
                product.getProductDescription(),
                product.getSourceType() != null ? product.getSourceType().name() : null,
                product.getCreatedAt(),
                product.getUpdatedAt(),
                product.getLastSyncAt(),
                operations
        );
    }

    @Transactional
    public OperationDto updateOperation(Long operationId, UpdateOperationRequest request) {
        TpOperation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new NotFoundException("Операция не найдена: id=" + operationId));

        trackChange(operationId, "pressure_value", operation.getPressureValue(), request.pressureValue(), request);
        trackChange(operationId, "pressure_unit", operation.getPressureUnit(), request.pressureUnit(), request);
        trackChange(operationId, "temperature_value", operation.getTemperatureValue(), request.temperatureValue(), request);
        trackChange(operationId, "temperature_unit", operation.getTemperatureUnit(), request.temperatureUnit(), request);
        trackChange(operationId, "operation_description", operation.getOperationDescription(), request.operationDescription(), request);

        operation.setPressureValue(request.pressureValue());
        operation.setPressureUnit(request.pressureUnit());
        operation.setTemperatureValue(request.temperatureValue());
        operation.setTemperatureUnit(request.temperatureUnit());
        operation.setOperationDescription(request.operationDescription());
        operation.setIsManualEdited(true);

        TpOperation saved = operationRepository.save(operation);
        return toOperationDto(saved);
    }

    private void trackChange(Long operationId, String fieldName, Object oldValue, Object newValue, UpdateOperationRequest request) {
        if (Objects.equals(normalize(oldValue), normalize(newValue))) {
            return;
        }

        TpOperationChange change = new TpOperationChange();
        change.setOperationId(operationId);
        change.setFieldName(fieldName);
        change.setOldValue(stringValue(oldValue));
        change.setNewValue(stringValue(newValue));
        change.setChangedBy(request.changedBy());
        change.setChangeReason(request.changeReason());
        change.setCreatedAt(LocalDateTime.now());

        operationChangeRepository.save(change);
    }

    private Object normalize(Object value) {
        if (value instanceof String s) {
            return s == null ? null : s.trim();
        }
        return value;
    }

    private String stringValue(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof BigDecimal bd) {
            return bd.toPlainString();
        }
        return String.valueOf(value);
    }

    private ProductListItemDto toListItemDto(TpProduct product) {
        return new ProductListItemDto(
                product.getId(),
                product.getCode(),
                product.getName(),
                product.getStatus(),
                product.getDepartmentName(),
                product.getOutputQuantity(),
                product.getLastSyncAt()
        );
    }

    private OperationDto toOperationDto(TpOperation operation) {
        return new OperationDto(
                operation.getId(),
                operation.getOperationOrder(),
                operation.getOperationNumber(),
                operation.getName(),
                operation.getWorkCenter(),
                operation.getSetupVariant(),
                operation.getPieceTimeMinutes(),
                operation.getPressureValue(),
                operation.getPressureUnit(),
                operation.getTemperatureValue(),
                operation.getTemperatureUnit(),
                operation.getOperationDescription(),
                operation.getIsManualEdited()
        );
    }
}