package com.jerryvux.shopeeline.controller;

import com.jerryvux.shopeeline.dto.CategoryDTO;
import com.jerryvux.shopeeline.model.Category;
import com.jerryvux.shopeeline.exception.BatchUploadException;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import com.jerryvux.shopeeline.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public List<CategoryDTO> getAll() {
        return categoryService.getAll();
    }

    @GetMapping("/{id}")
    public CategoryDTO getById(@PathVariable Integer id) {
        return categoryService.getById(id).orElseThrow(() -> new RuntimeException("Category not found"));
    }

    @PostMapping
    public Category create(@RequestBody Category category) {
        return categoryService.create(category);
    }

    @PutMapping("/{id}")
    public Category update(@PathVariable Integer id, @RequestBody Category category) {
        return categoryService.update(id, category);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        categoryService.delete(id);
    }

    @PostMapping("/upload-batch")
    public Map<String, Object> uploadBatchCategories(
            @Valid @RequestBody List<CategoryDTO> categories
    ) {
        try {
            List<CategoryDTO> uploadedCategories = categoryService.uploadBatchCategories(categories);
            return Map.of(
                    "categories", uploadedCategories,
                    "totalUploaded", uploadedCategories.size()
            );
        } catch (BatchUploadException e) {
            return Map.of(
                    "message", e.getMessage(),
                    "errorMessages", e.getErrorMessages(),
                    "failedRowIndices", e.getFailedRowIndices()
            );
        }
    }
}
