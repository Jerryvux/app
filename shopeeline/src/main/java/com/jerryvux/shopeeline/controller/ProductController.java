package com.jerryvux.shopeeline.controller;

import com.jerryvux.shopeeline.dto.ColorDTO;
import com.jerryvux.shopeeline.dto.SizeDTO;
import com.jerryvux.shopeeline.dto.ProductResponseDTO;
import com.jerryvux.shopeeline.exception.NotFoundException;
import com.jerryvux.shopeeline.mapper.ColorMapper;
import com.jerryvux.shopeeline.mapper.SizeMapper;
import com.jerryvux.shopeeline.model.Product;
import com.jerryvux.shopeeline.dto.ProductDTO;
import com.jerryvux.shopeeline.model.ProductColor;
import com.jerryvux.shopeeline.model.ProductSize;
import com.jerryvux.shopeeline.repository.ProductColorRepository;
import com.jerryvux.shopeeline.repository.ProductSizeRepository;
import com.jerryvux.shopeeline.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.jerryvux.shopeeline.exception.BatchUploadException;
import java.util.Map;
import java.util.HashMap;
import jakarta.validation.Valid;
import java.util.stream.Collectors;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@CrossOrigin
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductColorRepository productColorRepository;

    @Autowired
    private ProductSizeRepository productSizeRepository;

    @Autowired
    private ColorMapper colorMapper;

    @Autowired
    private SizeMapper sizeMapper;

    @GetMapping
    public List<ProductResponseDTO> getAll() {
        return productService.getAll();
    }

    @GetMapping("/{id}/colors")
    public ResponseEntity<List<String>> getProductColors(@PathVariable Integer id) {
        if (!productService.existsById(id)) {
            throw new NotFoundException("Product not found with ID: " + id);
        }

        List<ProductColor> productColors = productColorRepository.findAll().stream()
                .filter(pc -> pc.getProduct().getId().equals(id))
                .collect(Collectors.toList());

        if (productColors.isEmpty()) {
            throw new NotFoundException("No colors found for product ID: " + id);
        }

        List<String> colors = productColors.stream()
                .map(pc -> colorMapper.toDto(pc.getColor()).getName())
                .collect(Collectors.toList());

        return new ResponseEntity<>(colors, HttpStatus.OK);
    }

    @GetMapping("/{id}/sizes")
    public ResponseEntity<List<String>> getProductSizes(@PathVariable Integer id) {
        if (!productService.existsById(id)) {
            throw new NotFoundException("Product not found with ID: " + id);
        }

        List<ProductSize> productSizes = productSizeRepository.findAll().stream()
                .filter(ps -> ps.getProduct().getId().equals(id))
                .collect(Collectors.toList());

        if (productSizes.isEmpty()) {
            throw new NotFoundException("No sizes found for product ID: " + id);
        }

        List<String> sizes = productSizes.stream()
                .map(ps -> sizeMapper.toDto(ps.getSize()).getName())
                .collect(Collectors.toList());

        return new ResponseEntity<>(sizes, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ProductResponseDTO getById(@PathVariable Integer id) {
        return productService.getById(id).orElseThrow(() -> new RuntimeException("Product not found"));
    }

    @PostMapping
    public Product create(@RequestBody Product product) {
        return productService.create(product);
    }

    @PostMapping("/upload-batch")
    public ResponseEntity<?> uploadProductBatch(
            @Valid @RequestBody List<ProductDTO> products
    ) {
        try {
            List<ProductResponseDTO> uploadedProducts = productService.uploadBatchProducts(products);
            return ResponseEntity.ok(Map.of(
                    "products", uploadedProducts,
                    "totalUploaded", uploadedProducts.size()
            ));
        } catch (BatchUploadException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", e.getMessage(),
                    "errorMessages", e.getErrorMessages(),
                    "failedRowIndices", e.getFailedRowIndices()
            ));
        }
    }

    @PutMapping("/{id}")
    public Product update(@PathVariable Integer id, @RequestBody Product product) {
        return productService.update(id, product);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        productService.delete(id);
    }
}
