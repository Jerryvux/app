package com.jerryvux.shopeeline.service.impl;

import com.jerryvux.shopeeline.dto.ProductResponseDTO;
import com.jerryvux.shopeeline.dto.ProductDTO;
import com.jerryvux.shopeeline.mapper.ProductMapper;
import com.jerryvux.shopeeline.model.Product;
import com.jerryvux.shopeeline.repository.ProductRepository;

import com.jerryvux.shopeeline.service.ProductService;
import com.jerryvux.shopeeline.exception.BatchUploadException;

import java.util.ArrayList;
import java.util.stream.Collectors;

import com.jerryvux.shopeeline.repository.CategoryRepository;

import java.time.LocalDateTime;

import jakarta.validation.Validator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private Validator validator;

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public List<ProductResponseDTO> getAll() {
        return productMapper.toDTOs(productRepository.findAll());
    }

    @Override
    public Optional<ProductResponseDTO> getById(Integer id) {
        return productRepository.findById(id).map(productMapper::toDTO);
    }

    @Override
    public Product create(Product product) {
        return productRepository.save(product);
    }

    @Override
    public Product update(Integer id, Product updated) {
        return productRepository.findById(id).map(existing -> {
            existing.setName(updated.getName());
            existing.setPrice(updated.getPrice());
            existing.setOriginalPrice(updated.getOriginalPrice());
            existing.setDiscount(updated.getDiscount());
            existing.setDescription(updated.getDescription());
            existing.setImage(updated.getImage());
            existing.setRating(updated.getRating());
            existing.setSold(updated.getSold());
            existing.setCategory(updated.getCategory());
            existing.setUser(updated.getUser());
            existing.setCreatedAt(updated.getCreatedAt());
            existing.setUpdatedAt(updated.getUpdatedAt());
            existing.setDeletedAt(updated.getDeletedAt());
            return productRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Product not found"));
    }

    @Override
    public List<ProductResponseDTO> uploadBatchProducts(List<ProductDTO> products) {
        List<String> errorMessages = new ArrayList<>();
        List<Integer> failedRowIndices = new ArrayList<>();

        List<Product> validProducts = new ArrayList<>();
        for (int i = 0; i < products.size(); i++) {
            ProductDTO dto = products.get(i);
            var violations = validator.validate(dto);

            if (!violations.isEmpty()) {
                String rowErrors = violations.stream()
                        .map(violation -> violation.getMessage())
                        .collect(Collectors.joining(", "));

                errorMessages.add("Dòng " + (i + 1) + ": " + rowErrors);
                failedRowIndices.add(i);
                continue;
            }

            Product product = new Product();
            product.setName(dto.getName());
            product.setPrice(dto.getPrice().intValue());
            product.setDescription(dto.getDescription());
            product.setCategory(categoryRepository.findByName(dto.getCategory()));
            product.setCreatedAt(LocalDateTime.now());
            validProducts.add(product);
        }

        if (!errorMessages.isEmpty()) {
            throw new BatchUploadException(
                    "Có lỗi trong quá trình upload",
                    errorMessages,
                    failedRowIndices
            );
        }

        List<Product> savedProducts = productRepository.saveAll(validProducts);
        return savedProducts.stream()
                .map(productMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Integer id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found");
        }
        productRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Integer id) {
        return productRepository.existsById(id);
    }
}
