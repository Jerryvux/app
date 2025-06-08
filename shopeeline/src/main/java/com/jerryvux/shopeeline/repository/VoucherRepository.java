package com.jerryvux.shopeeline.repository;

import com.jerryvux.shopeeline.model.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Integer> {
    List<Voucher> findByStartDateLessThanEqualAndEndDateGreaterThanEqual(LocalDateTime now, LocalDateTime now2);
}