package com.jerryvux.shopeeline.repository;

import com.jerryvux.shopeeline.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {

    List<Message> findByIsRead(Boolean isRead);

    List<Message> findByUserIdOrderByCreatedAtDesc(Integer userId);
}
