package com.jerryvux.shopeeline.service;

import com.jerryvux.shopeeline.dto.ProductResponseDTO;
import com.jerryvux.shopeeline.dto.ProductDTO;
import com.jerryvux.shopeeline.model.Product;

import java.util.List;
import java.util.Optional;

public interface ProductService {

    List<ProductResponseDTO> getAll();

    Optional<ProductResponseDTO> getById(Integer id);

    Product create(Product product);

    Product update(Integer id, Product product);

    void delete(Integer id);

    boolean existsById(Integer id);

    List<ProductResponseDTO> uploadBatchProducts(List<ProductDTO> products);
}
