package com.jerryvux.shopeeline.service;

import com.jerryvux.shopeeline.dto.CategoryDTO;
import com.jerryvux.shopeeline.model.Category;

import java.util.List;

import java.util.List;
import java.util.Optional;

public interface CategoryService {

    List<CategoryDTO> getAll();

    Optional<CategoryDTO> getById(Integer id);

    Category create(Category category);

    Category update(Integer id, Category category);

    void delete(Integer id);

    List<CategoryDTO> uploadBatchCategories(List<CategoryDTO> categories);
}
