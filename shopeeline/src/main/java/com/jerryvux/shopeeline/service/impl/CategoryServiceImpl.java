package com.jerryvux.shopeeline.service.impl;

import com.jerryvux.shopeeline.dto.CategoryDTO;
import com.jerryvux.shopeeline.mapper.CategoryMapper;
import com.jerryvux.shopeeline.model.Category;
import com.jerryvux.shopeeline.repository.CategoryRepository;
import com.jerryvux.shopeeline.service.CategoryService;
import com.jerryvux.shopeeline.exception.BatchUploadException;

import jakarta.validation.Validator;
import java.util.ArrayList;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private Validator validator;

    @Override
    public List<CategoryDTO> getAll() {
        return categoryMapper.toDTOs(categoryRepository.findAll());
    }

    @Override
    public Optional<CategoryDTO> getById(Integer id) {
        return categoryRepository.findById(id).map(categoryMapper::toDTO);
    }

    @Override
    public Category create(Category category) {
        return categoryRepository.save(category);
    }

    @Override
    public Category update(Integer id, Category category) {
        return categoryRepository.findById(id).map(existing -> {
            existing.setName(category.getName());
            existing.setIcon(category.getIcon());
            return categoryRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Category not found"));
    }

    @Override
    public void delete(Integer id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Category not found");
        }
    }

    @Override
    public List<CategoryDTO> uploadBatchCategories(List<CategoryDTO> categories) {
        List<String> errorMessages = new ArrayList<>();
        List<Integer> failedRowIndices = new ArrayList<>();

        List<Category> validCategories = new ArrayList<>();
        for (int i = 0; i < categories.size(); i++) {
            CategoryDTO dto = categories.get(i);
            var violations = validator.validate(dto);

            if (!violations.isEmpty()) {
                String rowErrors = violations.stream()
                        .map(violation -> violation.getMessage())
                        .collect(Collectors.joining(", "));

                errorMessages.add("Dòng " + (i + 1) + ": " + rowErrors);
                failedRowIndices.add(i);
                continue;
            }

            Category category = new Category();
            category.setName(dto.getName());
            category.setIcon(dto.getIcon());
            validCategories.add(category);
        }

        if (!errorMessages.isEmpty()) {
            throw new BatchUploadException(
                    "Có lỗi trong quá trình upload",
                    errorMessages,
                    failedRowIndices
            );
        }

        List<Category> savedCategories = categoryRepository.saveAll(validCategories);
        return savedCategories.stream()
                .map(categoryMapper::toDTO)
                .collect(Collectors.toList());
    }
}
