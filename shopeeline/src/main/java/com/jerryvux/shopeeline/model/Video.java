package com.jerryvux.shopeeline.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "videos")
@Data
public class Video {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String title;

    @Column(name = "video_url")
    private String videoUrl;

    private String thumbnail;

    @Column(name = "user_id")
    private Integer userId;

    private String music;

    private String description;

    private Integer likes;

    private Integer comments;

    private Integer shares;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
