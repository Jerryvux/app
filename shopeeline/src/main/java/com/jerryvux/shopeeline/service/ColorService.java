package com.jerryvux.shopeeline.service;

import com.jerryvux.shopeeline.model.Color;
import java.util.List;

public interface ColorService {

    List<Color> getAllColors();

    Color getColorById(Integer id);
}
