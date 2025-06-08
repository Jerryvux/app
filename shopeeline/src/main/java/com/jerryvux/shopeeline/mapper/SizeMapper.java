package com.jerryvux.shopeeline.mapper;

import com.jerryvux.shopeeline.dto.SizeDTO;
import com.jerryvux.shopeeline.model.Size;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SizeMapper {

    @Mapping(source = "id", target = "id")
    @Mapping(source = "name", target = "name")
    SizeDTO toDto(Size size);

    @Mapping(source = "id", target = "id")
    @Mapping(source = "name", target = "name")
    Size toEntity(SizeDTO sizeDTO);
}
