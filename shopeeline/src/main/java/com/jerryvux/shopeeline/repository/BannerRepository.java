package com.jerryvux.shopeeline.repository;

import com.jerryvux.shopeeline.model.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Integer> {

}
