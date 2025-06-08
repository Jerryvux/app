package com.jerryvux.shopeeline.controller;

import com.jerryvux.shopeeline.dto.FavoriteDTO;
import com.jerryvux.shopeeline.mapper.FavoriteMapper;
import com.jerryvux.shopeeline.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users/favorites")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;
    @Autowired
    private FavoriteMapper favoriteMapper;

    @GetMapping
    public List<FavoriteDTO> getFavorites() {
        return favoriteService.getFavoritesByUser(null).stream()
                .map(favoriteMapper::toDto)
                .collect(Collectors.toList());
    }

    @PostMapping
    public FavoriteDTO addFavorite(@RequestBody FavoriteDTO favoriteDTO) {
        return favoriteMapper.toDto(favoriteService.addFavorite(null, favoriteDTO.getProductId()));
    }

    @DeleteMapping("/{productId}")
    public void removeFavorite(@PathVariable Integer productId) {
        favoriteService.removeFavorite(null, productId);
    }
}
