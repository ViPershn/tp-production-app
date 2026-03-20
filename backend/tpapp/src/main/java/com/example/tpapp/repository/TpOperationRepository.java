package com.example.tpapp.repository;

import com.example.tpapp.entity.TpOperation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TpOperationRepository extends JpaRepository<TpOperation, Long> {

    List<TpOperation> findByProductIdOrderByOperationOrderAscOperationNumberAscIdAsc(Long productId);
}