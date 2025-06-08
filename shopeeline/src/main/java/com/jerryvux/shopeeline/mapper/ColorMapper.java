package com.jerryvux.shopeeline.mapper;

import com.jerryvux.shopeeline.dto.ColorDTO;
import com.jerryvux.shopeeline.model.Color;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ColorMapper {

    @Mapping(source = "id", target = "id")
    @Mapping(source = "name", target = "name")
    ColorDTO toDto(Color color);

    @Mapping(source = "id", target = "id")
    @Mapping(source = "name", target = "name")
    Color toEntity(ColorDTO colorDTO);
}
