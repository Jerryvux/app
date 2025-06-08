package com.jerryvux.shopeeline.mapper;

import com.jerryvux.shopeeline.dto.CategoryDTO;
import com.jerryvux.shopeeline.model.Category;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    CategoryDTO toDTO(Category category);

    List<CategoryDTO> toDTOs(List<Category> categories);
}
