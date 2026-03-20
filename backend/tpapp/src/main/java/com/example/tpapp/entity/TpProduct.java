package com.example.tpapp.entity;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "tp_products")
public class TpProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "one_c_id", length = 100, unique = true)
    private String oneCId;

    @Column(name = "code", length = 100)
    private String code;

    @Column(name = "name", nullable = false, length = 500)
    private String name;

    @Column(name = "status", length = 100)
    private String status;

    @Column(name = "department_name", length = 255)
    private String departmentName;

    @Column(name = "group_name", length = 255)
    private String groupName;

    @Column(name = "output_quantity", precision = 18, scale = 3)
    private BigDecimal outputQuantity;

    @Column(name = "product_description")
    private String productDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 20)
    private SourceType sourceType = SourceType.ONE_C;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_json", columnDefinition = "jsonb")
    private JsonNode rawJson;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "last_sync_at")
    private LocalDateTime lastSyncAt;

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    @OrderBy("operationOrder ASC")
    private List<TpOperation> operations = new ArrayList<>();

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.sourceType == null) {
            this.sourceType = SourceType.ONE_C;
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}