package com.jerryvux.shopeeline.repository;

import com.jerryvux.shopeeline.model.Policy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, Integer> {

    List<Policy> findByTypeAndIsActiveTrue(String type);

    List<Policy> findByIsActiveTrue();
}
