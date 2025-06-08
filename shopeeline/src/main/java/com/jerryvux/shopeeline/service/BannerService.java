package com.jerryvux.shopeeline.service;

import com.jerryvux.shopeeline.dto.BannerDTO;
import com.jerryvux.shopeeline.model.Banner;

import java.util.List;

import java.util.List;
import java.util.Optional;

public interface BannerService {

    List<BannerDTO> getAll();

    Optional<BannerDTO> getById(Integer id);

    Banner create(Banner banner);

    Banner update(Integer id, Banner banner);

    void delete(Integer id);

    List<BannerDTO> uploadBatchBanners(List<BannerDTO> banners);
}
