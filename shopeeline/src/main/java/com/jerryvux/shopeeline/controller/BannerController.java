package com.jerryvux.shopeeline.controller;

import com.jerryvux.shopeeline.dto.BannerDTO;
import com.jerryvux.shopeeline.model.Banner;
import com.jerryvux.shopeeline.exception.BatchUploadException;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import com.jerryvux.shopeeline.service.BannerService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/banners")
@CrossOrigin
public class BannerController {

    @Autowired
    private BannerService bannerService;

    @GetMapping
    public List<BannerDTO> getAll() {
        return bannerService.getAll();
    }

    @GetMapping("/{id}")
    public BannerDTO getById(@PathVariable Integer id) {
        return bannerService.getById(id).orElseThrow(() -> new RuntimeException("Banner not found"));
    }

    @PostMapping
    public Banner create(@RequestBody Banner banner) {
        return bannerService.create(banner);
    }

    @PutMapping("/{id}")
    public Banner update(@PathVariable Integer id, @RequestBody Banner banner) {
        return bannerService.update(id, banner);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        bannerService.delete(id);
    }

    @PostMapping("/upload-batch")
    public Map<String, Object> uploadBatchBanners(
            @Valid @RequestBody List<BannerDTO> banners
    ) {
        try {
            List<BannerDTO> uploadedBanners = bannerService.uploadBatchBanners(banners);
            return Map.of(
                    "banners", uploadedBanners,
                    "totalUploaded", uploadedBanners.size()
            );
        } catch (BatchUploadException e) {
            return Map.of(
                    "message", e.getMessage(),
                    "errorMessages", e.getErrorMessages(),
                    "failedRowIndices", e.getFailedRowIndices()
            );
        }

    }

}
