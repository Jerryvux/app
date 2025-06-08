package com.jerryvux.shopeeline.service;

import com.jerryvux.shopeeline.model.Size;
import com.jerryvux.shopeeline.repository.SizeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SizeService {

    @Autowired
    private SizeRepository sizeRepository;

    public List<Size> getAllSizes() {
        return sizeRepository.findAll();
    }

    public Size getSizeById(Integer id) {
        return sizeRepository.findById(id).orElse(null);
    }
}
