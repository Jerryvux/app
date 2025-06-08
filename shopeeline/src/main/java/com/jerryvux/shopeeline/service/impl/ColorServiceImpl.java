package com.jerryvux.shopeeline.service.impl;

import com.jerryvux.shopeeline.model.Color;
import com.jerryvux.shopeeline.repository.ColorRepository;
import com.jerryvux.shopeeline.service.ColorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ColorServiceImpl implements ColorService {

    @Autowired
    private ColorRepository colorRepository;

    @Override
    public List<Color> getAllColors() {
        return colorRepository.findAll();
    }

    @Override
    public Color getColorById(Integer id) {
        return colorRepository.findById(id).orElse(null);
    }
}
