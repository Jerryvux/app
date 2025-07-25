package com.jerryvux.shopeeline.repository;

import com.jerryvux.shopeeline.model.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SizeRepository extends JpaRepository<Size, Integer> {
}
