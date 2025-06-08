package com.jerryvux.shopeeline.service;

import com.jerryvux.shopeeline.model.Favorite;
import com.jerryvux.shopeeline.model.User;
import com.jerryvux.shopeeline.model.Product;
import com.jerryvux.shopeeline.repository.FavoriteRepository;
import com.jerryvux.shopeeline.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<Favorite> getFavoritesByUser(User user) {
        return favoriteRepository.findAll();
    }

    public Favorite addFavorite(User user, Integer productId) {
        Favorite favorite = new Favorite();
        favorite.setUser(user);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        favorite.setProduct(product);
        return favoriteRepository.save(favorite);
    }

    public void removeFavorite(User user, Integer product) {
        favoriteRepository.deleteById(product);
    }
}
