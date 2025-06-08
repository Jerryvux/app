package com.jerryvux.shopeeline.mapper;

import com.jerryvux.shopeeline.dto.ProductResponseDTO;
import com.jerryvux.shopeeline.model.Product;
import org.mapstruct.*;
import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "categoryName", expression = "java(product.getCategory() != null ? product.getCategory().getName() : null)")
    @Mapping(target = "userName", expression = "java(product.getUser() != null ? product.getUser().getName() : null)")
    ProductResponseDTO toDTO(Product product);

    List<ProductResponseDTO> toDTOs(List<Product> products);
}
