package com.jerryvux.shopeeline.repository;

import com.jerryvux.shopeeline.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    List<Product> findByCategoryId(Integer categoryId);

    List<Product> findByUserId(Integer userId);

    @EntityGraph(attributePaths = "user")
    List<Product> findAll();
}
