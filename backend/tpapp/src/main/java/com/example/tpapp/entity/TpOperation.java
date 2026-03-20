package com.example.tpapp.entity;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "tp_operations")
public class TpOperation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private TpProduct product;

    @Column(name = "one_c_operation_id", length = 100, unique = true)
    private String oneCOperationId;

    @Column(name = "operation_order", nullable = false)
    private Integer operationOrder;

    @Column(name = "operation_number")
    private Integer operationNumber;

    @Column(name = "name", nullable = false, length = 500)
    private String name;

    @Column(name = "work_center", length = 255)
    private String workCenter;

    @Column(name = "setup_variant", length = 255)
    private String setupVariant;

    @Column(name = "piece_time_minutes", precision = 12, scale = 2)
    private BigDecimal pieceTimeMinutes;

    @Column(name = "pressure_value", precision = 12, scale = 3)
    private BigDecimal pressureValue;

    @Column(name = "pressure_unit", length = 20)
    private String pressureUnit = "bar";

    @Column(name = "temperature_value", precision = 12, scale = 3)
    private BigDecimal temperatureValue;

    @Column(name = "temperature_unit", length = 20)
    private String temperatureUnit = "C";

    @Column(name = "operation_description")
    private String operationDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 20)
    private SourceType sourceType = SourceType.ONE_C;

    @Column(name = "is_manual_edited", nullable = false)
    private Boolean isManualEdited = false;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_json", columnDefinition = "jsonb")
    private JsonNode rawJson;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;

        if (this.sourceType == null) {
            this.sourceType = SourceType.ONE_C;
        }
        if (this.isManualEdited == null) {
            this.isManualEdited = false;
        }
        if (this.pressureUnit == null || this.pressureUnit.isBlank()) {
            this.pressureUnit = "bar";
        }
        if (this.temperatureUnit == null || this.temperatureUnit.isBlank()) {
            this.temperatureUnit = "C";
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}