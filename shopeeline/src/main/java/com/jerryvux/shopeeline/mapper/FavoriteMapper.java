package com.jerryvux.shopeeline.mapper;

import com.jerryvux.shopeeline.dto.FavoriteDTO;
import com.jerryvux.shopeeline.model.Favorite;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FavoriteMapper {

    @Mapping(source = "id", target = "id")
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "createdAt", target = "createdAt")
    FavoriteDTO toDto(Favorite favorite);

    @Mapping(source = "id", target = "id")
    @Mapping(source = "userId", target = "user.id")
    @Mapping(source = "productId", target = "product.id")
    @Mapping(source = "createdAt", target = "createdAt")
    Favorite toEntity(FavoriteDTO favoriteDTO);
}
