package com.jerryvux.shopeeline.service;

import com.jerryvux.shopeeline.model.Video;
import com.jerryvux.shopeeline.repository.VideoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class VideoService {

    @Autowired
    private VideoRepository videoRepository;

    public List<Video> getAllVideos() {
        return videoRepository.findAll();
    }

    public Video getVideoByIdDirect(Integer id) {
        return videoRepository.findById(id).orElse(null);
    }

}
