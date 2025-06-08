package com.jerryvux.shopeeline.service.impl;

import com.jerryvux.shopeeline.dto.BannerDTO;
import com.jerryvux.shopeeline.mapper.BannerMapper;
import com.jerryvux.shopeeline.model.Banner;
import com.jerryvux.shopeeline.repository.BannerRepository;
import com.jerryvux.shopeeline.repository.ProductRepository;
import com.jerryvux.shopeeline.service.BannerService;
import com.jerryvux.shopeeline.exception.NotFoundException;
import com.jerryvux.shopeeline.exception.BatchUploadException;

import jakarta.validation.Validator;
import java.util.ArrayList;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Service
public class BannerServiceImpl implements BannerService {

    @Autowired
    private BannerRepository bannerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private BannerMapper bannerMapper;

    @Autowired
    private Validator validator;

    @Override
    @Transactional(readOnly = true)
    public List<BannerDTO> getAll() {
        try {
            List<Banner> banners = bannerRepository.findAll();
            System.out.println("📦 Banners size: " + banners.size());
            return bannerMapper.toDTOs(banners);
        } catch (Exception e) {
            System.err.println("Error fetching banners: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch banners: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<BannerDTO> getById(Integer id) {
        try {
            return bannerRepository.findById(id).map(bannerMapper::toDTO);
        } catch (Exception e) {
            System.err.println("Error fetching banner by id: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch banner: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public List<BannerDTO> uploadBatchBanners(List<BannerDTO> banners) {
        List<String> errorMessages = new ArrayList<>();
        List<Integer> failedRowIndices = new ArrayList<>();

        List<Banner> validBanners = new ArrayList<>();
        for (int i = 0; i < banners.size(); i++) {
            BannerDTO dto = banners.get(i);
            var violations = validator.validate(dto);

            if (!violations.isEmpty()) {
                String rowErrors = violations.stream()
                    .map(violation -> violation.getMessage())
                    .collect(Collectors.joining(", "));
                
                errorMessages.add("Dòng " + (i + 1) + ": " + rowErrors);
                failedRowIndices.add(i);
                continue;
            }

            Banner banner = new Banner();
            banner.setTitle(dto.getTitle());
            banner.setDescription(dto.getDescription());
            banner.setImage(dto.getImage());
            banner.setCreatedAt(LocalDateTime.now());
            validBanners.add(banner);
        }

        if (!errorMessages.isEmpty()) {
            throw new BatchUploadException(
                "Có lỗi trong quá trình upload", 
                errorMessages, 
                failedRowIndices
            );
        }

        List<Banner> savedBanners = bannerRepository.saveAll(validBanners);
        return savedBanners.stream()
            .map(bannerMapper::toDTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Banner create(Banner banner) {
        try {
            if (banner.getProduct() != null && banner.getProduct().getId() != null) {
                productRepository.findById(banner.getProduct().getId())
                        .ifPresentOrElse(
                                banner::setProduct,
                                () -> {
                                    throw new NotFoundException("Product not found with id: " + banner.getProduct().getId());
                                }
                        );
            }
            return bannerRepository.save(banner);
        } catch (Exception e) {
            System.err.println("Error creating banner: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create banner: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public Banner update(Integer id, Banner banner) {
        try {
            return bannerRepository.findById(id)
                    .map(existing -> {
                        existing.setTitle(banner.getTitle());
                        existing.setDescription(banner.getDescription());
                        existing.setImage(banner.getImage());
                        if (banner.getProduct() != null && banner.getProduct().getId() != null) {
                            productRepository.findById(banner.getProduct().getId())
                                    .ifPresentOrElse(
                                            existing::setProduct,
                                            () -> {
                                                throw new NotFoundException("Product not found with id: " + banner.getProduct().getId());
                                            }
                                    );
                        }
                        return bannerRepository.save(existing);
                    })
                    .orElseThrow(() -> new NotFoundException("Banner not found with id: " + id));
        } catch (Exception e) {
            System.err.println("Error updating banner: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update banner: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void delete(Integer id) {
        try {
            if (!bannerRepository.existsById(id)) {
                throw new NotFoundException("Banner not found with id: " + id);
            }
            bannerRepository.deleteById(id);
        } catch (Exception e) {
            System.err.println("Error deleting banner: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to delete banner: " + e.getMessage());
        }
    }
}
