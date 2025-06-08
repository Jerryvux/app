package com.jerryvux.shopeeline.mapper;

import com.jerryvux.shopeeline.dto.BannerDTO;
import com.jerryvux.shopeeline.model.Banner;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface BannerMapper {

    @Mapping(target = "productName", expression = "java(banner.getProduct() != null ? banner.getProduct().getName() : null)")
    BannerDTO toDTO(Banner banner);

    List<BannerDTO> toDTOs(List<Banner> banners);
}
