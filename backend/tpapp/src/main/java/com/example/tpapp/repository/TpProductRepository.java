package com.example.tpapp.repository;

import com.example.tpapp.entity.TpProduct;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TpProductRepository extends JpaRepository<TpProduct, Long> {

    default List<TpProduct> findAllOrdered() {
        return findAll(Sort.by(Sort.Direction.ASC, "name"));
    }

    List<TpProduct> findByNameContainingIgnoreCaseOrderByNameAsc(String name);
}